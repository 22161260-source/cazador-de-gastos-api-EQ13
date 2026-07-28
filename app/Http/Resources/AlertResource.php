<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'message'    => $this->message,
            'type'       => $this->type,
            'channel'    => $this->channel,
            'is_read'    => $this->is_read,
            'sent_at'    => $this->sent_at?->toDateTimeString(),
            'created_at' => $this->created_at?->diffForHumans(),
        ];
    }
}

