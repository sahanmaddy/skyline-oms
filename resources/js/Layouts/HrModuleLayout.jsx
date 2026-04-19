import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { hrSectionNavItems } from '@/config/moduleNavigation';
import { usePage } from '@inertiajs/react';

const HUMAN_RESOURCE_TITLE = 'Human Resource';

export default function HrModuleLayout({ children, breadcrumbs = [] }) {
    const permissions = usePage().props.auth.permissions ?? [];
    const hrNavItems = hrSectionNavItems(permissions);

    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm print:hidden">
                <ModuleHeader title={HUMAN_RESOURCE_TITLE} />
                {hrNavItems.length > 0 ? (
                    <ModuleSubnav items={hrNavItems} ariaLabel="Human Resource sections" />
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
