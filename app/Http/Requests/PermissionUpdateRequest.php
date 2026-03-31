<?php

namespace App\Http\Requests;

use App\Models\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Permission|null $permission */
        $permission = $this->route('permission');

        return $permission ? ($this->user()?->can('update', $permission) ?? false) : false;
    }

    public function rules(): array
    {
        /** @var Permission $permission */
        $permission = $this->route('permission');

        $nameRules = [
            'required',
            'string',
            'max:255',
            'regex:/^[a-z0-9]+(\.[a-z0-9_]+)+$/',
            Rule::unique('permissions', 'name')->where('guard_name', 'web')->ignore($permission->id),
        ];

        if ($permission->is_system) {
            $nameRules[] = Rule::in([$permission->name]);
        }

        return [
            'name' => $nameRules,
            'display_name' => ['required', 'string', 'max:255'],
            'module' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
