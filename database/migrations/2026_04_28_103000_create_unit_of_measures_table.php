<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit_of_measures', function (Blueprint $table) {
            $table->id();
            $table->string('unit_code', 32)->unique();
            $table->string('name')->unique();
            $table->string('symbol', 32);
            $table->unsignedTinyInteger('decimal_precision')->default(0);
            $table->boolean('allow_decimal')->default(false);
            $table->boolean('is_base_unit')->default(false);
            $table->boolean('is_system')->default(false);
            $table->string('status', 16)->default('active');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unit_of_measures');
    }
};
