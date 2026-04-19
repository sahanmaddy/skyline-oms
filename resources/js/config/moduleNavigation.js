/**
 * Human Resource, Sales, and Settings module sub-navigation. Uses global route() from Ziggy.
 * Pass `auth.permissions` from Inertia to filter items (Spatie permission names).
 */

export function settingsSectionNavItems({
    canViewUsers = false,
    canViewRoles = false,
    canViewPermissions = false,
    canViewCompanySettings = false,
    canViewSystemSettings = false,
    canViewBranches = false,
} = {}) {
    const items = [
        {
            key: 'profile',
            label: 'Profile',
            href: route('settings.profile.edit'),
            activePattern: 'settings.profile.*',
        },
    ];

    if (canViewBranches) {
        items.push({
            key: 'branches',
            label: 'Branches',
            href: route('settings.branches.index'),
            activePattern: 'settings.branches.*',
        });
    }

    if (canViewUsers) {
        items.push({
            key: 'users',
            label: 'Users',
            href: route('settings.users.index'),
            activePattern: 'settings.users.*',
        });
    }

    if (canViewRoles) {
        items.push({
            key: 'roles',
            label: 'Roles',
            href: route('settings.roles.index'),
            activePattern: 'settings.roles.*',
        });
    }

    if (canViewPermissions) {
        items.push({
            key: 'permissions',
            label: 'Permissions',
            href: route('settings.permissions.index'),
            activePattern: 'settings.permissions.*',
        });
    }

    if (canViewCompanySettings) {
        items.push({
            key: 'company',
            label: 'Company Settings',
            href: route('settings.company'),
            activePattern: 'settings.company*',
        });
    }

    if (canViewSystemSettings) {
        items.push({
            key: 'system',
            label: 'System Settings',
            href: route('settings.system'),
            activePattern: 'settings.system',
        });
    }

    return items;
}

/**
 * Human Resource module sub-navigation. Requires `employees.view` for Employees; other sections
 * follow the same gate until they have dedicated permissions.
 */
export function hrSectionNavItems(permissions = []) {
    const p = permissions ?? [];
    if (!p.includes('employees.view')) {
        return [];
    }

    return [
        {
            key: 'employees',
            label: 'Employees',
            href: route('hr.employees.index'),
            activePattern: 'hr.employees.*',
        },
        {
            key: 'attendance',
            label: 'Attendance',
            href: route('hr.attendance'),
            activePattern: 'hr.attendance',
        },
        {
            key: 'payroll',
            label: 'Payroll',
            href: route('hr.payroll'),
            activePattern: 'hr.payroll',
        },
        {
            key: 'leave',
            label: 'Leave',
            href: route('hr.leave'),
            activePattern: 'hr.leave',
        },
        {
            key: 'documents',
            label: 'Documents',
            href: route('hr.documents'),
            activePattern: 'hr.documents',
        },
    ];
}

/**
 * Sales module sub-navigation. Customers (and placeholder sections) require `customers.view`
 * until separate sales permissions exist.
 */
export function salesSectionNavItems(permissions = []) {
    const p = permissions ?? [];
    if (!p.includes('customers.view')) {
        return [];
    }

    return [
        {
            key: 'customers',
            label: 'Customers',
            href: route('sales.customers.index'),
            activePattern: 'sales.customers.*',
        },
        {
            key: 'orders',
            label: 'Sales Orders',
            href: route('sales.orders'),
            activePattern: 'sales.orders',
        },
        {
            key: 'invoices',
            label: 'Invoices',
            href: route('sales.invoices'),
            activePattern: 'sales.invoices',
        },
        {
            key: 'payments',
            label: 'Payments',
            href: route('sales.payments'),
            activePattern: 'sales.payments',
        },
        {
            key: 'returns',
            label: 'Returns',
            href: route('sales.returns'),
            activePattern: 'sales.returns',
        },
    ];
}

/**
 * Procurement module sub-navigation. Current scope is duty/landed cost estimation only.
 */
export function procurementSectionNavItems(permissions = []) {
    const p = permissions ?? [];
    if (!p.includes('calculator.view')) {
        return [];
    }

    return [
        {
            key: 'duty-cost-calculator',
            label: 'Duty & Cost Calculator',
            href: route('procurement.duty-cost-calculations.index'),
            activePattern: 'procurement.duty-cost-calculations.*',
        },
    ];
}
