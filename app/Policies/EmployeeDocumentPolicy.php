<?php

namespace App\Policies;

use App\Models\EmployeeDocument;
use App\Models\User;

class EmployeeDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('employees.view');
    }

    public function view(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $user->can('employees.view');
    }

    public function create(User $user): bool
    {
        return $user->can('employees.edit');
    }

    public function update(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $user->can('employees.edit');
    }

    public function delete(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $user->can('employees.edit');
    }
}
