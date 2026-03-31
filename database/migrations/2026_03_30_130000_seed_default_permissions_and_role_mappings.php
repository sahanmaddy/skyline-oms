<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $hasDisplayName = Schema::hasColumn('permissions', 'display_name');
        $hasModule = Schema::hasColumn('permissions', 'module');
        $hasDescription = Schema::hasColumn('permissions', 'description');
        $hasIsSystem = Schema::hasColumn('permissions', 'is_system');

        $permissions = [
            ['dashboard.view', 'View dashboard', 'Dashboard'],
            ['employees.view', 'View employees', 'Employees'],
            ['employees.create', 'Create employees', 'Employees'],
            ['employees.edit', 'Edit employees', 'Employees'],
            ['employees.delete', 'Delete employees', 'Employees'],
            ['customers.view', 'View customers', 'Customers'],
            ['customers.create', 'Create customers', 'Customers'],
            ['customers.edit', 'Edit customers', 'Customers'],
            ['customers.delete', 'Delete customers', 'Customers'],
            ['users.view', 'View users', 'Users'],
            ['users.create', 'Create users', 'Users'],
            ['users.edit', 'Edit users', 'Users'],
            ['users.delete', 'Delete users', 'Users'],
            ['roles.view', 'View roles', 'Roles'],
            ['roles.create', 'Create roles', 'Roles'],
            ['roles.edit', 'Edit roles', 'Roles'],
            ['roles.delete', 'Delete roles', 'Roles'],
            ['permissions.view', 'View permissions', 'Permissions'],
            ['permissions.create', 'Create permissions', 'Permissions'],
            ['permissions.edit', 'Edit permissions', 'Permissions'],
            ['permissions.delete', 'Delete permissions', 'Permissions'],
            ['settings.view', 'View settings', 'Settings'],
            ['settings.company.view', 'View company settings', 'Settings'],
            ['settings.system.view', 'View system settings', 'Settings'],
        ];

        foreach ($permissions as [$name, $displayName, $module]) {
            $existing = DB::table('permissions')
                ->where('name', $name)
                ->where('guard_name', 'web')
                ->first();

            $values = [
                'name' => $name,
                'guard_name' => 'web',
                'updated_at' => now(),
            ];

            if ($hasDisplayName) {
                $values['display_name'] = $displayName;
            }
            if ($hasModule) {
                $values['module'] = $module;
            }
            if ($hasDescription) {
                $values['description'] = null;
            }
            if ($hasIsSystem) {
                $values['is_system'] = true;
            }

            if ($existing) {
                DB::table('permissions')->where('id', $existing->id)->update($values);
            } else {
                $values['created_at'] = now();
                DB::table('permissions')->insert($values);
            }
        }

        $roleIds = DB::table('roles')
            ->where('guard_name', 'web')
            ->pluck('id', 'name');

        $permissionIds = DB::table('permissions')
            ->where('guard_name', 'web')
            ->pluck('id', 'name');

        $allPermissionNames = array_keys($permissionIds->all());

        $rolePermissionMap = [
            'Admin' => $allPermissionNames,
            'Management' => [
                'dashboard.view',
                'employees.view', 'employees.create', 'employees.edit',
                'customers.view', 'customers.create', 'customers.edit',
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

        foreach ($rolePermissionMap as $roleName => $permissionNames) {
            $roleId = $roleIds[$roleName] ?? null;
            if (! $roleId) {
                continue;
            }

            foreach ($permissionNames as $permissionName) {
                $permissionId = $permissionIds[$permissionName] ?? null;
                if (! $permissionId) {
                    continue;
                }

                $exists = DB::table('role_has_permissions')
                    ->where('role_id', $roleId)
                    ->where('permission_id', $permissionId)
                    ->exists();

                if (! $exists) {
                    DB::table('role_has_permissions')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permissionId,
                    ]);
                }
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Intentionally no-op: keep seeded permissions/role mappings.
    }
};
