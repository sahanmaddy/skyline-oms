<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('company_settings')
            ->where('registered_address', 'Update your registered business address in Company Settings.')
            ->update([
                'registered_address' => '',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // No-op: do not restore placeholder text.
    }
};
