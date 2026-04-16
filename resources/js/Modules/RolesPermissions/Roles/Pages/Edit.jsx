import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import RoleForm from '@/Modules/RolesPermissions/Roles/Components/RoleForm';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ role, permissionGroups, assignedPermissionIds }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        description: role.description || '',
        is_active: !!role.is_active,
        permission_ids: assignedPermissionIds || [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Edit role" />}>
            <Head title={`Edit ${role.name} · Settings`} />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Roles', href: route('settings.roles.index') }, { label: role.name, href: route('settings.roles.show', role.id) }, { label: 'Edit' }]}>
                <div className="space-y-4">
                    <ModuleDetailToolbar backHref={route('settings.roles.show', role.id)} backLabel="← Back to role" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <RoleForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            permissionGroups={permissionGroups}
                            submitLabel="Save changes"
                            onSubmit={() =>
                                put(route('settings.roles.update', role.id), {
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
