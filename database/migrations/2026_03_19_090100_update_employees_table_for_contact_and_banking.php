<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->boolean('is_sales_commission_eligible')->default(false)->index()->after('user_id');

            $table->string('nic')->nullable()->after('department');

            $table->string('address_line_1')->nullable()->after('notes');
            $table->string('address_line_2')->nullable()->after('address_line_1');
            $table->string('city')->nullable()->after('address_line_2');
            $table->string('country')->nullable()->after('city');

            $table->string('bank_name')->nullable()->after('country');
            $table->string('bank_branch')->nullable()->after('bank_name');
            $table->string('bank_account_number')->nullable()->after('bank_branch');
        });

        DB::table('employees')->update([
            'is_sales_commission_eligible' => DB::raw('is_salesperson'),
        ]);

        Schema::table('employees', function (Blueprint $table) {
            // SQLite (and consistent ordering elsewhere): drop the index before dropping the column,
            // or ALTER TABLE DROP COLUMN leaves a broken index and fails.
            $table->dropIndex(['is_salesperson']);
            $table->dropColumn('is_salesperson');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->boolean('is_salesperson')->default(false)->index()->after('user_id');
        });

        DB::table('employees')->update([
            'is_salesperson' => DB::raw('is_sales_commission_eligible'),
        ]);

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['is_sales_commission_eligible']);
            $table->dropColumn([
                'is_sales_commission_eligible',
                'nic',
                'address_line_1',
                'address_line_2',
                'city',
                'country',
                'bank_name',
                'bank_branch',
                'bank_account_number',
            ]);
        });
    }
};
