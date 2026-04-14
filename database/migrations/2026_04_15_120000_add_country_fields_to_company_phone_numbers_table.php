<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_phone_numbers', function (Blueprint $table) {
            $table->string('country_code', 10)->nullable()->after('phone_type');
            $table->string('country_iso2', 2)->nullable()->after('country_code');
        });
    }

    public function down(): void
    {
        Schema::table('company_phone_numbers', function (Blueprint $table) {
            $table->dropColumn(['country_code', 'country_iso2']);
        });
    }
};
