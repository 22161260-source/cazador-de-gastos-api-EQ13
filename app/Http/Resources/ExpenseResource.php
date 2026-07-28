<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'description'    => $this->description,
            'amount'         => (float) $this->amount,
            'date'           => $this->date?->toDateString(),
            'recurrence'     => $this->recurrence,
            'is_unnecessary' => $this->is_unnecessary,
            'notes'          => $this->notes,
            'category'       => $this->whenLoaded('category', fn () => [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'icon'  => $this->category->icon,
                'color' => $this->category->color,
            ]),
            'tags'       => $this->whenLoaded('tags', fn () =>
                $this->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color])
            ),
            'user'       => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}

