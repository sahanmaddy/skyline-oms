<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager', 'Accountant']);
    }

    public function view(User $user, Employee $employee): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager']);
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager']);
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager']);
    }
}
