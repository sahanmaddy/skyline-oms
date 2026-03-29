/**
 * Human Resource, Sales, and Settings module sub-navigation. Uses global route() from Ziggy.
 */

export function settingsSectionNavItems(isAdmin = false) {
    const items = [
        {
            key: 'profile',
            label: 'Profile',
            href: route('settings.profile.edit'),
            activePattern: 'settings.profile.*',
        },
    ];

    if (isAdmin) {
        items.push({
            key: 'users',
            label: 'Users',
            href: route('settings.users.index'),
            activePattern: 'settings.users.*',
        });
    }

    return items;
}

/**
 * Human Resource and Sales module sub-navigation. Uses global route() from Ziggy.
 */
export function hrSectionNavItems() {
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

export function salesSectionNavItems() {
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
