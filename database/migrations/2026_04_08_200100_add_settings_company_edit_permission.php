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

        $name = 'settings.company.edit';
        $exists = DB::table('permissions')->where('name', $name)->where('guard_name', 'web')->exists();
        if ($exists) {
            return;
        }

        $values = [
            'name' => $name,
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if ($hasDisplayName) {
            $values['display_name'] = 'Edit company settings';
        }
        if ($hasModule) {
            $values['module'] = 'Settings';
        }
        if ($hasDescription) {
            $values['description'] = 'Update organization profile, branding, localization, and contact details.';
        }
        if ($hasIsSystem) {
            $values['is_system'] = true;
        }

        DB::table('permissions')->insert($values);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        DB::table('permissions')->where('name', 'settings.company.edit')->where('guard_name', 'web')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
