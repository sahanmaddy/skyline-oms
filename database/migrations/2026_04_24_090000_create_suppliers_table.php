<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_code')->unique();
            $table->string('company_name');
            $table->string('display_name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('website')->nullable();

            $table->string('primary_phone_country_code', 10)->nullable();
            $table->string('primary_phone_number', 50)->nullable();
            $table->string('whatsapp_country_code', 10)->nullable();
            $table->string('whatsapp_number', 50)->nullable();

            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city')->nullable();
            $table->string('state_province')->nullable();
            $table->string('postal_code', 30)->nullable();
            $table->string('country')->nullable();

            $table->string('registration_number')->nullable();
            $table->string('tax_number')->nullable();
            $table->integer('payment_terms_days')->nullable();
            $table->string('currency', 3)->nullable();
            $table->decimal('credit_limit', 15, 2)->nullable();

            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true)->index();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('display_name');
            $table->index('company_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
