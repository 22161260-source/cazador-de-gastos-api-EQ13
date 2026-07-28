<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::where(function ($q) use ($request) {
            $q->whereNull('usuario_id')->orWhere('usuario_id', $request->user()->id);
        })->get();

        return response()->json($tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->nombre, 'color' => $t->color]));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $tag = Tag::create([
            'nombre'     => $request->name,
            'color'      => $request->color ?? '#94a3b8',
            'usuario_id' => $request->user()->isAdmin() ? null : $request->user()->id,
        ]);

        return response()->json(['message' => 'Etiqueta creada.', 'data' => ['id' => $tag->id, 'name' => $tag->nombre, 'color' => $tag->color]], 201);
    }

    public function show(Tag $tag): JsonResponse
    {
        return response()->json(['id' => $tag->id, 'name' => $tag->nombre, 'color' => $tag->color]);
    }

    public function update(Request $request, Tag $tag): JsonResponse
    {
        $request->validate(['name' => ['sometimes', 'string', 'max:50'], 'color' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/']]);

        $data = [];
        if ($request->has('name'))  $data['nombre'] = $request->name;
        if ($request->has('color')) $data['color']  = $request->color;

        $tag->update($data);
        return response()->json(['message' => 'Etiqueta actualizada.', 'data' => ['id' => $tag->id, 'name' => $tag->nombre, 'color' => $tag->color]]);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();
        return response()->json(['message' => 'Etiqueta eliminada.']);
    }
}

