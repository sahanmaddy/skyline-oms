<?php

namespace App\Actions\Branches;

use App\Models\Branch;
use DomainException;

class DeleteBranchAction
{
    public function execute(Branch $branch): void
    {
        if ($branch->isInUse()) {
            throw new DomainException(
                'This branch is in use by users (default branch, branch access, or employees) and cannot be deleted.',
            );
        }

        $branch->delete();
    }
}
