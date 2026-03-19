import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ employees, filters, statusOptions }) {
    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Employees</span>}>
            <Head title="Employees" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Search</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.q || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('employees.index'),
                                        { ...filters, q: e.target.value },
                                        { preserveState: true, replace: true },
                                    )
                                }
                                placeholder="code, name, email, phone..."
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Status</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.status || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('employees.index'),
                                        { ...filters, status: e.target.value },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            >
                                <option value="">All</option>
                                {statusOptions?.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href={route('employees.create')}>
                            <PrimaryButton type="button">New Employee</PrimaryButton>
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Employee
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
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
                            {employees.data.map((e) => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {e.display_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {e.employee_code}
                                            {e.is_sales_commission_eligible
                                                ? ' • Commission eligible'
                                                : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div>{e.email || '—'}</div>
                                        <div className="text-xs text-gray-500">
                                            {e.phone_numbers?.length
                                                ? e.phone_numbers
                                                      .map(
                                                          (p) =>
                                                              `${p.country_code} ${p.phone_number}`,
                                                      )
                                                      .join(', ')
                                                : '—'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                (e.status === 'active'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 text-gray-700')
                                            }
                                        >
                                            {e.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <Link
                                            href={route('employees.show', e.id)}
                                            className="font-medium text-indigo-600 hover:text-indigo-700"
                                        >
                                            View
                                        </Link>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <Link
                                            href={route('employees.edit', e.id)}
                                            className="font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {employees.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {employees.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {employees.links.map((l) => (
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

