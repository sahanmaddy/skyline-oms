<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $renames = [
            'procurement.duty-calculations.view' => 'calculator.view',
            'procurement.duty-calculations.create' => 'calculator.create',
            'procurement.duty-calculations.edit' => 'calculator.edit',
            'procurement.duty-calculations.delete' => 'calculator.delete',
        ];

        foreach ($renames as $from => $to) {
            DB::table('permissions')
                ->where('name', $from)
                ->where('guard_name', 'web')
                ->update([
                    'name' => $to,
                    'module' => 'Calculator',
                    'updated_at' => now(),
                ]);
        }

        DB::table('permissions')
            ->whereIn('name', array_values($renames))
            ->where('guard_name', 'web')
            ->update([
                'module' => 'Calculator',
                'updated_at' => now(),
            ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $renames = [
            'calculator.view' => 'procurement.duty-calculations.view',
            'calculator.create' => 'procurement.duty-calculations.create',
            'calculator.edit' => 'procurement.duty-calculations.edit',
            'calculator.delete' => 'procurement.duty-calculations.delete',
        ];

        foreach ($renames as $from => $to) {
            DB::table('permissions')
                ->where('name', $from)
                ->where('guard_name', 'web')
                ->update([
                    'name' => $to,
                    'module' => 'Procurement',
                    'updated_at' => now(),
                ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};

