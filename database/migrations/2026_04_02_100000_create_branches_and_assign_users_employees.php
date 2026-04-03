<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('city', 120)->nullable();
            $table->string('country', 120)->default('Sri Lanka');
            $table->string('phone', 80)->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        $defaultBranchId = DB::table('branches')->insertGetId([
            'code' => 'BR-1',
            'name' => 'Head Office',
            'address_line_1' => null,
            'address_line_2' => null,
            'city' => null,
            'country' => 'Sri Lanka',
            'phone' => null,
            'email' => null,
            'is_active' => true,
            'notes' => 'Default branch created during migration.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained('branches')
                ->restrictOnDelete();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained('branches')
                ->restrictOnDelete();
        });

        DB::table('users')->whereNull('branch_id')->update(['branch_id' => $defaultBranchId]);
        DB::table('employees')->whereNull('branch_id')->update(['branch_id' => $defaultBranchId]);

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE users MODIFY branch_id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE employees MODIFY branch_id BIGINT UNSIGNED NOT NULL');
        }
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        Schema::dropIfExists('branches');
    }
};
