import ModuleBreadcrumbs from '@/Components/ModuleBreadcrumbs';
import ModuleHeader from '@/Components/ModuleHeader';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleSubnav from '@/Components/ModuleSubnav';
import { settingsSectionNavItems } from '@/config/moduleNavigation';
import { usePage } from '@inertiajs/react';

const SETTINGS_TITLE = 'Settings';

export default function SettingsModuleLayout({ children, breadcrumbs = [] }) {
    const permissions = usePage().props.auth.permissions ?? [];
    const items = settingsSectionNavItems({
        canViewUsers: permissions.includes('users.view'),
        canViewRoles: permissions.includes('roles.view'),
        canViewPermissions: permissions.includes('permissions.view'),
        canViewCompanySettings: permissions.includes('settings.company.view'),
        canViewSystemSettings: permissions.includes('settings.system.view'),
    });

    return (
        <ModulePageShell>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <ModuleHeader title={SETTINGS_TITLE} />
                <ModuleSubnav items={items} ariaLabel="Settings sections" />
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
