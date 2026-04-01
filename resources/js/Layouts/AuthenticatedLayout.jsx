import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function sidebarItemClass(active) {
    return (
        'block rounded-md border-l-[3px] py-2 ps-[calc(0.75rem-3px)] pe-3 text-sm font-medium transition-colors ' +
        (active
            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-cursor-accent dark:bg-cursor-raised dark:text-cursor-bright'
            : 'border-transparent text-gray-700 hover:bg-gray-50 dark:text-cursor-fg dark:hover:bg-cursor-raised')
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const roles = page.props.auth.roles ?? [];
    const permissions = page.props.auth.permissions ?? [];
    const contextBranch = page.props.auth.context_branch;
    const branchesForContext = page.props.auth.branches_for_context ?? [];

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const canAccessHr = permissions.includes('employees.view');
    const canAccessSales = permissions.includes('customers.view');

    const hrActive = route().current('hr.*');
    const salesActive = route().current('sales.*');
    const inventoryActive = route().current('inventory.*');
    const procurementActive = route().current('procurement.*');
    const financeActive = route().current('finance.*');
    const settingsActive = route().current('settings.*');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-cursor-bg">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface lg:flex">
                    <div className="flex h-16 items-center justify-between px-4">
                        <Link href={route('dashboard')} className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                            Skyline OMS
                        </Link>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-cursor-raised dark:text-cursor-fg">
                            {roles[0] ?? 'User'}
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 py-4">
                        <Link
                            href={route('dashboard')}
                            className={sidebarItemClass(route().current('dashboard'))}
                        >
                            Dashboard
                        </Link>

                        {canAccessHr && (
                            <Link href={route('hr.index')} className={sidebarItemClass(hrActive)}>
                                Human Resource
                            </Link>
                        )}

                        {canAccessSales && (
                            <Link href={route('sales.index')} className={sidebarItemClass(salesActive)}>
                                Sales
                            </Link>
                        )}

                        <Link href={route('inventory.index')} className={sidebarItemClass(inventoryActive)}>
                            Inventory
                        </Link>

                        <Link href={route('procurement.index')} className={sidebarItemClass(procurementActive)}>
                            Procurement
                        </Link>

                        <Link href={route('finance.index')} className={sidebarItemClass(financeActive)}>
                            Finance
                        </Link>

                        <Link href={route('settings.profile.edit')} className={sidebarItemClass(settingsActive)}>
                            Settings
                        </Link>
                    </nav>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface">
                        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-cursor-muted dark:hover:bg-cursor-raised dark:hover:text-cursor-bright lg:hidden"
                                    onClick={() => setShowingNavigationDropdown((v) => !v)}
                                >
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">{header ?? ' '}</div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {contextBranch ? (
                                    branchesForContext.length > 1 ? (
                                        <label className="hidden max-w-[min(100%,14rem)] sm:block">
                                            <span className="sr-only">Working branch</span>
                                            <select
                                                className="block w-full truncate rounded-md border border-gray-200 bg-white py-1.5 ps-2 pe-7 text-xs font-medium text-gray-800 shadow-sm focus:border-cursor-accent focus:outline-none focus:ring-1 focus:ring-cursor-accent dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                                value={contextBranch.id}
                                                onChange={(e) => {
                                                    router.patch(
                                                        route('settings.context.branch'),
                                                        { branch_id: Number(e.target.value) },
                                                        { preserveState: true, preserveScroll: true },
                                                    );
                                                }}
                                            >
                                                {branchesForContext.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.code} — {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ) : (
                                        <span
                                            className="hidden max-w-[12rem] truncate text-xs text-gray-600 dark:text-cursor-muted sm:inline"
                                            title={`${contextBranch.code} — ${contextBranch.name}`}
                                        >
                                            {contextBranch.code} · {contextBranch.name}
                                        </span>
                                    )
                                ) : null}
                                <div className="hidden text-sm text-gray-600 dark:text-cursor-muted md:block">{user.email}</div>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('settings.profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {showingNavigationDropdown && (
                            <div className="border-t border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface lg:hidden">
                                <div className="space-y-1 px-4 py-3">
                                    <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        Dashboard
                                    </ResponsiveNavLink>
                                    {canAccessHr && (
                                        <ResponsiveNavLink href={route('hr.index')} active={hrActive}>
                                            Human Resource
                                        </ResponsiveNavLink>
                                    )}
                                    {canAccessSales && (
                                        <ResponsiveNavLink href={route('sales.index')} active={salesActive}>
                                            Sales
                                        </ResponsiveNavLink>
                                    )}
                                    <ResponsiveNavLink href={route('inventory.index')} active={inventoryActive}>
                                        Inventory
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('procurement.index')} active={procurementActive}>
                                        Procurement
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('finance.index')} active={financeActive}>
                                        Finance
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={route('settings.profile.edit')} active={settingsActive}>
                                        Settings
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}
                    </div>

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
