<?php

namespace App\Policies;

use App\Models\ProductCategory;
use App\Models\User;

class ProductCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.categories.view');
    }

    public function view(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.categories.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.categories.create');
    }

    public function update(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.categories.edit');
    }

    public function delete(User $user, ProductCategory $productCategory): bool
    {
        return $user->can('inventory.categories.delete');
    }
}
