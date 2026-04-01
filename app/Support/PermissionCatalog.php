<?php

namespace App\Support;

/**
 * Canonical list of Spatie permissions shipped with the application.
 * Prefer entity-scoped keys (e.g. customers.*, employees.*); add new keys when models and policies exist.
 * Run {@see \App\Services\Permissions\SyncPermissionsFromCatalog} (or `php artisan permissions:sync`)
 * after changing this list so the database stays in sync.
 */
final class PermissionCatalog
{
    /**
     * @return list<array{name: string, display_name: string, module: string, description: string}>
     */
    public static function definitions(): array
    {
        return [
            [
                'name' => 'dashboard.view',
                'display_name' => 'View dashboard',
                'module' => 'Dashboard',
                'description' => 'Open the main dashboard after sign-in.',
            ],
            [
                'name' => 'employees.view',
                'display_name' => 'View employees',
                'module' => 'Employees',
                'description' => 'Browse employee records, profiles, and related HR lists.',
            ],
            [
                'name' => 'employees.create',
                'display_name' => 'Create employees',
                'module' => 'Employees',
                'description' => 'Add new employee records.',
            ],
            [
                'name' => 'employees.edit',
                'display_name' => 'Edit employees',
                'module' => 'Employees',
                'description' => 'Update employee details and linked data.',
            ],
            [
                'name' => 'employees.delete',
                'display_name' => 'Delete employees',
                'module' => 'Employees',
                'description' => 'Remove employee records where policy allows.',
            ],
            [
                'name' => 'customers.view',
                'display_name' => 'View customers',
                'module' => 'Customers',
                'description' => 'Browse customer accounts and contact information.',
            ],
            [
                'name' => 'customers.create',
                'display_name' => 'Create customers',
                'module' => 'Customers',
                'description' => 'Create new customer records.',
            ],
            [
                'name' => 'customers.edit',
                'display_name' => 'Edit customers',
                'module' => 'Customers',
                'description' => 'Update customer details and related data.',
            ],
            [
                'name' => 'customers.delete',
                'display_name' => 'Delete customers',
                'module' => 'Customers',
                'description' => 'Delete customer records where policy allows.',
            ],
            [
                'name' => 'users.view',
                'display_name' => 'View users',
                'module' => 'Users',
                'description' => 'Browse application user accounts and their roles.',
            ],
            [
                'name' => 'users.create',
                'display_name' => 'Create users',
                'module' => 'Users',
                'description' => 'Create sign-in accounts and assign roles.',
            ],
            [
                'name' => 'users.edit',
                'display_name' => 'Edit users',
                'module' => 'Users',
                'description' => 'Update user profiles, status, roles, and employee links.',
            ],
            [
                'name' => 'users.delete',
                'display_name' => 'Delete users',
                'module' => 'Users',
                'description' => 'Remove user accounts where policy allows.',
            ],
            [
                'name' => 'roles.view',
                'display_name' => 'View roles',
                'module' => 'Roles',
                'description' => 'Open the roles list and role detail pages.',
            ],
            [
                'name' => 'roles.create',
                'display_name' => 'Create roles',
                'module' => 'Roles',
                'description' => 'Define new roles and assign permissions.',
            ],
            [
                'name' => 'roles.edit',
                'display_name' => 'Edit roles',
                'module' => 'Roles',
                'description' => 'Change role names, status, and permission assignments.',
            ],
            [
                'name' => 'roles.delete',
                'display_name' => 'Delete roles',
                'module' => 'Roles',
                'description' => 'Remove roles that are not in use.',
            ],
            [
                'name' => 'permissions.view',
                'display_name' => 'View permissions',
                'module' => 'Permissions',
                'description' => 'Open the permissions list and permission detail pages.',
            ],
            [
                'name' => 'permissions.create',
                'display_name' => 'Create permissions',
                'module' => 'Permissions',
                'description' => 'Add new permission keys for use in roles and authorization checks.',
            ],
            [
                'name' => 'permissions.edit',
                'display_name' => 'Edit permissions',
                'module' => 'Permissions',
                'description' => 'Update labels, module, and descriptions; system keys cannot be renamed.',
            ],
            [
                'name' => 'permissions.delete',
                'display_name' => 'Delete permissions',
                'module' => 'Permissions',
                'description' => 'Remove custom permissions that are not system-seeded or protected.',
            ],
            [
                'name' => 'settings.view',
                'display_name' => 'View settings',
                'module' => 'Settings',
                'description' => 'Access Settings navigation (profile, users, roles, and module placeholders).',
            ],
            [
                'name' => 'settings.company.view',
                'display_name' => 'View company settings',
                'module' => 'Settings',
                'description' => 'Access the Company Settings area when it is enabled for the role.',
            ],
            [
                'name' => 'settings.system.view',
                'display_name' => 'View system settings',
                'module' => 'Settings',
                'description' => 'Access the System Settings area when it is enabled for the role.',
            ],
            [
                'name' => 'branches.view',
                'display_name' => 'View branches',
                'module' => 'Settings',
                'description' => 'Open the branches list and branch detail pages.',
            ],
            [
                'name' => 'branches.create',
                'display_name' => 'Create branches',
                'module' => 'Settings',
                'description' => 'Add new company branches or locations.',
            ],
            [
                'name' => 'branches.edit',
                'display_name' => 'Edit branches',
                'module' => 'Settings',
                'description' => 'Update branch details, contact information, and active status.',
            ],
            [
                'name' => 'branches.delete',
                'display_name' => 'Delete branches',
                'module' => 'Settings',
                'description' => 'Remove branches that are not assigned to users or employees.',
            ],
        ];
    }

    /**
     * @return list<string>
     */
    public static function names(): array
    {
        return array_map(static fn (array $row) => $row['name'], self::definitions());
    }
}
