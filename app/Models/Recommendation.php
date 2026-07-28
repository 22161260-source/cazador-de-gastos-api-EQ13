<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recommendation extends Model
{
    protected $fillable = [
        'user_id', 'title', 'message', 'potential_saving', 'priority', 'is_dismissed', 'whatsapp_sent',
    ];

    protected function casts(): array
    {
        return [
            'potential_saving' => 'decimal:2',
            'is_dismissed'     => 'boolean',
            'whatsapp_sent'    => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

