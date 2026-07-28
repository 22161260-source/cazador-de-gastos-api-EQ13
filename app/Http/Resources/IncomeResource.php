<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'description' => $this->description,
            'amount'      => (float) $this->amount,
            'date'        => $this->date?->toDateString(),
            'recurrence'  => $this->recurrence,
            'notes'       => $this->notes,
            'category'    => $this->whenLoaded('category', fn () => [
                'id'    => $this->category->id,
                'name'  => $this->category->name,
                'icon'  => $this->category->icon,
                'color' => $this->category->color,
            ]),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}

