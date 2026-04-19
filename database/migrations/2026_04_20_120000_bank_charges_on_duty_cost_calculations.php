<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('duty_cost_calculations')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                if (! Schema::hasColumn('duty_cost_calculations', 'bank_interest_rate_pa')) {
                    $table->decimal('bank_interest_rate_pa', 10, 4)->nullable()->after('sscl_rate_percent');
                }
                if (! Schema::hasColumn('duty_cost_calculations', 'bank_interest_months')) {
                    $table->decimal('bank_interest_months', 10, 2)->nullable()->after('bank_interest_rate_pa');
                }
                if (! Schema::hasColumn('duty_cost_calculations', 'total_bank_charges_lkr')) {
                    $table->decimal('total_bank_charges_lkr', 15, 2)->default(0)->after('total_allocated_other_costs_lkr');
                }
            });
        }

        if (Schema::hasTable('duty_cost_calculation_items')) {
            Schema::table('duty_cost_calculation_items', function (Blueprint $table) {
                if (! Schema::hasColumn('duty_cost_calculation_items', 'allocated_bank_charges_lkr')) {
                    $table->decimal('allocated_bank_charges_lkr', 15, 2)->default(0)->after('allocated_other_costs_lkr');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('duty_cost_calculation_items')) {
            Schema::table('duty_cost_calculation_items', function (Blueprint $table) {
                if (Schema::hasColumn('duty_cost_calculation_items', 'allocated_bank_charges_lkr')) {
                    $table->dropColumn('allocated_bank_charges_lkr');
                }
            });
        }
        if (Schema::hasTable('duty_cost_calculations')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                foreach (['total_bank_charges_lkr', 'bank_interest_months', 'bank_interest_rate_pa'] as $col) {
                    if (Schema::hasColumn('duty_cost_calculations', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
