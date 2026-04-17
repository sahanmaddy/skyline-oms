<?php

namespace App\Http\Requests;

use DateTimeZone;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class CompanySettingsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $setting = \App\Models\CompanySetting::current();

        return $this->user()?->can('update', $setting) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $phoneTypes = ['Mobile', 'Land Phone', 'WhatsApp'];
        $tzList = DateTimeZone::listIdentifiers();

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'registered_address' => ['nullable', 'string', 'max:5000'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'max:120'],
            'company_email' => ['required', 'email', 'max:255'],
            'tin_number' => ['nullable', 'string', 'max:100'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'time_zone' => ['required', 'string', Rule::in($tzList)],
            'currency_code' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'currency_symbol' => ['required', 'string', 'max:32'],
            'currency_format' => ['required', 'string', 'max:120'],
            'system_country' => ['required', 'string', 'max:120'],
            'remove_site_icon' => ['sometimes', 'boolean'],
            'site_icon' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'phone_numbers' => ['required', 'array', 'min:1'],
            'phone_numbers.*.id' => ['nullable', 'integer', 'exists:company_phone_numbers,id'],
            'phone_numbers.*.phone_type' => [
                'required',
                'string',
                Rule::in($phoneTypes),
            ],
            'phone_numbers.*.country_code' => [
                'nullable',
                'string',
                'max:10',
                'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number',
            ],
            'phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'phone_numbers.*.phone_number' => [
                'nullable',
                'string',
                'max:50',
                'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code',
            ],
            'phone_numbers.*.display_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'phone_numbers.*.is_primary' => ['nullable', 'boolean'],
            'bank_accounts' => ['required', 'array', 'min:1'],
            'bank_accounts.*.id' => ['nullable', 'integer', 'exists:company_bank_accounts,id'],
            'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.branch_name' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:100'],
            'bank_accounts.*.account_name' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.display_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'bank_accounts.*.is_primary' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $code = $this->input('currency_code');
        if (is_string($code)) {
            $this->merge(['currency_code' => strtoupper($code)]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $phones = Arr::wrap($this->input('phone_numbers', []));
            $primaries = collect($phones)->filter(fn ($r) => is_array($r) && ! empty($r['is_primary']))->count();
            if ($primaries > 1) {
                $validator->errors()->add('phone_numbers', 'Only one primary phone number may be selected.');
            }

            $banks = Arr::wrap($this->input('bank_accounts', []));
            $bankPrimaries = collect($banks)->filter(fn ($r) => is_array($r) && ! empty($r['is_primary']))->count();
            if ($bankPrimaries > 1) {
                $validator->errors()->add('bank_accounts', 'Only one primary bank account may be selected.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'address_line_1.required' => 'Address Line 1 is required.',
            'city.required' => 'City/District is required.',
            'country.required' => 'Country is required.',
            'company_email.required' => 'Company email is required.',
            'company_email.email' => 'Enter a valid company email address.',
            'time_zone.required' => 'Time zone is required.',
            'currency_code.required' => 'Currency code is required.',
            'currency_symbol.required' => 'Currency symbol is required.',
            'currency_format.required' => 'Currency display pattern is required.',
            'phone_numbers.required' => 'At least one phone number is required.',
            'phone_numbers.min' => 'At least one phone number is required.',
            'phone_numbers.*.phone_type.required' => 'Phone type is required.',
            'phone_numbers.*.phone_number.required_with' => 'Phone number is required.',
            'phone_numbers.*.country_code.required_with' => 'Code is required.',
            'phone_numbers.*.phone_type.required_with' => 'Phone type is required.',
            'bank_accounts.required' => 'At least one bank account is required.',
            'bank_accounts.min' => 'At least one bank account is required.',
            'bank_accounts.*.bank_name.required_with' => 'Bank name is required.',
            'bank_accounts.*.branch_name.required_with' => 'Branch name is required.',
            'bank_accounts.*.account_number.required_with' => 'Account number is required.',
            'bank_accounts.*.account_name.required_with' => 'Account name is required.',
            'system_country.required' => 'System country is required.',
        ];
    }
}
