<?php

namespace App\Http\Requests;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Role|null $role */
        $role = $this->route('role');

        return $role ? ($this->user()?->can('update', $role) ?? false) : false;
    }

    public function rules(): array
    {
        /** @var Role $role */
        $role = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($role->id),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', Rule::exists((new Permission)->getTable(), 'id')],
        ];
    }
}
