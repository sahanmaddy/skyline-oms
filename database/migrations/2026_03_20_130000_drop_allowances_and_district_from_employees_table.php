<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'allowance_type')) {
                $table->dropColumn('allowance_type');
            }

            if (Schema::hasColumn('employees', 'allowance_amount')) {
                $table->dropColumn('allowance_amount');
            }

            if (Schema::hasColumn('employees', 'district')) {
                $table->dropColumn('district');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (! Schema::hasColumn('employees', 'allowance_type')) {
                $table->string('allowance_type')->nullable()->after('basic_salary');
            }

            if (! Schema::hasColumn('employees', 'allowance_amount')) {
                $table->decimal('allowance_amount', 12, 2)->nullable()->after(
                    'allowance_type',
                );
            }

            if (! Schema::hasColumn('employees', 'district')) {
                $table->string('district')->nullable()->after('city');
            }
        });
    }
};

