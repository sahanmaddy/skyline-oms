<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;
use App\Services\Branches\BranchScopeService;

class EmployeePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('employees.view');
    }

    public function view(User $user, Employee $employee): bool
    {
        if (! $user->can('employees.view')) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $employee->branch_id,
            $user,
        );
    }

    public function create(User $user): bool
    {
        return $user->can('employees.create');
    }

    public function update(User $user, Employee $employee): bool
    {
        if (! $user->can('employees.edit')) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $employee->branch_id,
            $user,
        );
    }

    public function delete(User $user, Employee $employee): bool
    {
        if (! $user->can('employees.delete')) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $employee->branch_id,
            $user,
        );
    }
}
