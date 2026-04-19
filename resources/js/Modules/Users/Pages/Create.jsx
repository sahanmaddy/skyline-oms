import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import UserForm from '@/Modules/Users/Components/UserForm';
import useToast from '@/feedback/useToast';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm } from '@inertiajs/react';

export default function Create({ roles, statusOptions, employeesForLink, activeBranches, suggestedBranchId }) {
    const toast = useToast();
    const defaultBranchId =
        suggestedBranchId && activeBranches?.some((b) => b.id === suggestedBranchId)
            ? suggestedBranchId
            : (activeBranches?.[0]?.id ?? '');
    const initialBranchIds = defaultBranchId ? [defaultBranchId] : [];
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: roles?.length ? [roles[0]] : [],
        status: statusOptions?.[0] || 'active',
        branch_ids: initialBranchIds,
        branch_id: defaultBranchId,
        employee_id: '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="New user" />}>
            <Head title="New user · Settings" />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Users', href: route('settings.users.index') },
                    { label: 'New user' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.users.index')}
                        backLabel="← Back to users"
                    />

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <UserForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        roles={roles}
                        statusOptions={statusOptions}
                        employeesForLink={employeesForLink}
                        activeBranches={activeBranches}
                        submitLabel="Create user"
                        showPasswordFields
                        requirePassword
                        onCancel={() => router.get(route('settings.users.index'))}
                        onClientValidationError={() =>
                            toast.error('Please fix the highlighted fields and try again.')
                        }
                        onSubmit={() =>
                            post(route('settings.users.store'), {
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
