<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Drops inventory.view, procurement.view, finance.view — placeholders until
     * real domains exist; authorization will use entity permissions (catalog) then.
     */
    public function up(): void
    {
        $names = ['inventory.view', 'procurement.view', 'finance.view'];

        $ids = DB::table('permissions')
            ->where('guard_name', 'web')
            ->whereIn('name', $names)
            ->pluck('id');

        if ($ids->isEmpty()) {
            return;
        }

        DB::table('role_has_permissions')->whereIn('permission_id', $ids)->delete();
        DB::table('model_has_permissions')->whereIn('permission_id', $ids)->delete();

        DB::table('permissions')
            ->where('guard_name', 'web')
            ->whereIn('name', $names)
            ->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Intentionally no-op: re-add via permissions:sync if these return to the catalog.
    }
};
