import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

function formatLinkedEmployee(employee) {
    if (!employee) {
        return null;
    }
    const code = employee.employee_code || '';
    const name = employee.display_name || '';
    if (!code && !name) {
        return null;
    }
    return [code, name].filter(Boolean).join(' - ');
}

export default function Index({ users, filters, statusOptions }) {
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Users" />}>
            <Head title="Users · Settings" />

            <SettingsModuleLayout breadcrumbs={[{ label: 'Users' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Search</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('settings.users.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search by name or email…"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Status</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.status || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('settings.users.index'),
                                            { ...filters, status: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                >
                                    <option value="">All</option>
                                    {statusOptions?.map((s) => (
                                        <option key={s} value={s}>
                                            {s === 'active' ? 'Active' : 'Inactive'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    }
                    actions={
                        <Link href={route('settings.users.create')}>
                            <PrimaryButton type="button">New user</PrimaryButton>
                        </Link>
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Linked employee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.data.map((u) => {
                                const linkedLabel = formatLinkedEmployee(u.employee);
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {u.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                                                {u.roles?.[0]?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {linkedLabel ? (
                                                <Link
                                                    href={route('hr.employees.show', u.employee.id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {linkedLabel}
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not linked</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                    (u.status === 'active'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                {u.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <Link
                                                href={route('settings.users.show', u.id)}
                                                className="font-medium text-indigo-600 hover:text-indigo-700"
                                            >
                                                View
                                            </Link>
                                            <span className="mx-2 text-gray-300">|</span>
                                            <Link
                                                href={route('settings.users.edit', u.id)}
                                                className="font-medium text-gray-700 hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}

                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            No users found
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Try adjusting your search or status filter.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {users.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {users.links.map((l) => (
                            <Link
                                key={l.label}
                                href={l.url || '#'}
                                preserveScroll
                                className={
                                    'rounded-md border px-3 py-1 text-sm ' +
                                    (l.active
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50') +
                                    (l.url ? '' : ' opacity-50 pointer-events-none')
                                }
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </div>
                )}
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
