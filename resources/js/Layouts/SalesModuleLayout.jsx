import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { salesSectionNavItems } from '@/config/moduleNavigation';

const SALES_TITLE = 'Sales';

export default function SalesModuleLayout({ children, breadcrumbs = [] }) {
    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <ModuleHeader title={SALES_TITLE} />
                <ModuleSubnav items={salesSectionNavItems()} ariaLabel="Sales sections" />
            </div>

            {breadcrumbs.length > 0 ? (
                <div className="pt-1">
                    <ModuleBreadcrumbs items={breadcrumbs} />
                </div>
            ) : null}

            <div className="space-y-5">{children}</div>
        </ModulePageShell>
    );
}
