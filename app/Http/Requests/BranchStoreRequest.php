<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BranchStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Branch::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }
    }
}
