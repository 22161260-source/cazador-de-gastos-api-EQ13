<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['required', 'string', 'min:3', 'max:255'],
            'amount'      => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'date'        => ['required', 'date', 'before_or_equal:today'],
            'recurrence'  => ['nullable', 'in:none,weekly,biweekly,monthly'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'tag_ids'     => ['nullable', 'array'],
            'tag_ids.*'   => ['exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'La descripción es obligatoria.',
            'description.min'      => 'La descripción debe tener al menos 3 caracteres.',
            'amount.required'      => 'El monto es obligatorio.',
            'amount.numeric'       => 'El monto debe ser un número.',
            'amount.min'           => 'El monto debe ser mayor a 0.',
            'date.required'        => 'La fecha es obligatoria.',
            'date.before_or_equal' => 'No puedes registrar gastos futuros.',
            'category_id.exists'   => 'La categoría seleccionada no existe.',
        ];
    }
}

