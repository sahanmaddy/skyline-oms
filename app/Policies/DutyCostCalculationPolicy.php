<?php

namespace App\Policies;

use App\Models\DutyCostCalculation;
use App\Models\User;

class DutyCostCalculationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('calculator.view');
    }

    public function view(User $user, DutyCostCalculation $dutyCostCalculation): bool
    {
        return $user->can('calculator.view');
    }

    public function create(User $user): bool
    {
        return $user->can('calculator.create');
    }

    public function update(User $user, DutyCostCalculation $dutyCostCalculation): bool
    {
        return $user->can('calculator.edit');
    }

    public function delete(User $user, DutyCostCalculation $dutyCostCalculation): bool
    {
        return $user->can('calculator.delete');
    }
}

