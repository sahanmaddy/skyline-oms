<?php

namespace App\Http\Requests;

use App\Enums\EmployeeStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Employee::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'display_name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
            'designation' => ['nullable', 'string', 'max:150'],
            'department' => ['nullable', 'string', 'max:150'],
            'nic' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(EmployeeStatus::values())],
            'joined_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'bank_name' => ['nullable', 'string', 'max:150'],
            'bank_branch' => ['nullable', 'string', 'max:150'],
            'bank_account_number' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer', 'exists:users,id', 'unique:employees,user_id'],
            'is_sales_commission_eligible' => ['boolean'],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile'])],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }
}
