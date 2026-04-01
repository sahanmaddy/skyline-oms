<?php

namespace App\Actions\Branches;

use App\Models\Branch;
use DomainException;

class DeleteBranchAction
{
    public function execute(Branch $branch): void
    {
        if ($branch->isInUse()) {
            throw new DomainException('This branch is assigned to users or employees and cannot be deleted.');
        }

        $branch->delete();
    }
}
