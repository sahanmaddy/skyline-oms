<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('vat_number', 100)->nullable()->after('nic');
            $table->string('tin_number', 100)->nullable()->after('vat_number');
        });

        if (Schema::hasColumn('customers', 'vat_tax_number')) {
            DB::table('customers')
                ->whereNotNull('vat_tax_number')
                ->update([
                    // Preserve existing values by carrying prior combined tax number into TIN.
                    'tin_number' => DB::raw('vat_tax_number'),
                ]);

            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn('vat_tax_number');
            });
        }
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('vat_tax_number', 100)->nullable()->after('nic');
        });

        DB::table('customers')
            ->whereNull('vat_tax_number')
            ->whereNotNull('tin_number')
            ->update([
                'vat_tax_number' => DB::raw('tin_number'),
            ]);

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['vat_number', 'tin_number']);
        });
    }
};
