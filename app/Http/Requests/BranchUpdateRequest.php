<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\Branch|null $branch */
        $branch = $this->route('branch');

        return $branch ? ($this->user()?->can('update', $branch) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:80', 'regex:/^[+\d\s\-().]*$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('is_active')) {
            $this->merge(['is_active' => false]);
        }
    }
}
