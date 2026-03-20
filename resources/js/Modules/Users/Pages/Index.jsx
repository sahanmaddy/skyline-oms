import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ users, filters, statusOptions }) {
    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Users</span>}>
            <Head title="Users" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[820px]">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Search</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.q || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('users.index'),
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.status || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('users.index'),
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
                    </div>

                    <div className="flex items-center justify-end shrink-0">
                        <Link href={route('users.create')}>
                            <PrimaryButton type="button">New User</PrimaryButton>
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    User
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
                            {users.data.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {u.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                                            {u.roles?.[0]?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {u.employee ? u.employee.display_name : '—'}
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
                                            href={route('users.show', u.id)}
                                            className="font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                            View
                                        </Link>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <Link
                                            href={route('users.edit', u.id)}
                                            className="font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        No users found.
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
            </div>
        </AuthenticatedLayout>
    );
}

