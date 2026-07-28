<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function monthly(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $query    = $request->user()->isAdmin() ? Expense::query() : $request->user()->expenses();
        $expenses = $query->whereMonth('date', $month)->whereYear('date', $year)->with('category')->get();

        $iQuery      = $request->user()->isAdmin() ? Income::query() : $request->user()->incomes();
        $totalIncome = $iQuery->whereMonth('date', $month)->whereYear('date', $year)->sum('amount');

        return response()->json([
            'month'             => $month,
            'year'              => $year,
            'total_expenses'    => $expenses->sum('amount'),
            'total_income'      => $totalIncome,
            'balance'           => $totalIncome - $expenses->sum('amount'),
            'unnecessary_total' => $expenses->where('is_unnecessary', true)->sum('amount'),
            'by_category'       => $expenses->groupBy('category_id')->map(fn ($items) => [
                'category' => $items->first()->category?->name ?? 'Sin categoría',
                'total'    => $items->sum('amount'),
                'count'    => $items->count(),
            ])->values(),
        ]);
    }

    public function savings(Request $request): JsonResponse
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $q     = $request->user()->isAdmin() ? Expense::query() : $request->user()->expenses();
            $total = $q->whereMonth('date', $date->month)->whereYear('date', $date->year)->sum('amount');

            $iq     = $request->user()->isAdmin() ? Income::query() : $request->user()->incomes();
            $income = $iq->whereMonth('date', $date->month)->whereYear('date', $date->year)->sum('amount');

            $months[] = ['month' => $date->translatedFormat('M Y'), 'expenses' => (float) $total, 'income' => (float) $income, 'savings' => (float) ($income - $total)];
        }

        return response()->json(['data' => $months]);
    }

    public function unnecessaryExpenses(Request $request): JsonResponse
    {
        $query    = $request->user()->isAdmin() ? Expense::with(['user', 'category']) : $request->user()->expenses()->with('category');
        $expenses = $query->where('is_unnecessary', true)->orderBy('amount', 'desc')->paginate(10);

        return response()->json([
            'data'       => $expenses->items(),
            'pagination' => ['total' => $expenses->total(), 'per_page' => $expenses->perPage(), 'current_page' => $expenses->currentPage(), 'last_page' => $expenses->lastPage()],
        ]);
    }

    public function usersOverview(Request $request): JsonResponse
    {
        $users = User::with('role')->withCount(['expenses', 'incomes'])->withSum('expenses', 'amount')->paginate(15);

        return response()->json([
            'data'       => UserResource::collection($users->items()),
            'pagination' => ['total' => $users->total(), 'per_page' => $users->perPage(), 'current_page' => $users->currentPage(), 'last_page' => $users->lastPage()],
        ]);
    }
}

