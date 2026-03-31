<?php

namespace App\Http\Requests;

use App\Enums\EmployeeDepartment;
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

        $genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
        $maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
        $employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'display_name' => ['required', 'string', 'max:200'],
            'given_names' => ['nullable', 'string', 'max:200'],
            'gender' => ['nullable', 'string', Rule::in($genders)],
            'marital_status' => ['nullable', 'string', Rule::in($maritalStatuses)],
            'profile_photo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'designation' => ['nullable', 'string', 'max:150'],
            'department' => ['nullable', 'string', Rule::in(EmployeeDepartment::values())],
            'employment_type' => ['nullable', 'string', Rule::in($employmentTypes)],
            'basic_salary' => ['nullable', 'numeric', 'min:0'],
            'is_overtime_eligible' => ['boolean'],
            'nic' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(EmployeeStatus::values())],
            'joined_date' => ['nullable', 'date'],
            'date_of_birth' => ['nullable', 'date'],
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
            'epf_number' => ['nullable', 'string', 'max:100'],
            'etf_number' => ['nullable', 'string', 'max:100'],
            'emergency_contact_person' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => [
                'nullable',
                'string',
                'max:50',
                // Require a reasonable number of digits and allow common formatting chars.
                // Examples: "+94 771234567", "+1 (555) 123-4567", "771234567"
                'regex:/^(?=(?:.*\d){6,15}$)[+\d\s\-()]+$/',
            ],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }
}
