<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\User::class) ?? false;
    }

    public function rules(): array
    {
        $roleNames = ['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance', 'Human Resources'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in($roleNames)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
