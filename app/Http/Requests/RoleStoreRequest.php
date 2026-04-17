<?php

namespace App\Http\Requests;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Role::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->where('guard_name', 'web')],
            'description' => ['required', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', Rule::exists((new Permission)->getTable(), 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'description.required' => 'Description is required.',
        ];
    }
}
