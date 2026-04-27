<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['inventory.categories.view', 'View product categories', 'Inventory'],
            ['inventory.categories.create', 'Create product categories', 'Inventory'],
            ['inventory.categories.edit', 'Edit product categories', 'Inventory'],
            ['inventory.categories.delete', 'Delete product categories', 'Inventory'],
            ['inventory.attributes.view', 'View product attributes', 'Inventory'],
            ['inventory.attributes.create', 'Create product attributes', 'Inventory'],
            ['inventory.attributes.edit', 'Edit product attributes', 'Inventory'],
            ['inventory.attributes.delete', 'Delete product attributes', 'Inventory'],
            ['inventory.units.view', 'View units of measure', 'Inventory'],
            ['inventory.units.create', 'Create units of measure', 'Inventory'],
            ['inventory.units.edit', 'Edit units of measure', 'Inventory'],
            ['inventory.units.delete', 'Delete units of measure', 'Inventory'],
        ];

        foreach ($permissions as [$name, $displayName, $module]) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name, 'guard_name' => 'web'],
                [
                    'display_name' => $displayName,
                    'module' => $module,
                    'is_system' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }

        $rolePermissionMap = [
            'Admin' => array_column($permissions, 0),
            'Management' => array_column($permissions, 0),
        ];

        $roleIds = DB::table('roles')->where('guard_name', 'web')->pluck('id', 'name');
        $permissionIds = DB::table('permissions')->where('guard_name', 'web')->pluck('id', 'name');

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

                DB::table('role_has_permissions')->updateOrInsert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ], []);
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $names = [
            'inventory.categories.view',
            'inventory.categories.create',
            'inventory.categories.edit',
            'inventory.categories.delete',
            'inventory.attributes.view',
            'inventory.attributes.create',
            'inventory.attributes.edit',
            'inventory.attributes.delete',
            'inventory.units.view',
            'inventory.units.create',
            'inventory.units.edit',
            'inventory.units.delete',
        ];

        $ids = DB::table('permissions')->whereIn('name', $names)->where('guard_name', 'web')->pluck('id');
        if ($ids->isNotEmpty()) {
            DB::table('role_has_permissions')->whereIn('permission_id', $ids)->delete();
            DB::table('permissions')->whereIn('id', $ids)->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
