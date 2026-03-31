<?php

namespace App\Services\Permissions;

use App\Models\Permission;
use App\Support\PermissionCatalog;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

class SyncPermissionsFromCatalog
{
    public function sync(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $hasDisplayName = Schema::hasColumn('permissions', 'display_name');
        $hasModule = Schema::hasColumn('permissions', 'module');
        $hasDescription = Schema::hasColumn('permissions', 'description');
        $hasIsSystem = Schema::hasColumn('permissions', 'is_system');

        foreach (PermissionCatalog::definitions() as $row) {
            $payload = [];

            if ($hasDisplayName) {
                $payload['display_name'] = $row['display_name'];
            }
            if ($hasModule) {
                $payload['module'] = $row['module'];
            }
            if ($hasDescription) {
                $payload['description'] = $row['description'];
            }
            if ($hasIsSystem) {
                $payload['is_system'] = true;
            }

            Permission::query()->updateOrCreate(
                ['name' => $row['name'], 'guard_name' => 'web'],
                $payload,
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
