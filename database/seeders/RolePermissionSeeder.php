<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $allPermissionNames = Permission::query()->pluck('name')->all();

        $map = [
            'Admin' => $allPermissionNames,
            'Management' => [
                'dashboard.view',
                'employees.view', 'employees.create', 'employees.edit',
                'customers.view', 'customers.create', 'customers.edit',
                'suppliers.view', 'suppliers.create', 'suppliers.edit',
                'inventory.categories.view', 'inventory.categories.create', 'inventory.categories.edit',
                'inventory.attributes.view', 'inventory.attributes.create', 'inventory.attributes.edit',
                'inventory.units.view', 'inventory.units.create', 'inventory.units.edit',
                'users.view',
                'settings.view',
                'settings.company.view',
            ],
            'Sales and Marketing' => [
                'dashboard.view',
                'customers.view', 'customers.create', 'customers.edit',
                'settings.view',
            ],
            'Accounting and Finance' => [
                'dashboard.view',
                'customers.view', 'customers.edit',
                'employees.view',
                'settings.view',
            ],
            'Human Resources' => [
                'dashboard.view',
                'employees.view', 'employees.create', 'employees.edit',
                'settings.view',
            ],
        ];

        foreach ($map as $roleName => $permissionNames) {
            $role = Role::query()->where('name', $roleName)->where('guard_name', 'web')->first();
            if (! $role) {
                continue;
            }

            $validPermissions = Permission::query()
                ->whereIn('name', $permissionNames)
                ->pluck('name')
                ->all();

            $role->syncPermissions($validPermissions);
        }
    }
}
