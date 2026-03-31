<?php

use App\Services\Permissions\SyncPermissionsFromCatalog;
use App\Support\PermissionCatalog;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('permissions:sync', function () {
    app(SyncPermissionsFromCatalog::class)->sync();
    $this->info('Permissions synced from '.PermissionCatalog::class.'.');
})->purpose('Upsert permission rows from the application permission catalog');

Artisan::command('employees:normalize-codes', function () {
    DB::transaction(function () {
        $employees = DB::table('employees')
            ->select(['id'])
            ->orderBy('id')
            ->get();

        if ($employees->isEmpty()) {
            $this->info('No employees found.');

            return;
        }

        // Two-phase rewrite avoids unique-key collisions while reassigning.
        foreach ($employees as $index => $employee) {
            DB::table('employees')
                ->where('id', $employee->id)
                ->update([
                    'employee_code' => 'TMP-E-'.($index + 1),
                    'updated_at' => now(),
                ]);
        }

        foreach ($employees as $index => $employee) {
            DB::table('employees')
                ->where('id', $employee->id)
                ->update([
                    'employee_code' => 'E-'.($index + 1),
                    'updated_at' => now(),
                ]);
        }

        $this->info("Normalized {$employees->count()} employee code(s) to E-1, E-2, ...");
    });
})->purpose('Normalize all employee codes to E-1, E-2 format');

Artisan::command('customers:normalize-codes', function () {
    DB::transaction(function () {
        $customers = DB::table('customers')
            ->select(['id'])
            ->orderBy('id')
            ->get();

        if ($customers->isEmpty()) {
            $this->info('No customers found.');

            return;
        }

        foreach ($customers as $index => $customer) {
            DB::table('customers')
                ->where('id', $customer->id)
                ->update([
                    'customer_code' => 'TMP-C-'.($index + 1),
                    'updated_at' => now(),
                ]);
        }

        foreach ($customers as $index => $customer) {
            DB::table('customers')
                ->where('id', $customer->id)
                ->update([
                    'customer_code' => 'C-'.($index + 1),
                    'updated_at' => now(),
                ]);
        }

        $this->info("Normalized {$customers->count()} customer code(s) to C-1, C-2, ...");
    });
})->purpose('Normalize all customer codes to C-1, C-2 format');
