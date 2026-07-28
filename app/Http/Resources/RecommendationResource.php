<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'message'          => $this->message,
            'potential_saving' => (float) $this->potential_saving,
            'priority'         => $this->priority,
            'is_dismissed'     => $this->is_dismissed,
            'whatsapp_sent'    => $this->whatsapp_sent,
            'created_at'       => $this->created_at?->toDateString(),
        ];
    }
}

