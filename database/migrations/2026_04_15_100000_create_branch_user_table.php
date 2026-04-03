<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'branch_id']);
        });

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('
                INSERT INTO branch_user (user_id, branch_id, created_at, updated_at)
                SELECT id, branch_id, NOW(), NOW()
                FROM users
                WHERE branch_id IS NOT NULL
            ');
        } else {
            $rows = DB::table('users')
                ->whereNotNull('branch_id')
                ->select('id as user_id', 'branch_id')
                ->get();

            foreach ($rows as $row) {
                DB::table('branch_user')->insert([
                    'user_id' => $row->user_id,
                    'branch_id' => $row->branch_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_user');
    }
};
