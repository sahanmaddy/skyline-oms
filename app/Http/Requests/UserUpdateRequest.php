<?php

namespace App\Http\Requests;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use App\Services\Branches\BranchScopeService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $userModel */
        $userModel = $this->route('user');

        return $userModel ? ($this->user()?->can('update', $userModel) ?? false) : false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('employee_id') && $this->input('employee_id') === '') {
            $this->merge(['employee_id' => null]);
        }
    }

    public function rules(): array
    {
        /** @var User $userModel */
        $userModel = $this->route('user');
        $actor = $this->user();
        $allowedBranches = $actor
            ? app(BranchScopeService::class)->assignableBranchIdsForUserFormValidation($actor, (int) $userModel->branch_id)
            : [];

        $roleExistsRule = Rule::exists((new Role)->getTable(), 'name')
            ->where(function ($query) {
                $query->where('guard_name', 'web');

                if (Schema::hasColumn((new Role)->getTable(), 'is_active')) {
                    $query->where('is_active', true);
                }
            });

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userModel->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'string',
                $roleExistsRule,
            ],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_ids' => ['required', 'array', 'min:1'],
            'branch_ids.*' => ['integer', Rule::in($allowedBranches)],
            'branch_id' => ['required', 'integer', Rule::in($allowedBranches)],
            'employee_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where(function ($query) use ($userModel) {
                    $query->where('branch_id', (int) $this->input('branch_id'))
                        ->where(function ($q) use ($userModel) {
                            $q->whereNull('user_id')
                                ->orWhere('user_id', $userModel->id);
                        });
                }),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        /** @var User $userModel */
        $userModel = $this->route('user');

        $validator->after(function (Validator $validator): void {
            $branchId = (int) $this->input('branch_id');
            $ids = array_map('intval', (array) $this->input('branch_ids', []));
            if ($branchId && $ids !== [] && ! in_array($branchId, $ids, true)) {
                $validator->errors()->add(
                    'branch_id',
                    'The default branch must be one of the selected branches.',
                );
            }

            $empId = $this->input('employee_id');
            if (! $branchId || ! $empId) {
                return;
            }

            $employee = Employee::query()->find((int) $empId);
            if ($employee && (int) $employee->branch_id !== $branchId) {
                $validator->errors()->add(
                    'employee_id',
                    'The linked employee must belong to the same branch as this user.',
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'email.required' => 'Email is required.',
            'status.required' => 'Status is required.',
            'branch_ids.required' => 'At least one branch access is required.',
            'branch_ids.min' => 'At least one branch access is required.',
            'branch_id.required' => 'Default Branch is required.',
            'roles.required' => 'At least one role is required.',
            'roles.min' => 'At least one role is required.',
            'password.confirmed' => 'Passwords do not match.',
        ];
    }
}
