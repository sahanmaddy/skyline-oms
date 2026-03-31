<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (! Schema::hasColumn('employees', 'given_names')) {
                $table->string('given_names')->nullable()->after('last_name');
            }

            if (! Schema::hasColumn('employees', 'gender')) {
                $table->string('gender')->nullable()->after('given_names');
            }

            if (! Schema::hasColumn('employees', 'marital_status')) {
                $table->string('marital_status')->nullable()->after('gender');
            }

            if (! Schema::hasColumn('employees', 'profile_photo_path')) {
                $table->string('profile_photo_path')->nullable()->after('marital_status');
            }

            if (! Schema::hasColumn('employees', 'emergency_contact_person')) {
                $table->string('emergency_contact_person')->nullable()->after('country');
            }

            if (! Schema::hasColumn('employees', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_person');
            }

            if (! Schema::hasColumn('employees', 'employment_type')) {
                $table->string('employment_type')->nullable()->after('department');
            }

            if (! Schema::hasColumn('employees', 'basic_salary')) {
                $table->decimal('basic_salary', 12, 2)->nullable()->after('employment_type');
            }

            if (! Schema::hasColumn('employees', 'allowance_type')) {
                $table->string('allowance_type')->nullable()->after('basic_salary');
            }

            if (! Schema::hasColumn('employees', 'allowance_amount')) {
                $table->decimal('allowance_amount', 12, 2)->nullable()->after('allowance_type');
            }

            if (! Schema::hasColumn('employees', 'is_overtime_eligible')) {
                $table->boolean('is_overtime_eligible')->default(false)->after('allowance_amount');
            }

            if (! Schema::hasColumn('employees', 'epf_number')) {
                $table->string('epf_number')->nullable()->after('bank_account_number');
            }

            if (! Schema::hasColumn('employees', 'etf_number')) {
                $table->string('etf_number')->nullable()->after('epf_number');
            }

            if (! Schema::hasColumn('employees', 'district')) {
                $table->string('district')->nullable()->after('city');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            foreach ([
                'given_names',
                'gender',
                'marital_status',
                'profile_photo_path',
                'emergency_contact_person',
                'emergency_contact_phone',
                'employment_type',
                'basic_salary',
                'allowance_type',
                'allowance_amount',
                'is_overtime_eligible',
                'epf_number',
                'etf_number',
                'district',
            ] as $column) {
                if (Schema::hasColumn('employees', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

