<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (! Schema::hasColumn('duty_cost_calculations', 'purchasing_currency')) {
                $table->string('purchasing_currency', 10)->default('USD')->after('supplier_name');
            }
            if (! Schema::hasColumn('duty_cost_calculations', 'local_currency')) {
                $table->string('local_currency', 10)->default('LKR')->after('purchasing_currency');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'local_currency')) {
                $table->dropColumn('local_currency');
            }
            if (Schema::hasColumn('duty_cost_calculations', 'purchasing_currency')) {
                $table->dropColumn('purchasing_currency');
            }
        });
    }
};

