<?php

namespace App\Http\Requests;

use App\Enums\CustomerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Customer::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:200'],
            'company_name' => ['nullable', 'string', 'max:200'],
            'contact_person' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['required', Rule::in(CustomerStatus::values())],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'credit_eligible' => ['boolean'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'guarantor' => ['nullable', 'string', 'max:200'],
            'notes' => ['nullable', 'string'],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }
}

