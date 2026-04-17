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

        $definitions = [
            [
                'name' => 'calculator.view',
                'display_name' => 'View duty & cost calculations',
                'module' => 'Calculator',
                'description' => 'Browse duty and landed-cost estimation calculations.',
            ],
            [
                'name' => 'calculator.create',
                'display_name' => 'Create duty & cost calculations',
                'module' => 'Calculator',
                'description' => 'Create shipment estimation calculations for import decisions.',
            ],
            [
                'name' => 'calculator.edit',
                'display_name' => 'Edit duty & cost calculations',
                'module' => 'Calculator',
                'description' => 'Update draft or finalized duty and landed-cost calculations.',
            ],
            [
                'name' => 'calculator.delete',
                'display_name' => 'Delete duty & cost calculations',
                'module' => 'Calculator',
                'description' => 'Delete saved duty and landed-cost calculations.',
            ],
        ];

        foreach ($definitions as $def) {
            $existing = DB::table('permissions')
                ->where('name', $def['name'])
                ->where('guard_name', 'web')
                ->first();

            $values = [
                'name' => $def['name'],
                'guard_name' => 'web',
                'updated_at' => now(),
            ];

            if ($hasDisplayName) {
                $values['display_name'] = $def['display_name'];
            }
            if ($hasModule) {
                $values['module'] = $def['module'];
            }
            if ($hasDescription) {
                $values['description'] = $def['description'];
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

        $adminRoleId = DB::table('roles')
            ->where('name', 'Admin')
            ->where('guard_name', 'web')
            ->value('id');

        if ($adminRoleId) {
            $permissionIds = DB::table('permissions')
                ->whereIn('name', array_column($definitions, 'name'))
                ->where('guard_name', 'web')
                ->pluck('id');

            foreach ($permissionIds as $permissionId) {
                $exists = DB::table('role_has_permissions')
                    ->where('role_id', $adminRoleId)
                    ->where('permission_id', $permissionId)
                    ->exists();

                if (! $exists) {
                    DB::table('role_has_permissions')->insert([
                        'role_id' => $adminRoleId,
                        'permission_id' => $permissionId,
                    ]);
                }
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $names = [
            'calculator.view',
            'calculator.create',
            'calculator.edit',
            'calculator.delete',
        ];

        $permissionIds = DB::table('permissions')
            ->whereIn('name', $names)
            ->where('guard_name', 'web')
            ->pluck('id');

        if ($permissionIds->isNotEmpty()) {
            DB::table('role_has_permissions')->whereIn('permission_id', $permissionIds)->delete();
            DB::table('permissions')->whereIn('id', $permissionIds)->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};

