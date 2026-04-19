<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (! Schema::hasColumn('duty_cost_calculations', 'cid_rate_per_kg_lkr')) {
                $table->decimal('cid_rate_per_kg_lkr', 12, 2)->default(30)->after('demurrage_cost_lkr');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'duty_base_percent')) {
                $table->decimal('duty_base_percent', 8, 2)->default(110)->after('cid_rate_per_kg_lkr');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'vat_rate_percent')) {
                $table->decimal('vat_rate_percent', 8, 2)->default(18)->after('duty_base_percent');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'sscl_rate_percent')) {
                $table->decimal('sscl_rate_percent', 8, 2)->default(2.5)->after('vat_rate_percent');
            }
        });

        if (Schema::hasTable('duty_cost_calculation_items') && Schema::hasColumn('duty_cost_calculations', 'cid_rate_per_kg_lkr')) {
            $ids = DB::table('duty_cost_calculations')->pluck('id');
            foreach ($ids as $id) {
                $cid = DB::table('duty_cost_calculation_items')
                    ->where('duty_cost_calculation_id', $id)
                    ->orderBy('line_no')
                    ->value('cid_rate_per_kg_lkr');
                if ($cid !== null) {
                    DB::table('duty_cost_calculations')->where('id', $id)->update(['cid_rate_per_kg_lkr' => $cid]);
                }
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            foreach (['sscl_rate_percent', 'vat_rate_percent', 'duty_base_percent', 'cid_rate_per_kg_lkr'] as $col) {
                if (Schema::hasColumn('duty_cost_calculations', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
