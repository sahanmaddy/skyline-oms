<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::create('duty_cost_calculations', function (Blueprint $table) {
            $table->id();
            $table->string('calculation_code')->unique();
            $table->string('title');
            $table->string('reference_no')->nullable();
            $table->string('supplier_name')->nullable();
            $table->text('shipment_currency_basis_notes')->nullable();
            $table->decimal('exchange_rate', 14, 4);
            $table->string('exchange_rate_currency_label')->nullable();
            $table->decimal('container_cbm_capacity', 14, 4)->nullable();
            $table->decimal('shipping_cost_total_lkr', 15, 2)->default(0);
            $table->decimal('loading_unloading_cost_lkr', 15, 2)->default(0);
            $table->decimal('transport_cost_lkr', 15, 2)->default(0);
            $table->decimal('delivery_order_charges_lkr', 15, 2)->default(0);
            $table->decimal('clearing_charges_lkr', 15, 2)->default(0);
            $table->decimal('demurrage_cost_lkr', 15, 2)->default(0);
            $table->decimal('other_costs_lkr_total', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('calculation_status')->default('draft')->index();
            $table->json('totals')->nullable();
            $table->unsignedInteger('item_count')->default(0);
            $table->decimal('total_product_value_lkr', 15, 2)->default(0);
            $table->decimal('total_statistical_value_lkr', 15, 2)->default(0);
            $table->decimal('total_cid_lkr', 15, 2)->default(0);
            $table->decimal('total_vat_lkr', 15, 2)->default(0);
            $table->decimal('total_sscl_lkr', 15, 2)->default(0);
            $table->decimal('total_duty_lkr', 15, 2)->default(0);
            $table->decimal('total_allocated_shipping_lkr', 15, 2)->default(0);
            $table->decimal('total_allocated_other_costs_lkr', 15, 2)->default(0);
            $table->decimal('grand_total_landed_cost_lkr', 15, 2)->default(0);
            $table->decimal('total_weight_kg', 15, 3)->default(0);
            $table->decimal('total_cbm', 15, 4)->default(0);
            $table->decimal('shipping_cost_per_cbm_lkr', 15, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duty_cost_calculations');
    }
};
