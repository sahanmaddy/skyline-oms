<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (! Schema::hasColumn('duty_cost_calculations', 'total_customs_base_lkr')) {
                $table->decimal('total_customs_base_lkr', 15, 2)->default(0)->after('total_statistical_value_lkr');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'total_customs_base_lkr')) {
                $table->dropColumn('total_customs_base_lkr');
            }
        });
    }
};
