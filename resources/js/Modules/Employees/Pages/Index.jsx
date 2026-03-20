import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

function formatJoinedDate(value) {
    if (!value) {
        return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-LK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}

function formatPrimaryPhone(phoneNumbers) {
    const first = (phoneNumbers || [])[0];
    if (!first) {
        return '—';
    }

    const phone = [first.country_code, first.phone_number]
        .filter(Boolean)
        .join(' ');

    if (!phone) {
        return '—';
    }

    const type = first.phone_type ? `${first.phone_type}: ` : '';
    return `${type}${phone}`;
}

function renderPhoneList(phoneNumbers, max = 3) {
    const phones = phoneNumbers || [];
    if (!phones.length) {
        return <span className="text-gray-500">—</span>;
    }

    const shown = phones.slice(0, max);
    const remaining = phones.length - shown.length;

    return (
        <>
            {shown.map((p) => (
                <div key={p.id} className="leading-5">
                    {p.phone_type ? `${p.phone_type}: ` : ''}
                    {[p.country_code, p.phone_number].filter(Boolean).join(' ')}
                </div>
            ))}
            {remaining > 0 ? (
                <div className="leading-5 text-gray-400">+{remaining} more</div>
            ) : null}
        </>
    );
}

export default function Index({ employees, filters, statusOptions }) {
    const formatStatusLabel = (value) => {
        if (value === 'active') return 'Active';
        if (value === 'inactive') return 'Inactive';
        return value;
    };

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Employees</span>}>
            <Head title="Employees" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-2 md:items-end max-w-[820px]">
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
                                placeholder="Search by code, name, email, or phone…"
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
                                        {formatStatusLabel(s)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end shrink-0">
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
                                    Employment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Access & Flags
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
                                        <div className="mt-1 text-xs text-gray-500">
                                            <span className="font-medium text-gray-700">{e.employee_code}</span>
                                            {e.designation ? ` • ${e.designation}` : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div>{e.email || '—'}</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {renderPhoneList(e.phone_numbers, 10)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">
                                            {e.department || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {e.employment_type || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Joined: {formatJoinedDate(e.joined_date)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                    (e.status === 'active'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                {e.status === 'active'
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>

                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ' +
                                                    (e.is_sales_commission_eligible
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                Commission
                                            </span>

                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ' +
                                                    (e.is_overtime_eligible
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                Overtime
                                            </span>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-500">
                                            {e.user ? (
                                                <>
                                                    <span className="font-medium text-gray-700">{e.user.name}</span>{' '}
                                                    <span className="text-gray-400">
                                                        ({e.user.email})
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Not linked</span>
                                            )}
                                        </div>
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
                                        colSpan={5}
                                        className="px-4 py-10 text-center"
                                    >
                                        <div className="text-sm font-medium text-gray-900">
                                            No employees found
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

