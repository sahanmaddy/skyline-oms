<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (! Schema::hasColumn('duty_cost_calculations', 'supplier_id')) {
                $table->foreignId('supplier_id')
                    ->nullable()
                    ->after('supplier_name')
                    ->constrained('suppliers')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'supplier_id')) {
                $table->dropConstrainedForeignId('supplier_id');
            }
        });
    }
};
