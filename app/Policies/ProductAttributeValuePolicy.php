<?php

namespace App\Policies;

use App\Models\ProductAttributeValue;
use App\Models\User;

class ProductAttributeValuePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.attributes.view');
    }

    public function view(User $user, ProductAttributeValue $productAttributeValue): bool
    {
        return $user->can('inventory.attributes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.attributes.create');
    }

    public function update(User $user, ProductAttributeValue $productAttributeValue): bool
    {
        return $user->can('inventory.attributes.edit');
    }

    public function delete(User $user, ProductAttributeValue $productAttributeValue): bool
    {
        return $user->can('inventory.attributes.delete');
    }
}
