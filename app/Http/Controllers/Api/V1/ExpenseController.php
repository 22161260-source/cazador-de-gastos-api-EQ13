<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Alert;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\Recommendation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = $user->isAdmin()
            ? Expense::with(['user', 'category', 'tags'])
            : $user->expenses()->with(['category', 'tags']);

        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }
        if ($request->filled('is_unnecessary')) {
            $query->where('is_unnecessary', filter_var($request->is_unnecessary, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->get('per_page', 10), 50);
        $expenses = $query->orderBy('date', 'desc')->paginate($perPage);

        return response()->json([
            'data'       => ExpenseResource::collection($expenses->items()),
            'pagination' => [
                'total'        => $expenses->total(),
                'per_page'     => $expenses->perPage(),
                'current_page' => $expenses->currentPage(),
                'last_page'    => $expenses->lastPage(),
            ],
        ]);
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $user    = $request->user();
        $expense = $user->expenses()->create($request->validated());

        if ($request->filled('tag_ids')) {
            $expense->tags()->sync($request->tag_ids);
        }

        $this->checkBudgetAlert($user, $expense);

        $this->syncRecommendations($user, $expense->date->month, $expense->date->year);

        return response()->json([
            'message' => 'Gasto registrado correctamente.',
            'data'    => new ExpenseResource($expense->load(['category', 'tags'])),
        ], 201);
    }

    public function show(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($request, $expense);

        return response()->json(new ExpenseResource($expense->load(['category', 'tags'])));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($request, $expense);

        $expense->update($request->validated());

        if ($request->has('tag_ids')) {
            $expense->tags()->sync($request->tag_ids ?? []);
        }

        $this->syncRecommendations($request->user(), $expense->date->month, $expense->date->year);

        return response()->json([
            'message' => 'Gasto actualizado correctamente.',
            'data'    => new ExpenseResource($expense->load(['category', 'tags'])),
        ]);
    }

    public function destroy(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeExpense($request, $expense);
        
        $month = $expense->date->month;
        $year = $expense->date->year;
        
        $expense->delete();

        $this->syncRecommendations($request->user(), $month, $year);

        return response()->json(['message' => 'Gasto eliminado correctamente.']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user  = $request->user();
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $expenses = $user->expenses()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->with('category')
            ->get();

        $byCategory = $expenses->groupBy('category_id')->map(function ($items) {
            return [
                'category'  => $items->first()->category?->name ?? 'Sin categoría',
                'color'     => $items->first()->category?->color ?? '#94a3b8',
                'total'     => $items->sum('amount'),
                'count'     => $items->count(),
            ];
        })->values();

        $incomeTotal = $user->incomes()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');

        return response()->json([
            'total_expenses'     => $expenses->sum('amount'),
            'total_income'       => $incomeTotal,
            'balance'            => $incomeTotal - $expenses->sum('amount'),
            'unnecessary_total'  => $expenses->where('is_unnecessary', true)->sum('amount'),
            'by_category'        => $byCategory,
        ]);
    }

    private function authorizeExpense(Request $request, Expense $expense): void
    {
        $user = $request->user();
        if (! $user->isAdmin() && $expense->user_id !== $user->id) {
            abort(403, 'No tienes permisos para acceder a este gasto.');
        }
    }

    private function checkBudgetAlert(mixed $user, Expense $expense): void
    {
        if (! $expense->category_id) return;

        $month  = $expense->date->month;
        $year   = $expense->date->year;
        $budget = Budget::where('user_id', $user->id)
            ->where('category_id', $expense->category_id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if (! $budget || $budget->alert_sent) return;

        $spent = $user->expenses()
            ->where('category_id', $expense->category_id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');

        $percentage = ($spent / $budget->amount) * 100;

        if ($percentage >= 80) {
            Alert::create([
                'user_id' => $user->id,
                'title'   => '⚠️ Has alcanzado el 80% de tu presupuesto',
                'message' => "Has gastado \${$spent} de \${$budget->amount} en {$expense->category->name} este mes.",
                'type'    => $percentage >= 100 ? 'danger' : 'warning',
                'channel' => 'app',
            ]);

            if ($user->phone) {
                try {
                    app(\App\Services\WhatsAppService::class)->sendWhatsApp(
                        $user->phone,
                        "Cazador de Gastos: Llevas el {$percentage}% de tu presupuesto en {$expense->category->name}."
                    );
                } catch (\Exception $e) {
                    \Log::warning('WhatsApp no enviado: ' . $e->getMessage());
                }
            }

            $budget->update(['alert_sent' => true]);
        }
    }
    private function syncRecommendations(mixed $user, int $month, int $year): void
    {
        $entCategory = \App\Models\Category::where('name', 'Entretenimiento')->first();
        if ($entCategory) {
            $subscriptionsCount = $user->expenses()
                ->where('category_id', $entCategory->id)
                ->where('recurrence', '!=', 'none')
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->count();

            if ($subscriptionsCount >= 3) {
                Recommendation::firstOrCreate(
                    ['user_id' => $user->id, 'title' => 'Cancela suscripciones no usadas'],
                    [
                        'message'          => 'Hemos detectado 3 o más pagos recurrentes en Entretenimiento este mes (como Netflix, Spotify, etc). Considera cancelar las que menos usas para ahorrar más dinero cada mes.',
                        'potential_saving' => 300,
                        'priority'         => 'high',
                    ]
                );
            } else {
                Recommendation::where('user_id', $user->id)
                    ->where('title', 'Cancela suscripciones no usadas')
                    ->forceDelete();
            }
        }

        $totalExpenses = $user->expenses()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');

        $totalIncomes = $user->incomes()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('amount');

        if ($totalIncomes > 0 && $totalExpenses > $totalIncomes) {
            $difference = $totalExpenses - $totalIncomes;
            
            $rec = Recommendation::firstOrNew(
                ['user_id' => $user->id, 'title' => 'Estás gastando más de lo que ingresas']
            );
            $rec->message = 'Este mes tus gastos superan tus ingresos por $' . number_format($difference, 2) . '. Frena los gastos no esenciales para evitar endeudarte.';
            $rec->potential_saving = $difference;
            $rec->priority = 'high';
            $rec->save();
        } else {
            Recommendation::where('user_id', $user->id)
                ->where('title', 'Estás gastando más de lo que ingresas')
                ->forceDelete();
        }
    }
}

