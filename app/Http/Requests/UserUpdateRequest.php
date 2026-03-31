<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
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
}
