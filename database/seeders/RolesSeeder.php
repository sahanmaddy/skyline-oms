<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'web';

        $defaults = [
            'Admin' => 'Complete platform/system control.',
            'Management' => 'Cross-team operational oversight without full system admin.',
            'Sales and Marketing' => 'Customer and sales workflow ownership.',
            'Accounting and Finance' => 'Finance/compliance and payment/reporting support.',
            'Human Resources' => 'Employee and core HR operations management.',
        ];

        foreach ($defaults as $roleName => $description) {
            Role::query()->updateOrCreate(
                ['name' => $roleName, 'guard_name' => $guard],
                [
                    'description' => $description,
                    'is_active' => true,
                    'is_system' => false,
                ],
            );
        }
    }
}
