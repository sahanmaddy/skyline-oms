<?php

namespace App\Http\Requests;

use App\Enums\EmployeeStatus;
use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Employee|null $employee */
        $employee = $this->route('employee');

        return $employee ? $this->user()?->can('update', $employee) : false;
    }

    public function rules(): array
    {
        /** @var Employee $employee */
        $employee = $this->route('employee');

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'display_name' => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
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
            'user_id' => ['nullable', 'integer', 'exists:users,id', Rule::unique('employees', 'user_id')->ignore($employee->id)],
            'is_sales_commission_eligible' => ['boolean'],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile'])],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }
}
