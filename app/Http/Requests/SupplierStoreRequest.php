<?php

namespace App\Http\Requests;

use App\Models\Supplier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class SupplierStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Supplier::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $displayName = trim((string) $this->input('display_name', ''));
        $companyName = trim((string) $this->input('company_name', ''));

        if ($displayName === '' && $companyName !== '') {
            $this->merge(['display_name' => $companyName]);
        }

        if (is_string($this->input('currency'))) {
            $this->merge(['currency' => strtoupper(trim((string) $this->input('currency')))]);
        }
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'display_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'primary_phone_country_code' => ['nullable', 'string', 'max:10'],
            'primary_phone_number' => ['nullable', 'string', 'max:50'],
            'whatsapp_country_code' => ['nullable', 'string', 'max:10'],
            'whatsapp_number' => ['nullable', 'string', 'max:50'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'state_province' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'country' => ['nullable', 'string', 'max:120'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'tax_number' => ['nullable', 'string', 'max:100'],
            'vat_number' => ['nullable', 'string', 'max:100'],
            'payment_terms_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'currency' => ['nullable', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'bank_accounts' => ['nullable', 'array'],
            'bank_accounts.*.bank_name' => ['required_with:bank_accounts', 'string', 'max:255'],
            'bank_accounts.*.branch_name' => ['nullable', 'string', 'max:255'],
            'bank_accounts.*.account_number' => ['required_with:bank_accounts', 'string', 'max:100'],
            'bank_accounts.*.account_name' => ['nullable', 'string', 'max:255'],
            'bank_accounts.*.swift_bic_code' => ['nullable', 'string', 'max:50'],
            'bank_accounts.*.display_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'bank_accounts.*.is_primary' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $banks = Arr::wrap($this->input('bank_accounts', []));
            $bankPrimaries = collect($banks)->filter(fn ($r) => is_array($r) && ! empty($r['is_primary']))->count();
            if ($bankPrimaries > 1) {
                $validator->errors()->add('bank_accounts', 'Only one primary bank account may be selected.');
            }
        });
    }
}
