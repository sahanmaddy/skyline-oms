<?php

namespace App\Actions\Roles;

use App\Models\Role;
use DomainException;

class DeleteRoleAction
{
    /**
     * Whether this role may be removed (policy checks are separate).
     */
    public function isDeletable(Role $role): bool
    {
        return ! $role->users()->exists();
    }

    public function execute(Role $role): void
    {
        if ($role->users()->where('status', 'active')->exists()) {
            throw new DomainException('This role is assigned to active users. Reassign users first.');
        }

        if ($role->users()->exists()) {
            throw new DomainException('This role is assigned to users. Reassign users first.');
        }

        $role->delete();
    }
}
