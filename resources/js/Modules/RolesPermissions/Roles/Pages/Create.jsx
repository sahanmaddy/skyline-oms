import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import RoleForm from '@/Modules/RolesPermissions/Roles/Components/RoleForm';
import useToast from '@/feedback/useToast';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ permissionGroups }) {
    const toast = useToast();
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
                            onClientValidationError={() =>
                                toast.error('Please fix the highlighted fields and try again.')
                            }
                            onSubmit={() =>
                                post(route('settings.roles.store'), {
                                    onError: () => {
                                        scrollToFirstError();
                                        toast.error('Please fix the highlighted fields and try again.');
                                    },
                                })
                            }
                        />
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
