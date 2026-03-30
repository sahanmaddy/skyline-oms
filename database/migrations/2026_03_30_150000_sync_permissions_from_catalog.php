<?php

use App\Services\Permissions\SyncPermissionsFromCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        app(SyncPermissionsFromCatalog::class)->sync();
    }

    public function down(): void
    {
        // Intentionally empty: permission catalog is source-of-truth in code.
    }
};
