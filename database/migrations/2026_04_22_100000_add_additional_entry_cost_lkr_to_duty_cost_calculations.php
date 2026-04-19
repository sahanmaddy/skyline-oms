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
            if (! Schema::hasColumn('duty_cost_calculations', 'additional_entry_cost_lkr')) {
                if (Schema::hasColumn('duty_cost_calculations', 'demurrage_cost_lkr')) {
                    $table->decimal('additional_entry_cost_lkr', 15, 2)->default(0)->after('demurrage_cost_lkr');
                } else {
                    $table->decimal('additional_entry_cost_lkr', 15, 2)->default(0);
                }
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'additional_entry_cost_lkr')) {
                $table->dropColumn('additional_entry_cost_lkr');
            }
        });
    }
};
