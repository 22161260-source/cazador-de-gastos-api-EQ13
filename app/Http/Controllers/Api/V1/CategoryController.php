<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Category::where(function ($q) use ($user) {
            $q->whereNull('user_id')  // categorías globales
              ->orWhere('user_id', $user->id); // propias
        });

        if ($request->filled('type')) {
            $query->where(function ($q) use ($request) {
                $q->where('type', $request->type)->orWhere('type', 'both');
            });
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $perPage    = min((int) $request->get('per_page', 20), 100);
        $categories = $query->orderBy('is_system', 'desc')->orderBy('name')->paginate($perPage);

        return response()->json([
            'data'       => CategoryResource::collection($categories->items()),
            'pagination' => [
                'total'        => $categories->total(),
                'per_page'     => $categories->perPage(),
                'current_page' => $categories->currentPage(),
                'last_page'    => $categories->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'icon'      => ['nullable', 'string', 'max:10'],
            'color'     => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'type'      => ['nullable', Rule::in(['expense', 'income', 'both'])],
            'is_system' => ['nullable', 'boolean'],
        ]);

        $isSystem = $request->user()->isAdmin() ? (bool)$request->is_system : false;
        $userId   = $isSystem ? null : $request->user()->id;

        $category = Category::create([
            'name'      => $request->name,
            'icon'      => $request->icon,
            'color'     => $request->color ?? '#6366f1',
            'type'      => $request->type ?? 'both',
            'is_system' => $isSystem,
            'user_id'   => $userId,
        ]);

        return response()->json([
            'message' => 'Categoría creada correctamente.',
            'data'    => new CategoryResource($category),
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(new CategoryResource($category));
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        if ($category->is_system && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No puedes modificar categorías del sistema.'], 403);
        }

        $request->validate([
            'name'  => ['sometimes', 'string', 'max:100'],
            'icon'  => ['nullable', 'string', 'max:10'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'type'  => ['nullable', Rule::in(['expense', 'income', 'both'])],
        ]);

        $category->update($request->only('name', 'icon', 'color', 'type'));

        return response()->json([
            'message' => 'Categoría actualizada.',
            'data'    => new CategoryResource($category),
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->is_system && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No puedes eliminar categorías del sistema.'], 403);
        }

        $category->delete();
        return response()->json(['message' => 'Categoría eliminada.']);
    }
}

