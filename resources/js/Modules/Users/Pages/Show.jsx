import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ user }) {
    const role = user.roles?.[0]?.name || '—';
    const emp = user.employee;
    const linkedLine =
        emp
            ? [emp.employee_code, emp.display_name].filter(Boolean).join(' - ')
            : null;

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="User" />}>
            <Head title={`${user.name} · Users · Settings`} />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Users', href: route('settings.users.index') },
                    { label: user.name },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.users.index')}
                        backLabel="← Back to users"
                        actions={
                            <Link href={route('settings.users.edit', user.id)}>
                                <PrimaryButton type="button">Edit</PrimaryButton>
                            </Link>
                        }
                    />

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Role
                                </div>
                                <div className="mt-2 flex min-h-6 items-center">
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                        {role}
                                    </span>
                                </div>
                            </div>
                            <Info
                                label="Status"
                                value={user.status === 'active' ? 'Active' : 'Inactive'}
                                badge={
                                    user.status === 'active'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                }
                            />
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Linked employee
                                </div>
                                <div className="mt-2 flex min-h-6 items-center text-sm font-medium text-gray-900">
                                    {linkedLine ? (
                                        <Link
                                            href={route('hr.employees.show', emp.id)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            {linkedLine}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">Not linked</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}

function Info({ label, value, badge }) {
    if (badge) {
        return (
            <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {label}
                </div>
                <div className="mt-2 flex min-h-6 items-center">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
                    >
                        {value}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}
