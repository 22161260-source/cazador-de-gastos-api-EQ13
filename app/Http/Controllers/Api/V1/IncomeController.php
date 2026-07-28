<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Income\StoreIncomeRequest;
use App\Http\Resources\IncomeResource;
use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = $user->isAdmin()
            ? Income::with(['user', 'category'])
            : $user->incomes()->with(['category']);

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

        $perPage = min((int) $request->get('per_page', 10), 50);
        $incomes = $query->orderBy('date', 'desc')->paginate($perPage);

        return response()->json([
            'data'       => IncomeResource::collection($incomes->items()),
            'pagination' => [
                'total'        => $incomes->total(),
                'per_page'     => $incomes->perPage(),
                'current_page' => $incomes->currentPage(),
                'last_page'    => $incomes->lastPage(),
            ],
        ]);
    }

    public function store(StoreIncomeRequest $request): JsonResponse
    {
        $income = $request->user()->incomes()->create($request->validated());

        return response()->json([
            'message' => 'Ingreso registrado correctamente.',
            'data'    => new IncomeResource($income->load('category')),
        ], 201);
    }

    public function show(Request $request, Income $income): JsonResponse
    {
        $this->authorizeIncome($request, $income);
        return response()->json(new IncomeResource($income->load('category')));
    }

    public function update(StoreIncomeRequest $request, Income $income): JsonResponse
    {
        $this->authorizeIncome($request, $income);
        $income->update($request->validated());

        return response()->json([
            'message' => 'Ingreso actualizado correctamente.',
            'data'    => new IncomeResource($income->load('category')),
        ]);
    }

    public function destroy(Request $request, Income $income): JsonResponse
    {
        $this->authorizeIncome($request, $income);
        $income->delete();

        return response()->json(['message' => 'Ingreso eliminado correctamente.']);
    }

    private function authorizeIncome(Request $request, Income $income): void
    {
        if (! $request->user()->isAdmin() && $income->user_id !== $request->user()->id) {
            abort(403, 'No tienes permisos para acceder a este ingreso.');
        }
    }
}

