<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->text('registered_address');
            $table->string('company_email')->nullable();
            $table->string('tin_number')->nullable();
            $table->string('vat_number')->nullable();
            $table->string('site_icon_path')->nullable();
            $table->string('time_zone');
            $table->string('currency_code', 3);
            $table->string('currency_symbol', 32);
            $table->string('currency_format')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('company_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_setting_id')->constrained('company_settings')->cascadeOnDelete();
            $table->string('phone_type', 32);
            $table->string('phone_number');
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        Schema::create('company_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_setting_id')->constrained('company_settings')->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('branch_name')->nullable();
            $table->string('account_number');
            $table->string('account_name')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        if (! DB::table('company_settings')->where('id', 1)->exists()) {
            DB::table('company_settings')->insert([
                'id' => 1,
                'company_name' => 'Skyline OMS',
                'registered_address' => 'Update your registered business address in Company Settings.',
                'company_email' => null,
                'tin_number' => null,
                'vat_number' => null,
                'site_icon_path' => null,
                'time_zone' => 'Asia/Colombo',
                'currency_code' => 'LKR',
                'currency_symbol' => 'LKR',
                'currency_format' => '{symbol} {amount}',
                'created_by' => null,
                'updated_by' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('company_bank_accounts');
        Schema::dropIfExists('company_phone_numbers');
        Schema::dropIfExists('company_settings');
    }
};
