<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (! Schema::hasColumn('duty_cost_calculations', 'eid_rate_per_kg_lkr')) {
                $table->decimal('eid_rate_per_kg_lkr', 12, 2)->default(0)->after('cid_basis');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'eid_basis')) {
                $table->string('eid_basis', 20)->default('weight')->after('eid_rate_per_kg_lkr');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'total_eid_lkr')) {
                $table->decimal('total_eid_lkr', 15, 2)->default(0)->after('total_cid_lkr');
            }
        });

        Schema::table('duty_cost_calculation_items', function (Blueprint $table): void {
            if (! Schema::hasColumn('duty_cost_calculation_items', 'eid_rate_per_kg_lkr')) {
                $table->decimal('eid_rate_per_kg_lkr', 15, 2)->default(0)->after('cid_rate_per_kg_lkr');
            }
            if (! Schema::hasColumn('duty_cost_calculation_items', 'eid_lkr')) {
                $table->decimal('eid_lkr', 15, 2)->default(0)->after('cid_lkr');
            }
        });
    }

    public function down(): void
    {
        Schema::table('duty_cost_calculation_items', function (Blueprint $table): void {
            if (Schema::hasColumn('duty_cost_calculation_items', 'eid_lkr')) {
                $table->dropColumn('eid_lkr');
            }
            if (Schema::hasColumn('duty_cost_calculation_items', 'eid_rate_per_kg_lkr')) {
                $table->dropColumn('eid_rate_per_kg_lkr');
            }
        });

        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (Schema::hasColumn('duty_cost_calculations', 'total_eid_lkr')) {
                $table->dropColumn('total_eid_lkr');
            }
            if (Schema::hasColumn('duty_cost_calculations', 'eid_basis')) {
                $table->dropColumn('eid_basis');
            }
            if (Schema::hasColumn('duty_cost_calculations', 'eid_rate_per_kg_lkr')) {
                $table->dropColumn('eid_rate_per_kg_lkr');
            }
        });
    }
};
