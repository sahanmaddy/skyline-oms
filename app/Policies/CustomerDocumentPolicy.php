<?php

namespace App\Policies;

use App\Models\CustomerDocument;
use App\Models\User;

class CustomerDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance']);
    }

    public function view(User $user, CustomerDocument $customerDocument): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance']);
    }

    public function update(User $user, CustomerDocument $customerDocument): bool
    {
        return $this->create($user);
    }

    public function delete(User $user, CustomerDocument $customerDocument): bool
    {
        return $this->create($user);
    }
}

