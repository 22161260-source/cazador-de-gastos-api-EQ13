<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->role) {
            return response()->json([
                'message' => 'No autenticado o sin rol asignado.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! in_array($user->role->name, $roles)) {
            return response()->json([
                'message' => 'No tienes permisos para acceder a este recurso.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}

