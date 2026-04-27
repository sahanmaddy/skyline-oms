<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_bank_accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('company_bank_accounts', 'swift_bic_code')) {
                $table->string('swift_bic_code', 50)->nullable()->after('account_name');
            }
        });

        Schema::table('supplier_bank_accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('supplier_bank_accounts', 'swift_bic_code')) {
                $table->string('swift_bic_code', 50)->nullable()->after('account_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('company_bank_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('company_bank_accounts', 'swift_bic_code')) {
                $table->dropColumn('swift_bic_code');
            }
        });

        Schema::table('supplier_bank_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_bank_accounts', 'swift_bic_code')) {
                $table->dropColumn('swift_bic_code');
            }
        });
    }
};

