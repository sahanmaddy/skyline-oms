<?php

namespace App\Http\Requests;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
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
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where(function ($query) use ($userModel) {
                    $query->where('is_active', true)
                        ->orWhere('id', $userModel->branch_id);
                }),
            ],
            'employee_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where(function ($query) use ($userModel) {
                    $query->where(function ($q) use ($userModel) {
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
}
