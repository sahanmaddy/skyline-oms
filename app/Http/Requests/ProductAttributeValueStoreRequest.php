<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductAttributeValueStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\ProductAttributeValue::class) ?? false;
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
        $typeId = (int) $this->input('product_attribute_type_id');

        return [
            'product_attribute_type_id' => ['required', 'exists:product_attribute_types,id'],
            'value' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_attribute_values', 'value')->where(
                    fn ($q) => $q->where('product_attribute_type_id', $typeId),
                ),
            ],
            'display_value' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999999'],
        ];
    }
}
