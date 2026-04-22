import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import UserForm from '@/Modules/Users/Components/UserForm';
import useToast from '@/feedback/useToast';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm } from '@inertiajs/react';

export default function Edit({
    user,
    roles,
    statusOptions,
    employeesForLink,
    activeBranches,
    suggestedBranchId,
}) {
    const toast = useToast();
    const defaultBranchId =
        suggestedBranchId && activeBranches?.some((b) => b.id === suggestedBranchId)
            ? suggestedBranchId
            : (user.branch_id ?? user.branch?.id ?? '');
    const assignedIds =
        user.assigned_branches?.length > 0
            ? user.assigned_branches.map((b) => b.id)
            : defaultBranchId
              ? [defaultBranchId]
              : [];
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((r) => r.name) || (roles?.length ? [roles[0]] : []),
        status: user.status || statusOptions?.[0] || 'active',
        branch_ids: assignedIds,
        branch_id: defaultBranchId,
        employee_id: user.employee?.id ?? '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Edit user" />}>
            <Head title={`Edit ${user.name} · Settings`} />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Users', href: route('settings.users.index') },
                    { label: user.name, href: route('settings.users.show', user.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.users.show', user.id)}
                        backLabel="← Back to user"
                    />

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                        Leave password fields blank to keep the current password.
                    </div>

                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        roles={roles}
                        statusOptions={statusOptions}
                        employeesForLink={employeesForLink}
                        activeBranches={activeBranches}
                        submitLabel="Update user"
                        showPasswordFields
                        requirePassword={false}
                        onCancel={() => router.get(route('settings.users.show', user.id))}
                        onClientValidationError={() =>
                            toast.error('Please fix the highlighted fields and try again.')
                        }
                        onSubmit={() =>
                            put(route('settings.users.update', user.id), {
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
