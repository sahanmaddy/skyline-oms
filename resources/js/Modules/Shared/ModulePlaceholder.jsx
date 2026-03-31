import ComingSoonState from '@/Components/ComingSoonState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HrModuleLayout from '@/Layouts/HrModuleLayout';
import ModulePageShell from '@/Components/ModulePageShell';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head } from '@inertiajs/react';

export default function ModulePlaceholder({
    area,
    moduleTitle,
    headTitle,
    breadcrumbs = [],
    title,
    description,
}) {
    const panel = <ComingSoonState title={title} description={description} />;

    let body;
    if (area === 'hr') {
        body = <HrModuleLayout breadcrumbs={breadcrumbs}>{panel}</HrModuleLayout>;
    } else if (area === 'sales') {
        body = <SalesModuleLayout breadcrumbs={breadcrumbs}>{panel}</SalesModuleLayout>;
    } else if (area === 'settings') {
        body = <SettingsModuleLayout breadcrumbs={breadcrumbs}>{panel}</SettingsModuleLayout>;
    } else {
        body = <ModulePageShell>{panel}</ModulePageShell>;
    }

    const header =
        area === 'hr' || area === 'sales' || area === 'settings' ? (
            <ModuleStickyTitle module={moduleTitle} section={title} />
        ) : (
            <span className="text-base font-semibold text-gray-900">{moduleTitle}</span>
        );

    return (
        <AuthenticatedLayout header={header}>
            <Head title={headTitle} />
            {body}
        </AuthenticatedLayout>
    );
}
