import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { hrSectionNavItems } from '@/config/moduleNavigation';

const HUMAN_RESOURCE_TITLE = 'Human Resource';

export default function HrModuleLayout({ children, breadcrumbs = [] }) {
    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <ModuleHeader title={HUMAN_RESOURCE_TITLE} />
                <ModuleSubnav items={hrSectionNavItems()} ariaLabel="Human Resource sections" />
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
