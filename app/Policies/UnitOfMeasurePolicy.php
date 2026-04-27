<?php

namespace App\Policies;

use App\Models\UnitOfMeasure;
use App\Models\User;

class UnitOfMeasurePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.units.view');
    }

    public function view(User $user, UnitOfMeasure $unitOfMeasure): bool
    {
        return $user->can('inventory.units.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.units.create');
    }

    public function update(User $user, UnitOfMeasure $unitOfMeasure): bool
    {
        return $user->can('inventory.units.edit');
    }

    public function delete(User $user, UnitOfMeasure $unitOfMeasure): bool
    {
        return $user->can('inventory.units.delete');
    }
}
