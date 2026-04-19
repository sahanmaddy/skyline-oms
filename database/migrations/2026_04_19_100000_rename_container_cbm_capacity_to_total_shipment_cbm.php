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

        if (Schema::hasColumn('duty_cost_calculations', 'container_cbm_capacity')
            && ! Schema::hasColumn('duty_cost_calculations', 'total_shipment_cbm')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('container_cbm_capacity', 'total_shipment_cbm');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        if (Schema::hasColumn('duty_cost_calculations', 'total_shipment_cbm')
            && ! Schema::hasColumn('duty_cost_calculations', 'container_cbm_capacity')) {
            Schema::table('duty_cost_calculations', function (Blueprint $table) {
                $table->renameColumn('total_shipment_cbm', 'container_cbm_capacity');
            });
        }
    }
};
