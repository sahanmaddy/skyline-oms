<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnitOfMeasureUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $unit = $this->route('unit_of_measure');

        return $unit && $this->user()?->can('update', $unit);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $unit = $this->route('unit_of_measure');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('unit_of_measures', 'name')->ignore($unit?->id),
            ],
            'symbol' => ['required', 'string', 'max:32'],
            'decimal_precision' => ['required', 'integer', 'min:0', 'max:6'],
            'allow_decimal' => ['required', 'boolean'],
            'is_base_unit' => ['sometimes', 'boolean'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'description' => ['nullable', 'string', 'max:65535'],
        ];
    }
}
