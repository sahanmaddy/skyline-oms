<?php

namespace Database\Seeders;

use App\Services\Permissions\SyncPermissionsFromCatalog;
use Illuminate\Database\Seeder;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(SyncPermissionsFromCatalog::class)->sync();
    }
}
