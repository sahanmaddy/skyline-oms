<?php

namespace App\Policies;

use App\Models\User;
use App\Services\Branches\BranchScopeService;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function view(User $user, User $model): bool
    {
        if (! $user->can('users.view')) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $model->branch_id,
            $user,
        );
    }

    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    public function update(User $user, User $model): bool
    {
        if (! $user->can('users.edit')) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $model->branch_id,
            $user,
        );
    }

    public function delete(User $user, User $model): bool
    {
        if (! $user->can('users.delete') || $user->id === $model->id) {
            return false;
        }

        return app(BranchScopeService::class)->recordMatchesEffectiveBranch(
            request(),
            $model->branch_id,
            $user,
        );
    }
}
