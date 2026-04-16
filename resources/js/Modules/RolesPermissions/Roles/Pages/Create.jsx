import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import RoleForm from '@/Modules/RolesPermissions/Roles/Components/RoleForm';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ permissionGroups }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        is_active: true,
        permission_ids: [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="New role" />}>
            <Head title="New role · Settings" />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Roles', href: route('settings.roles.index') }, { label: 'New role' }]}>
                <div className="space-y-4">
                    <ModuleDetailToolbar backHref={route('settings.roles.index')} backLabel="← Back to roles" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <RoleForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            permissionGroups={permissionGroups}
                            submitLabel="Create role"
                            onSubmit={() =>
                                post(route('settings.roles.store'), {
                                    onError: () => scrollToFirstError(),
                                })
                            }
                        />
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
