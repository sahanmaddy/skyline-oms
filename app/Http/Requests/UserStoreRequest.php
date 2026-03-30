<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\User::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('employee_id') && $this->input('employee_id') === '') {
            $this->merge(['employee_id' => null]);
        }
    }

    public function rules(): array
    {
        $roleExistsRule = Rule::exists((new Role)->getTable(), 'name')
            ->where(function ($query) {
                $query->where('guard_name', 'web');

                if (Schema::hasColumn((new Role)->getTable(), 'is_active')) {
                    $query->where('is_active', true);
                }
            });

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'string',
                $roleExistsRule,
            ],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'employee_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where(function ($query) {
                    $query->whereNull('user_id');
                }),
            ],
        ];
    }
}
