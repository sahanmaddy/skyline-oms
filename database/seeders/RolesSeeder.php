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

        $guard = 'web';

        $mappings = [
            'Admin' => 'Admin',
            'Manager' => 'Management',
            'Sales' => 'Sales and Marketing',
            'Accountant' => 'Accounting and Finance',
        ];

        foreach ($mappings as $old => $new) {
            $existing = Role::where('name', $old)->where('guard_name', $guard)->first();

            if ($existing && $old !== $new) {
                if (! Role::where('name', $new)->where('guard_name', $guard)->exists()) {
                    $existing->name = $new;
                    $existing->save();
                }
            } else {
                Role::findOrCreate($new, $guard);
            }
        }

        foreach (['Admin', 'Management', 'Sales and Marketing', 'Accounting and Finance', 'Human Resources'] as $roleName) {
            Role::findOrCreate($roleName, $guard);
        }
    }
}
