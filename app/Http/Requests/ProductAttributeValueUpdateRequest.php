<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductAttributeValueUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $value = $this->route('product_attribute_value');

        return $value && $this->user()?->can('update', $value);
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sort_order') && $this->input('sort_order') === '') {
            $this->merge(['sort_order' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $row = $this->route('product_attribute_value');
        $typeId = (int) $this->input('product_attribute_type_id', $row?->product_attribute_type_id);

        return [
            'product_attribute_type_id' => ['required', 'exists:product_attribute_types,id'],
            'value' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_attribute_values', 'value')
                    ->where(fn ($q) => $q->where('product_attribute_type_id', $typeId))
                    ->ignore($row?->id),
            ],
            'display_value' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999999'],
        ];
    }
}
