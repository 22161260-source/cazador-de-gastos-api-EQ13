<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->get('per_page', 15), 100);
        $users   = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'       => UserResource::collection($users->items()),
            'pagination' => [
                'total'        => $users->total(),
                'per_page'     => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'role_id'  => ['required', 'exists:roles,id'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role_id'   => $request->role_id,
            'phone'     => $request->phone,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data'    => new UserResource($user->load('role')),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(new UserResource($user->load('role')));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name'    => ['sometimes', 'string', 'max:100'],
            'email'   => ['sometimes', 'email', 'unique:users,email,' . $user->id],
            'role_id' => ['sometimes', 'exists:roles,id'],
            'phone'   => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($request->only('name', 'email', 'role_id', 'phone'));

        return response()->json([
            'message' => 'Usuario actualizado.',
            'data'    => new UserResource($user->load('role')),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'No puedes eliminar al administrador.'], 403);
        }
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => ! $user->is_active]);
        $status = $user->is_active ? 'activado' : 'desactivado';

        return response()->json(['message' => "Usuario {$status} correctamente."]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name'         => ['sometimes', 'string', 'max:100'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'password'     => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'avatar'       => ['nullable', 'image', 'max:2048'],
        ]);

        $data = $request->only('name', 'phone');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'data'    => new UserResource($user->load('role')),
        ]);
    }
}

