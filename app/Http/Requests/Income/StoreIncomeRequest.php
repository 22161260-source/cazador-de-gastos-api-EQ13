<?php

namespace App\Http\Requests\Income;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncomeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'description' => ['required', 'string', 'min:3', 'max:255'],
            'amount'      => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'date'        => ['required', 'date'],
            'recurrence'  => ['nullable', 'in:none,weekly,biweekly,monthly'],
            'notes'       => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'La descripción es obligatoria.',
            'amount.required'      => 'El monto es obligatorio.',
            'amount.min'           => 'El monto debe ser mayor a 0.',
            'date.required'        => 'La fecha es obligatoria.',
        ];
    }
}

