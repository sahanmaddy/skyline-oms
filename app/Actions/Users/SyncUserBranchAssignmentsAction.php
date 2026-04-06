<?php

namespace App\Actions\Users;

use App\Models\User;

class SyncUserBranchAssignmentsAction
{
    /**
     * @param  list<int>  $branchIds
     */
    public function execute(User $user, array $branchIds): void
    {
        $ids = array_values(array_unique(array_map(static fn ($id) => (int) $id, $branchIds)));
        $user->assignedBranches()->sync($ids);
    }
}
