import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ user }) {
    const role = user.roles?.[0]?.name || '—';

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">User</span>}>
            <Head title={`User - ${user.name}`} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('users.index')}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        ← Back to users
                    </Link>

                    <Link href={route('users.edit', user.id)}>
                        <PrimaryButton type="button">Edit</PrimaryButton>
                    </Link>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Role" value={role} />
                        <Info
                            label="Status"
                            value={user.status === 'active' ? 'Active' : 'Inactive'}
                        />
                        <Info
                            label="Linked employee"
                            value={user.employee ? user.employee.display_name : '—'}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}

