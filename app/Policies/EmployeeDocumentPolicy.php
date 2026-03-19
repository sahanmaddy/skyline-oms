<?php

namespace App\Policies;

use App\Models\EmployeeDocument;
use App\Models\User;

class EmployeeDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Manager', 'Accountant']);
    }

    public function view(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $this->viewAny($user);
    }

    public function delete(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $this->viewAny($user);
    }
}
