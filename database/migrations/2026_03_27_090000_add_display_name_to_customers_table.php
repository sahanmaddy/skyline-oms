<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('customer_code');
        });

        DB::table('customers')
            ->whereNull('display_name')
            ->update([
                'display_name' => DB::raw('customer_name'),
            ]);
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('display_name');
        });
    }
};
