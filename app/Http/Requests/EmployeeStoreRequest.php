<?php

namespace App\Http\Requests;

use App\Enums\EmployeeDepartment;
use App\Enums\EmployeeStatus;
use App\Models\User;
use App\Services\Branches\BranchScopeService;
use Illuminate\Contracts\Validation\Validator;
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
        $actor = $this->user();
        $allowedBranches = $actor
            ? app(BranchScopeService::class)->assignableBranchIdsForValidation($actor, null)
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
            'gender' => ['nullable', 'string', Rule::in($genders)],
            'marital_status' => ['nullable', 'string', Rule::in($maritalStatuses)],
            'profile_photo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'remove_profile_photo' => ['sometimes', 'boolean'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
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
            'tin_number' => ['nullable', 'string', 'max:100'],
            'epf_number' => ['nullable', 'string', 'max:100'],
            'etf_number' => ['nullable', 'string', 'max:100'],
            'emergency_contact_person' => ['nullable', 'string', 'max:150'],
            'emergency_phone_numbers' => ['array'],
            'emergency_phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:emergency_phone_numbers.*.country_code,emergency_phone_numbers.*.phone_number'],
            'emergency_phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:emergency_phone_numbers.*.phone_type,emergency_phone_numbers.*.phone_number'],
            'emergency_phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'emergency_phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:emergency_phone_numbers.*.phone_type,emergency_phone_numbers.*.country_code'],
            'emergency_phone_numbers.*.is_primary' => ['boolean'],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('branch_id', (int) $this->input('branch_id'))
                        ->whereNotExists(function ($sub) {
                            $sub->selectRaw('1')
                                ->from('employees')
                                ->whereColumn('employees.user_id', 'users.id')
                                ->whereNull('employees.deleted_at');
                        });
                }),
            ],
            'is_sales_commission_eligible' => ['boolean'],
            'phone_numbers' => ['array'],
            'phone_numbers.*.phone_type' => ['nullable', 'string', Rule::in(['Land Phone', 'Mobile', 'WhatsApp']), 'required_with:phone_numbers.*.country_code,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_code' => ['nullable', 'string', 'max:10', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.phone_number'],
            'phone_numbers.*.country_iso2' => ['nullable', 'string', 'size:2', 'regex:/^[A-Za-z]{2}$/'],
            'phone_numbers.*.phone_number' => ['nullable', 'string', 'max:50', 'required_with:phone_numbers.*.phone_type,phone_numbers.*.country_code'],
            'phone_numbers.*.is_primary' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
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
}
