<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (! Schema::hasColumn('duty_cost_calculations', 'statistical_value_basis')) {
                $table->string('statistical_value_basis', 20)->default('weight')->after('eid_basis');
            }
        });
    }

    public function down(): void
    {
        Schema::table('duty_cost_calculations', function (Blueprint $table): void {
            if (Schema::hasColumn('duty_cost_calculations', 'statistical_value_basis')) {
                $table->dropColumn('statistical_value_basis');
            }
        });
    }
};
