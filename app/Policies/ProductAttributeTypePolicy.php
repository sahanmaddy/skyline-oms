<?php

namespace App\Policies;

use App\Models\ProductAttributeType;
use App\Models\User;

class ProductAttributeTypePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('inventory.attributes.view');
    }

    public function view(User $user, ProductAttributeType $productAttributeType): bool
    {
        return $user->can('inventory.attributes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('inventory.attributes.create');
    }

    public function update(User $user, ProductAttributeType $productAttributeType): bool
    {
        return $user->can('inventory.attributes.edit');
    }

    public function delete(User $user, ProductAttributeType $productAttributeType): bool
    {
        return $user->can('inventory.attributes.delete');
    }
}
