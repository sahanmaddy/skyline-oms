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
            $table->foreignId('duty_cost_calculation_id')
                ->constrained('duty_cost_calculations')
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

