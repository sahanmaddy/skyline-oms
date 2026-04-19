import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { salesSectionNavItems } from '@/config/moduleNavigation';
import { usePage } from '@inertiajs/react';

const SALES_TITLE = 'Sales';

export default function SalesModuleLayout({ children, breadcrumbs = [] }) {
    const permissions = usePage().props.auth.permissions ?? [];
    const salesNavItems = salesSectionNavItems(permissions);

    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:hidden">
                <ModuleHeader title={SALES_TITLE} />
                {salesNavItems.length > 0 ? (
                    <ModuleSubnav items={salesNavItems} ariaLabel="Sales sections" />
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
