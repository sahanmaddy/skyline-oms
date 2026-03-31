import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HrModuleLayout from '@/Layouts/HrModuleLayout';
import useConfirm from '@/feedback/useConfirm';
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

export default function Index({ employees, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();
    const formatStatusLabel = (value) => {
        if (value === 'active') return 'Active';
        if (value === 'inactive') return 'Inactive';
        return value;
    };

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Human Resource" section="Employees" />}>
            <Head title="Employees · Human Resource" />

            <HrModuleLayout breadcrumbs={[{ label: 'Employees' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label htmlFor="emp-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="emp-search"
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('hr.employees.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search by code, name, email, or phone…"
                                />
                            </div>
                            <div>
                                <label htmlFor="emp-status" className="text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <select
                                    id="emp-status"
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.status || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('hr.employees.index'),
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
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('hr.employees.create')}>
                                <PrimaryButton type="button">New employee</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[22%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Employee
                                </th>
                                <th className="w-[26%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
                                </th>
                                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Employment
                                </th>
                                <th className="w-[26%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Access & Flags
                                </th>
                                <th className="w-[8%] whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
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
                                        <div className="text-xs text-gray-500">
                                            {e.email ? `E-mail: ${e.email}` : 'E-mail: —'}
                                        </div>
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
                                                <Link
                                                    href={route('settings.users.show', e.user.id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    {e.user.name}{' '}
                                                    <span className="font-normal text-gray-500">
                                                        ({e.user.email})
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">Not linked</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {e.can_view || e.can_edit || e.can_delete ? (
                                            <div className="relative z-50 flex items-center justify-end">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                            aria-label="More actions"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        {e.can_view ? (
                                                            <Link
                                                                href={route('hr.employees.show', e.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {e.can_edit ? (
                                                            <Link
                                                                href={route('hr.employees.edit', e.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {e.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete employee',
                                                                        message:
                                                                            'Are you sure you want to delete this employee? This action cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('hr.employees.destroy', e.id));
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        ) : null}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
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
                                    (l.url ? '' : ' pointer-events-none opacity-50')
                                }
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </div>
                )}
            </HrModuleLayout>
        </AuthenticatedLayout>
    );
}

