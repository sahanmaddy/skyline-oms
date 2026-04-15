<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->string('system_country', 120)->default('Sri Lanka')->after('currency_format');
        });

        DB::table('company_settings')
            ->whereNull('system_country')
            ->orWhere('system_country', '')
            ->update(['system_country' => 'Sri Lanka']);
    }

    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn('system_country');
        });
    }
};
