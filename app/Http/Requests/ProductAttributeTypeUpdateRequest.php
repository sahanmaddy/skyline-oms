<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductAttributeTypeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $type = $this->route('product_attribute_type');

        return $type && $this->user()?->can('update', $type);
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
        $type = $this->route('product_attribute_type');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_attribute_types', 'name')->ignore($type?->id),
            ],
            'description' => ['nullable', 'string', 'max:65535'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999999'],
        ];
    }
}
