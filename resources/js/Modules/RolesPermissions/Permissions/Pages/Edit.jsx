import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import PermissionForm from '@/Modules/RolesPermissions/Permissions/Components/PermissionForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ permission }) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name || '',
        display_name: permission.display_name || '',
        module: permission.module || '',
        description: permission.description || '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Edit permission" />}>
            <Head title={`Edit ${permission.name} · Settings`} />
            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Permissions', href: route('settings.permissions.index') },
                    { label: permission.name, href: route('settings.permissions.show', permission.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="space-y-4">
                    <ModuleDetailToolbar backHref={route('settings.permissions.show', permission.id)} backLabel="← Back to permission" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <PermissionForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            submitLabel="Save changes"
                            onSubmit={() => put(route('settings.permissions.update', permission.id))}
                            isSystemPermission={!!permission.is_system}
                        />
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
