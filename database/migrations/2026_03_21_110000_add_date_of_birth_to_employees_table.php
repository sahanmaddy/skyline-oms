<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('employees', 'date_of_birth')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('joined_date');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('employees', 'date_of_birth')) {
            return;
        }

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('date_of_birth');
        });
    }
};
