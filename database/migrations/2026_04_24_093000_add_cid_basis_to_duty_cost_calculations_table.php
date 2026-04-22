<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (! Schema::hasColumn('duty_cost_calculations', 'cid_basis')) {
                $table->string('cid_basis', 20)->default('weight')->after('cid_rate_per_kg_lkr');
            }
        });
    }

    public function down(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (Schema::hasColumn('duty_cost_calculations', 'cid_basis')) {
                $table->dropColumn('cid_basis');
            }
        });
    }
};
