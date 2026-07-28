<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'description', 'amount',
        'date', 'recurrence', 'is_unnecessary', 'notes', 'receipt_path',
    ];

    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'amount'       => 'decimal:2',
            'is_unnecessary' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'expense_tags')->withTimestamps();
    }
}

