<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('roles', 'is_system')) {
            DB::table('roles')->update(['is_system' => false]);
        }
    }

    public function down(): void
    {
        // Intentionally empty: we do not restore prior is_system flags.
    }
};
