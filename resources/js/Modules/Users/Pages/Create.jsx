import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserForm from '@/Modules/Users/Components/UserForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ roles, statusOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles?.[0] || '',
        status: statusOptions?.[0] || 'active',
    });

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">New User</span>}>
            <Head title="New User" />

            <div className="mb-4">
                <Link
                    href={route('users.index')}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to users
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    roles={roles}
                    statusOptions={statusOptions}
                    submitLabel="Create"
                    showPasswordFields
                    onSubmit={() => post(route('users.store'))}
                />
            </div>
        </AuthenticatedLayout>
    );
}

