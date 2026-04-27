<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (! Schema::hasColumn('suppliers', 'vat_number')) {
                $table->string('vat_number', 100)->nullable()->after('tax_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (Schema::hasColumn('suppliers', 'vat_number')) {
                $table->dropColumn('vat_number');
            }
        });
    }
};

