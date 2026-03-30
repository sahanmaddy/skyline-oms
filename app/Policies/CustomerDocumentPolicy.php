<?php

namespace App\Policies;

use App\Models\CustomerDocument;
use App\Models\User;

class CustomerDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('customers.view');
    }

    public function view(User $user, CustomerDocument $customerDocument): bool
    {
        return $user->can('customers.view');
    }

    public function create(User $user): bool
    {
        return $user->can('customers.edit');
    }

    public function update(User $user, CustomerDocument $customerDocument): bool
    {
        return $user->can('customers.edit');
    }

    public function delete(User $user, CustomerDocument $customerDocument): bool
    {
        return $user->can('customers.edit');
    }
}
