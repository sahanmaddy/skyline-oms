<?php

namespace App\Actions\Permissions;

use App\Models\Permission;
use DomainException;

class DeletePermissionAction
{
    private const PROTECTED_PERMISSIONS = [
        'roles.view',
        'roles.create',
        'roles.edit',
        'roles.delete',
        'permissions.view',
        'permissions.create',
        'permissions.edit',
        'permissions.delete',
        'users.view',
        'users.create',
        'users.edit',
        'settings.view',
    ];

    /**
     * Whether this permission may be removed (policy checks are separate).
     */
    public function isDeletable(Permission $permission): bool
    {
        if ($permission->is_system || in_array($permission->name, self::PROTECTED_PERMISSIONS, true)) {
            return false;
        }

        return ! $permission->roles()->exists();
    }

    public function execute(Permission $permission): void
    {
        if ($permission->is_system || in_array($permission->name, self::PROTECTED_PERMISSIONS, true)) {
            throw new DomainException('This permission is protected and cannot be deleted.');
        }

        if ($permission->roles()->exists()) {
            throw new DomainException('This permission is assigned to one or more roles.');
        }

        $permission->delete();
    }
}
