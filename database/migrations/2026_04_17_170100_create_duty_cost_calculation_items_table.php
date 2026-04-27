<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('duty_cost_calculation_items')) {
            return;
        }

        Schema::create('duty_cost_calculation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duty_cost_calculation_id')
                ->constrained('duty_cost_calculations')
                ->cascadeOnDelete();
            $table->unsignedInteger('line_no');
            $table->string('product_name');
            $table->string('product_code')->nullable();
            $table->text('description')->nullable();
            $table->string('product_currency', 10);
            $table->string('unit_of_measure', 255);
            $table->decimal('quantity', 15, 4);
            $table->decimal('unit_price_foreign', 15, 4)->default(0);
            $table->decimal('total_product_value_foreign', 15, 4)->default(0);
            $table->decimal('cbm', 15, 4)->default(0);
            $table->decimal('weight_kg', 15, 4)->default(0);
            $table->decimal('customs_preset_value_foreign_or_base', 15, 4)->default(0);
            $table->decimal('cid_rate_per_kg_lkr', 15, 2)->default(30);
            $table->decimal('statistical_value_lkr', 15, 2)->default(0);
            $table->decimal('customs_base_110_lkr', 15, 2)->default(0);
            $table->decimal('cid_lkr', 15, 2)->default(0);
            $table->decimal('vat_lkr', 15, 2)->default(0);
            $table->decimal('sscl_lkr', 15, 2)->default(0);
            $table->decimal('duty_total_lkr', 15, 2)->default(0);
            $table->decimal('product_value_lkr', 15, 2)->default(0);
            $table->decimal('allocated_shipping_lkr', 15, 2)->default(0);
            $table->decimal('allocated_other_costs_lkr', 15, 2)->default(0);
            $table->decimal('total_landed_cost_lkr', 15, 2)->default(0);
            $table->decimal('landed_cost_per_unit_lkr', 15, 2)->default(0);
            $table->decimal('landed_cost_per_kg_lkr', 15, 2)->nullable();
            $table->decimal('landed_cost_per_meter_lkr', 15, 2)->nullable();
            $table->decimal('landed_cost_per_yard_lkr', 15, 2)->nullable();
            $table->decimal('landed_cost_per_piece_lkr', 15, 2)->nullable();
            $table->decimal('landed_cost_per_set_lkr', 15, 2)->nullable();
            $table->timestamps();

            $table->index(['duty_cost_calculation_id', 'line_no'], 'dcc_items_calculation_line_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duty_cost_calculation_items');
    }
};
