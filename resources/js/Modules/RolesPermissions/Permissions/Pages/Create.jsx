import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import PermissionForm from '@/Modules/RolesPermissions/Permissions/Components/PermissionForm';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        display_name: '',
        module: '',
        description: '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="New permission" />}>
            <Head title="New permission · Settings" />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Permissions', href: route('settings.permissions.index') }, { label: 'New permission' }]}>
                <div className="space-y-4">
                    <ModuleDetailToolbar backHref={route('settings.permissions.index')} backLabel="← Back to permissions" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <PermissionForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            submitLabel="Create permission"
                            onSubmit={() =>
                                post(route('settings.permissions.store'), {
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
