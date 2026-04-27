<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('unit_of_measures') || ! Schema::hasColumn('unit_of_measures', 'unit_type')) {
            return;
        }

        Schema::table('unit_of_measures', function (Blueprint $table) {
            $table->dropIndex(['status', 'unit_type']);
            $table->dropColumn('unit_type');
            $table->index('status');
        });
    }
};
