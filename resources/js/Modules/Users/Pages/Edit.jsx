import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import UserForm from '@/Modules/Users/Components/UserForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ user, roles, statusOptions, employeesForLink }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        roles: user.roles?.map((r) => r.name) || (roles?.length ? [roles[0]] : []),
        status: user.status || statusOptions?.[0] || 'active',
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
                        submitLabel="Save"
                        showPasswordFields
                        onSubmit={() => put(route('settings.users.update', user.id))}
                    />
                </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
