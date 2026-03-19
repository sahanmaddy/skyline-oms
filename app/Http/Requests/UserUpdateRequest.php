<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $userModel */
        $userModel = $this->route('user');

        return $userModel ? ($this->user()?->can('update', $userModel) ?? false) : false;
    }

    public function rules(): array
    {
        /** @var User $userModel */
        $userModel = $this->route('user');

        $roleNames = Role::query()->pluck('name')->all();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userModel->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in($roleNames)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
