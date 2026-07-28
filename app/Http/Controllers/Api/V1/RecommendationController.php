<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecommendationResource;
use App\Models\Recommendation;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage        = min((int) $request->get('per_page', 10), 50);
        $recommendations = $request->user()->recommendations()
            ->where('is_dismissed', false)
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data'       => RecommendationResource::collection($recommendations->items()),
            'pagination' => [
                'total'        => $recommendations->total(),
                'per_page'     => $recommendations->perPage(),
                'current_page' => $recommendations->currentPage(),
                'last_page'    => $recommendations->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, Recommendation $recommendation): JsonResponse
    {
        if ($recommendation->user_id !== $request->user()->id) abort(403);
        return response()->json(new RecommendationResource($recommendation));
    }

    public function dismiss(Request $request, Recommendation $recommendation): JsonResponse
    {
        if ($recommendation->user_id !== $request->user()->id) abort(403);
        $recommendation->update(['is_dismissed' => true]);

        return response()->json(['message' => 'Recomendación descartada.']);
    }

    public function sendWhatsApp(Request $request, Recommendation $recommendation): JsonResponse
    {
        if ($recommendation->user_id !== $request->user()->id) abort(403);

        $user = $request->user();
        if (! $user->phone) {
            return response()->json(['message' => 'No tienes un número de teléfono registrado.'], 422);
        }

        try {
            $metaWa  = app(WhatsAppService::class);
            $message = "💡 *Cazador de Gastos — Recomendación*\n\n"
                . "*{$recommendation->title}*\n\n"
                . $recommendation->message;

            if ($recommendation->potential_saving) {
                $message .= "\n\n💰 Ahorro estimado: \${$recommendation->potential_saving}";
            }

            $metaWa->sendWhatsApp($user->phone, $message);
            $recommendation->update(['whatsapp_sent' => true]);

            return response()->json(['message' => 'Recomendación enviada por WhatsApp.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se pudo enviar el mensaje: ' . $e->getMessage()], 500);
        }
    }
}

