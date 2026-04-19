import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { procurementSectionNavItems } from '@/config/moduleNavigation';
import { usePage } from '@inertiajs/react';

const PROCUREMENT_TITLE = 'Procurement';

export default function ProcurementModuleLayout({ children, breadcrumbs = [] }) {
    const rawPermissions = usePage().props.auth?.permissions;
    const permissions = Array.isArray(rawPermissions) ? rawPermissions : [];
    const navItems = procurementSectionNavItems(permissions);

    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:hidden">
                <ModuleHeader title={PROCUREMENT_TITLE} />
                {navItems.length > 0 ? (
                    <ModuleSubnav items={navItems} ariaLabel="Procurement sections" />
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

