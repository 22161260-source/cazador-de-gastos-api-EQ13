<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category_id'    => ['nullable', 'exists:categories,id'],
            'description'    => ['sometimes', 'string', 'min:3', 'max:255'],
            'amount'         => ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'],
            'date'           => ['sometimes', 'date', 'before_or_equal:today'],
            'recurrence'     => ['nullable', 'in:none,weekly,biweekly,monthly'],
            'is_unnecessary' => ['nullable', 'boolean'],
            'notes'          => ['nullable', 'string', 'max:1000'],
            'tag_ids'        => ['nullable', 'array'],
            'tag_ids.*'      => ['exists:tags,id'],
        ];
    }
}

