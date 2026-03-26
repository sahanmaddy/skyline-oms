<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
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

        $roleNames = ['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance', 'Human Resources'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userModel->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in($roleNames)],
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
