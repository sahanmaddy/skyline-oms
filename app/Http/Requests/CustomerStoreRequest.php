<?php

namespace App\Http\Requests;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\RequiredIf;

class CustomerStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Customer::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'display_name' => ['required', 'string', 'max:200'],
            'customer_name' => ['required', 'string', 'max:200'],
            'company_name' => ['nullable', 'string', 'max:200'],
            'nic' => ['nullable', 'string', 'max:50'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'tin_number' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['required', Rule::in(CustomerStatus::values())],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'credit_eligible' => ['boolean'],
            'credit_limit' => [
                new RequiredIf(fn () => $this->boolean('credit_eligible')),
                'nullable',
                'numeric',
                'min:0',
            ],
            'guarantor' => [
                new RequiredIf(fn () => $this->boolean('credit_eligible')),
                'nullable',
                'string',
                'max:200',
            ],
            'notes' => ['nullable', 'string'],
            'phone_numbers' => ['required', 'array', 'min:1'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $displayName = trim((string) $this->input('display_name', ''));
        $customerName = trim((string) $this->input('customer_name', ''));

        if ($displayName === '' && $customerName !== '') {
            $this->merge([
                'display_name' => $customerName,
            ]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! Customer::query()->where('customer_code', Customer::CASH_CUSTOMER_CODE)->exists()) {
                return;
            }

            $displayName = trim((string) $this->input('display_name'));
            $customerName = trim((string) $this->input('customer_name'));

            if (strcasecmp($displayName, Customer::CASH_CUSTOMER_DISPLAY_NAME) === 0) {
                $validator->errors()->add(
                    'display_name',
                    'This display name is reserved for the system Cash Customer.',
                );
            }

            if (strcasecmp($customerName, Customer::CASH_CUSTOMER_NAME) === 0) {
                $validator->errors()->add(
                    'customer_name',
                    'This customer name is reserved for the system Cash Customer.',
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Customer name is required.',
            'phone_numbers.required' => 'At least one phone number is required.',
            'phone_numbers.min' => 'At least one phone number is required.',
            'phone_numbers.*.phone_number.required_with' => 'Phone number is required.',
            'phone_numbers.*.country_code.required_with' => 'Code is required.',
            'phone_numbers.*.phone_type.required_with' => 'Phone type is required.',
            'credit_limit.required' => 'Credit amount is required when credit is eligible.',
            'credit_limit.numeric' => 'Credit amount must be a valid number.',
            'guarantor.required' => 'Guarantor is required when credit is eligible.',
        ];
    }
}
