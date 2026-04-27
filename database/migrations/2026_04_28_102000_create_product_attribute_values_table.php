<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_attribute_type_id')
                ->constrained('product_attribute_types')
                ->restrictOnDelete();
            $table->string('code', 32)->unique();
            $table->string('value');
            $table->string('display_value')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 16)->default('active');
            $table->unsignedInteger('sort_order')->nullable();
            $table->timestamps();

            $table->index(['product_attribute_type_id', 'status']);
            $table->unique(['product_attribute_type_id', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_attribute_values');
    }
};
