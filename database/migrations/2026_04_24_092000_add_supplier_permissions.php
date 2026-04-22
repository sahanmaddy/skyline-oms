<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            ['suppliers.view', 'View suppliers', 'Suppliers'],
            ['suppliers.create', 'Create suppliers', 'Suppliers'],
            ['suppliers.edit', 'Edit suppliers', 'Suppliers'],
            ['suppliers.delete', 'Delete suppliers', 'Suppliers'],
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
            'Admin' => ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete'],
            'Management' => ['suppliers.view', 'suppliers.create', 'suppliers.edit'],
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
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
