<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $month   = $request->get('month', now()->month);
        $year    = $request->get('year', now()->year);
        $budgets = $request->user()->budgets()
            ->with('category')
            ->where('month', $month)
            ->where('year', $year)
            ->get();

        $data = $budgets->map(function ($budget) use ($request, $month, $year) {
            $spent = $request->user()->expenses()
                ->where('category_id', $budget->category_id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('amount');

            return array_merge((new BudgetResource($budget))->resolve(), [
                'spent'      => (float) $spent,
                'percentage' => $budget->amount > 0 ? round(($spent / $budget->amount) * 100, 1) : 0,
            ]);
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'amount'      => ['required', 'numeric', 'min:1'],
            'month'       => ['required', 'integer', 'min:1', 'max:12'],
            'year'        => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        $budget = Budget::updateOrCreate(
            [
                'user_id'     => $request->user()->id,
                'category_id' => $request->category_id,
                'month'       => $request->month,
                'year'        => $request->year,
            ],
            [
                'amount'      => $request->amount,
                'alert_sent'  => false,
            ]
        );

        return response()->json([
            'message' => 'Presupuesto guardado correctamente.',
            'data'    => new BudgetResource($budget->load('category')),
        ], 201);
    }

    public function show(Request $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) abort(403);
        return response()->json(new BudgetResource($budget->load('category')));
    }

    public function update(Request $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) abort(403);
        $request->validate(['amount' => ['required', 'numeric', 'min:1']]);

        $budget->update(['amount' => $request->amount, 'alert_sent' => false]);
        return response()->json(['message' => 'Presupuesto actualizado.', 'data' => new BudgetResource($budget->load('category'))]);
    }

    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        if ($budget->user_id !== $request->user()->id) abort(403);
        $budget->delete();

        return response()->json(['message' => 'Presupuesto eliminado.']);
    }
}

