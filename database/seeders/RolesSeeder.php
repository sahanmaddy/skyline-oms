<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['Admin', 'Manager', 'Sales', 'Accountant'] as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }
    }
}
