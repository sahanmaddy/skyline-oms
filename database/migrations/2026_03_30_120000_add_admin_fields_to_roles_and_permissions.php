<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->string('description')->nullable()->after('guard_name');
            $table->boolean('is_active')->default(true)->after('description');
            $table->boolean('is_system')->default(false)->after('is_active');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('guard_name');
            $table->string('module')->default('General')->after('display_name');
            $table->string('description')->nullable()->after('module');
            $table->boolean('is_system')->default(false)->after('description');
            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropIndex(['module']);
            $table->dropColumn(['display_name', 'module', 'description', 'is_system']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['description', 'is_active', 'is_system']);
        });
    }
};
