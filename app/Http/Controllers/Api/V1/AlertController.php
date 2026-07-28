<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 50);
        $alerts  = $request->user()->alerts()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data'         => AlertResource::collection($alerts->items()),
            'unread_count' => $request->user()->alerts()->where('is_read', false)->count(),
            'pagination'   => [
                'total'        => $alerts->total(),
                'per_page'     => $alerts->perPage(),
                'current_page' => $alerts->currentPage(),
                'last_page'    => $alerts->lastPage(),
            ],
        ]);
    }

    public function markRead(Request $request, Alert $alert): JsonResponse
    {
        if ($alert->user_id !== $request->user()->id) abort(403);
        $alert->update(['is_read' => true]);

        return response()->json(['message' => 'Alerta marcada como leída.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->alerts()->update(['is_read' => true]);
        return response()->json(['message' => 'Todas las alertas marcadas como leídas.']);
    }

    public function destroy(Request $request, Alert $alert): JsonResponse
    {
        if ($alert->user_id !== $request->user()->id) abort(403);
        $alert->delete();

        return response()->json(['message' => 'Alerta eliminada.']);
    }
}

