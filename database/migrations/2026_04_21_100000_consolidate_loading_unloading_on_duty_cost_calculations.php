<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        if (Schema::hasColumn('duty_cost_calculations', 'loading_unloading_cost_lkr')) {
            return;
        }

        if (! Schema::hasColumn('duty_cost_calculations', 'loading_cost_lkr')
            && ! Schema::hasColumn('duty_cost_calculations', 'unloading_cost_lkr')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            if (Schema::hasColumn('duty_cost_calculations', 'freight_cost_total')) {
                $table->decimal('loading_unloading_cost_lkr', 15, 2)->default(0)->after('freight_cost_total');
            } else {
                $table->decimal('loading_unloading_cost_lkr', 15, 2)->default(0);
            }
        });

        $hasLoading = Schema::hasColumn('duty_cost_calculations', 'loading_cost_lkr');
        $hasUnloading = Schema::hasColumn('duty_cost_calculations', 'unloading_cost_lkr');
        if ($hasLoading && $hasUnloading) {
            DB::statement(
                'UPDATE duty_cost_calculations SET loading_unloading_cost_lkr = COALESCE(loading_cost_lkr, 0) + COALESCE(unloading_cost_lkr, 0)',
            );
        } elseif ($hasUnloading) {
            DB::statement(
                'UPDATE duty_cost_calculations SET loading_unloading_cost_lkr = COALESCE(unloading_cost_lkr, 0)',
            );
        } elseif ($hasLoading) {
            DB::statement(
                'UPDATE duty_cost_calculations SET loading_unloading_cost_lkr = COALESCE(loading_cost_lkr, 0)',
            );
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            $drop = [];
            if (Schema::hasColumn('duty_cost_calculations', 'loading_cost_lkr')) {
                $drop[] = 'loading_cost_lkr';
            }
            if (Schema::hasColumn('duty_cost_calculations', 'unloading_cost_lkr')) {
                $drop[] = 'unloading_cost_lkr';
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('duty_cost_calculations')) {
            return;
        }

        if (! Schema::hasColumn('duty_cost_calculations', 'loading_unloading_cost_lkr')) {
            return;
        }

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            $table->decimal('loading_cost_lkr', 15, 2)->default(0);
            $table->decimal('unloading_cost_lkr', 15, 2)->default(0);
        });

        DB::statement(
            'UPDATE duty_cost_calculations SET unloading_cost_lkr = COALESCE(loading_unloading_cost_lkr, 0), loading_cost_lkr = 0',
        );

        Schema::table('duty_cost_calculations', function (Blueprint $table) {
            $table->dropColumn('loading_unloading_cost_lkr');
        });
    }
};
