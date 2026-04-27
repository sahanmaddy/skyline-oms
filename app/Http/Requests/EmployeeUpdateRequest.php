<?php

namespace App\Http\Requests;

use App\Enums\EmployeeDepartment;
use App\Enums\EmployeeStatus;
use App\Models\Employee;
use App\Models\User;
use App\Services\Branches\BranchScopeService;
use Illuminate\Contracts\Validation\Validator;
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
        $actor = $this->user();
        $allowedBranches = $actor
            ? app(BranchScopeService::class)->assignableBranchIdsForValidation($actor, (int) $employee->branch_id)
            : [];

        $genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
        $maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
        $employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];

        return [
            'branch_id' => ['required', 'integer', Rule::in($allowedBranches)],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'display_name' => ['required', 'string', 'max:200'],
            'given_names' => ['nullable', 'string', 'max:200'],
            'gender' => ['required', 'string', Rule::in($genders)],
            'marital_status' => ['required', 'string', Rule::in($maritalStatuses)],
            'profile_photo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'remove_profile_photo' => ['sometimes', 'boolean'],
            'email' => ['required', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->id)],
            'designation' => ['required', 'string', 'max:150'],
            'department' => ['required', 'string', Rule::in(EmployeeDepartment::values())],
            'employment_type' => ['required', 'string', Rule::in($employmentTypes)],
            'basic_salary' => ['required', 'numeric', 'min:0', 'regex:'.Employee::BASIC_SALARY_VALIDATION_REGEX],
            'is_overtime_eligible' => ['boolean'],
            'nic' => ['required', 'string', 'max:50'],
            'status' => ['required', Rule::in(EmployeeStatus::values())],
            'joined_date' => ['required', 'date'],
            'date_of_birth' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'state_province' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:40'],
            'country' => ['required', 'string', 'max:120'],
            'bank_name' => ['required', 'string', 'max:150'],
            'bank_branch' => ['required', 'string', 'max:150'],
            'bank_account_number' => ['required', 'string', 'max:100'],
            'tin_number' => ['nullable', 'string', 'max:100'],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) use ($employee) {
                    $branchId = (int) $this->input('branch_id');
                    $query->where('branch_id', $branchId)
                        ->where(function ($q) use ($employee) {
                            $q->whereNotExists(function ($sub) {
                                $sub->selectRaw('1')
                                    ->from('employees')
                                    ->whereColumn('employees.user_id', 'users.id')
                                    ->whereNull('employees.deleted_at');
                            })->orWhereExists(function ($sub) use ($employee) {
                                $sub->selectRaw('1')
                                    ->from('employees')
                                    ->whereColumn('employees.user_id', 'users.id')
                                    ->where('employees.id', $employee->id)
                                    ->whereNull('employees.deleted_at');
                            });
                        });
                }),
                Rule::unique('employees', 'user_id')->ignore($employee->id),
            ],
            'is_sales_commission_eligible' => ['boolean'],
            'epf_number' => ['nullable', 'string', 'max:100'],
            'etf_number' => ['nullable', 'string', 'max:100'],
            'emergency_contact_person' => ['required', 'string', 'max:150'],
            'emergency_phone_numbers' => ['required', 'array', 'min:1'],
            'emergency_phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:emergency_phone_numbers.*.country_code,emergency_phone_numbers.*.phone_number'],
            'emergency_phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:emergency_phone_numbers.*.phone_type,emergency_phone_numbers.*.phone_number'],
            'emergency_phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'emergency_phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:emergency_phone_numbers.*.phone_type,emergency_phone_numbers.*.country_code'],
            'emergency_phone_numbers.*.is_primary' => ['boolean'],
            'phone_numbers' => ['required', 'array', 'min:1'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        /** @var Employee $employee */
        $employee = $this->route('employee');

        $validator->after(function (Validator $validator): void {
            $branchId = (int) $this->input('branch_id');
            $userId = $this->input('user_id');
            if (! $branchId || ! $userId) {
                return;
            }

            $user = User::query()->find((int) $userId);
            if ($user && (int) $user->branch_id !== $branchId) {
                $validator->errors()->add(
                    'user_id',
                    'The linked user must have the same default branch as this employee.',
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'display_name.required' => 'Display name is required.',
            'nic.required' => 'NIC is required.',
            'gender.required' => 'Gender is required.',
            'marital_status.required' => 'Marital status is required.',
            'date_of_birth.required' => 'Date of birth is required.',
            'designation.required' => 'Designation is required.',
            'department.required' => 'Department is required.',
            'employment_type.required' => 'Employment type is required.',
            'joined_date.required' => 'Joined date is required.',
            'basic_salary.required' => 'Basic salary is required.',
            'basic_salary.regex' => 'Basic salary may not exceed 9,999,999,999.99 and may have at most two decimal places.',
            'email.required' => 'Email is required.',
            'address_line_1.required' => 'Address Line 1 is required.',
            'city.required' => 'City is required.',
            'country.required' => 'Country is required.',
            'bank_name.required' => 'Bank name is required.',
            'bank_branch.required' => 'Branch is required.',
            'bank_account_number.required' => 'Bank account number is required.',
            'emergency_contact_person.required' => 'Contact person is required.',
            'phone_numbers.required' => 'At least one phone number is required.',
            'phone_numbers.min' => 'At least one phone number is required.',
            'phone_numbers.*.phone_number.required_with' => 'Phone number is required.',
            'phone_numbers.*.country_code.required_with' => 'Code is required.',
            'phone_numbers.*.phone_type.required_with' => 'Phone type is required.',
            'emergency_phone_numbers.required' => 'At least one emergency contact phone number is required.',
            'emergency_phone_numbers.min' => 'At least one emergency contact phone number is required.',
            'emergency_phone_numbers.*.phone_number.required_with' => 'Emergency contact phone number is required.',
            'emergency_phone_numbers.*.country_code.required_with' => 'Code is required.',
            'emergency_phone_numbers.*.phone_type.required_with' => 'Emergency contact phone type is required.',
        ];
    }
}
