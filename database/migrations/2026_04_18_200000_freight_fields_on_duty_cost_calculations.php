<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (! Schema::hasColumn('duty_cost_calculations', 'freight_currency')) {
                $table->string('freight_currency', 3)->nullable()->after('exchange_rate');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'freight_exchange_rate')) {
                $table->decimal('freight_exchange_rate', 14, 4)->nullable()->after('freight_currency');
            }
        });

        if (Schema::hasColumn('duty_cost_calculations', 'freight_currency')) {
            DB::table('duty_cost_calculations')->orderBy('id')->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $updates = [];
                    if (($row->freight_currency ?? null) === null && ! empty($row->purchasing_currency)) {
                        $updates['freight_currency'] = $row->purchasing_currency;
                    }
                    if (($row->freight_exchange_rate ?? null) === null && $row->exchange_rate !== null) {
                        $updates['freight_exchange_rate'] = $row->exchange_rate;
                    }
                    if ($updates !== []) {
                        DB::table('duty_cost_calculations')->where('id', $row->id)->update($updates);
                    }
                }
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'shipping_cost_total_lkr')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('shipping_cost_total_lkr', 'freight_cost_total');
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'shipping_cost_per_cbm_lkr')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('shipping_cost_per_cbm_lkr', 'freight_cost_per_cbm_lkr');
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'total_allocated_shipping_lkr')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('total_allocated_shipping_lkr', 'total_allocated_freight_lkr');
            });
        }

        if (Schema::hasTable('duty_cost_calculation_items') && Schema::hasColumn('duty_cost_calculation_items', 'allocated_shipping_lkr')) {
            Schema::table('duty_cost_calculation_items', function (Blueprint $table) {
                $table->renameColumn('allocated_shipping_lkr', 'allocated_freight_lkr');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('duty_cost_calculation_items') && Schema::hasColumn('duty_cost_calculation_items', 'allocated_freight_lkr')) {
            Schema::table('duty_cost_calculation_items', function (Blueprint $table) {
                $table->renameColumn('allocated_freight_lkr', 'allocated_shipping_lkr');
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'total_allocated_freight_lkr')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('total_allocated_freight_lkr', 'total_allocated_shipping_lkr');
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'freight_cost_per_cbm_lkr')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('freight_cost_per_cbm_lkr', 'shipping_cost_per_cbm_lkr');
            });
        }

        if (Schema::hasColumn('duty_cost_calculations', 'freight_cost_total')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('freight_cost_total', 'shipping_cost_total_lkr');
            });
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'freight_exchange_rate')) {
                $table->dropColumn('freight_exchange_rate');
            }
            if (Schema::hasColumn('duty_cost_calculations', 'freight_currency')) {
                $table->dropColumn('freight_currency');
            }
        });
    }
};
