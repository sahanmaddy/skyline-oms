<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('duty_cost_calculation_other_costs')) {
            return;
        }

        Schema::create('duty_cost_calculation_other_costs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('duty_cost_calculation_id');
            $table->foreign('duty_cost_calculation_id', 'dcc_other_costs_calc_fk')
                ->references('id')
                ->on('duty_cost_calculations')
                ->cascadeOnDelete();
            $table->string('cost_name');
            $table->decimal('amount_lkr', 15, 2)->default(0);
            $table->string('remarks')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duty_cost_calculation_other_costs');
    }
};
