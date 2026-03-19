import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserForm from '@/Modules/Users/Components/UserForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ user, roles, statusOptions }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.roles?.[0]?.name || roles?.[0] || '',
        status: user.status || statusOptions?.[0] || 'active',
    });

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Edit User</span>}>
            <Head title="Edit User" />

            <div className="mb-4">
                <Link
                    href={route('users.show', user.id)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to user
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
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
                    submitLabel="Save"
                    showPasswordFields
                    onSubmit={() => put(route('users.update', user.id))}
                />
            </div>
        </AuthenticatedLayout>
    );
}

