<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductCategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $category = $this->route('product_category');

        return $category && $this->user()?->can('update', $category);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('product_category');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_categories', 'name')->ignore($category?->id),
            ],
            'description' => ['nullable', 'string', 'max:65535'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
