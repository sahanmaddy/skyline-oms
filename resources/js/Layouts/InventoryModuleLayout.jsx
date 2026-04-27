import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { inventorySectionNavItems } from '@/config/moduleNavigation';
import { usePage } from '@inertiajs/react';

const INVENTORY_TITLE = 'Inventory';

export default function InventoryModuleLayout({ children, breadcrumbs = [] }) {
    const rawPermissions = usePage().props.auth?.permissions;
    const permissions = Array.isArray(rawPermissions) ? rawPermissions : [];
    const navItems = inventorySectionNavItems(permissions);

    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:hidden dark:border-cursor-border dark:bg-cursor-surface">
                <ModuleHeader title={INVENTORY_TITLE} />
                {navItems.length > 0 ? (
                    <ModuleSubnav items={navItems} ariaLabel="Inventory sections" />
                ) : null}
            </div>

            {breadcrumbs.length > 0 ? (
                <div className="pt-1 print:hidden">
                    <ModuleBreadcrumbs items={breadcrumbs} />
                </div>
            ) : null}

            <div className="space-y-5">{children}</div>
        </ModulePageShell>
    );
}
