<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('phone_type');
            $table->string('country_code', 10)->default('+94');
            $table->string('country_iso2', 2)->nullable();
            $table->string('phone_number');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['branch_id', 'phone_type']);
        });

        $rows = DB::table('branches')->whereNotNull('phone')->where('phone', '!=', '')->get(['id', 'phone']);
        foreach ($rows as $row) {
            DB::table('branch_phone_numbers')->insert([
                'branch_id' => $row->id,
                'phone_type' => 'Mobile',
                'country_code' => '+94',
                'country_iso2' => 'LK',
                'phone_number' => $row->phone,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->string('phone', 80)->nullable()->after('country');
        });

        $rows = DB::table('branch_phone_numbers')->where('is_primary', true)->get(['branch_id', 'phone_number']);
        foreach ($rows as $row) {
            DB::table('branches')->where('id', $row->branch_id)->update([
                'phone' => $row->phone_number,
            ]);
        }

        Schema::dropIfExists('branch_phone_numbers');
    }
};
