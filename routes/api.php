<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\IncomeController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\AlertController;
use App\Http\Controllers\Api\V1\RecommendationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('login',          [AuthController::class, 'login']);
        Route::post('register',       [AuthController::class, 'register']);
        Route::post('forgot-password',[AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::middleware(['auth:sanctum', 'ensure.active'])->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me',      [AuthController::class, 'me']);

        Route::put('profile', [UserController::class, 'updateProfile']);

        Route::get('roles', function () {
            return response()->json(\App\Models\Role::all());
        });


        Route::apiResource('categories', CategoryController::class);

        Route::apiResource('tags', TagController::class);

        Route::apiResource('expenses', ExpenseController::class);
        Route::get('expenses-stats',         [ExpenseController::class, 'stats']);

        Route::get('reports/monthly',        [ReportController::class, 'monthly']);
        Route::get('reports/savings',        [ReportController::class, 'savings']);
        Route::get('reports/unnecessary-expenses', [ReportController::class, 'unnecessaryExpenses']);

        Route::apiResource('incomes', IncomeController::class);

        Route::apiResource('budgets', BudgetController::class);

        Route::get('alerts',               [AlertController::class, 'index']);
        Route::put('alerts/{alert}/read',  [AlertController::class, 'markRead']);
        Route::put('alerts/read-all',      [AlertController::class, 'markAllRead']);
        Route::delete('alerts/{alert}',    [AlertController::class, 'destroy']);

        Route::apiResource('recommendations', RecommendationController::class)->only(['index', 'show']);
        Route::put('recommendations/{recommendation}/dismiss', [RecommendationController::class, 'dismiss']);
        Route::post('recommendations/{recommendation}/send-whatsapp', [RecommendationController::class, 'sendWhatsApp']);

        Route::middleware('role:admin,advisor')->group(function () {
            Route::get('reports/users', [ReportController::class, 'usersOverview']);
        });

        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::put('users/{user}/toggle-active', [UserController::class, 'toggleActive']);
        });
    });
});

