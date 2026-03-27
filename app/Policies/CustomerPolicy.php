<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance']);
    }

    public function view(User $user, Customer $customer): bool
    {
        if ($customer->isSystemCashCustomer()) {
            return false;
        }

        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Admin', 'Management', 'Sales and Marketing']);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole(['Admin', 'Management', 'Sales and Marketing'])
            && ! $customer->isSystemCashCustomer();
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole(['Admin', 'Management'])
            && ! $customer->isSystemCashCustomer();
    }
}
