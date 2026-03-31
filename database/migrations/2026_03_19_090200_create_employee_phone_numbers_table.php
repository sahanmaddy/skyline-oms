<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('phone_type');
            $table->string('country_code', 10)->default('+94');
            $table->string('phone_number');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['employee_id', 'phone_type']);
        });

        $rows = DB::table('employees')->whereNotNull('phone')->get(['id', 'phone']);
        foreach ($rows as $row) {
            DB::table('employee_phone_numbers')->insert([
                'employee_id' => $row->id,
                'phone_type' => 'Mobile',
                'country_code' => '+94',
                'phone_number' => $row->phone,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('display_name');
        });

        $rows = DB::table('employee_phone_numbers')->where('is_primary', true)->get(['employee_id', 'phone_number']);
        foreach ($rows as $row) {
            DB::table('employees')->where('id', $row->employee_id)->update([
                'phone' => $row->phone_number,
            ]);
        }

        Schema::dropIfExists('employee_phone_numbers');
    }
};
