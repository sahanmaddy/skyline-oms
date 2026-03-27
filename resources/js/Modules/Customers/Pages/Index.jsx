import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

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

function isSystemCashCustomer(c) {
    return c?.customer_code === 'C-0';
}

function formatCreditLimit(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return value;
    }

    return `Rs. ${new Intl.NumberFormat('en-LK', {
        maximumFractionDigits: 2,
    }).format(parsed)}`;
}

export default function Index({ customers, filters, statusOptions }) {
    const formatStatusLabel = (value) => {
        if (value === 'active') return 'Active';
        if (value === 'inactive') return 'Inactive';
        return value;
    };

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Customers</span>}>
            <Head title="Customers" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="grid max-w-[820px] flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:items-end">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Search</label>
                            <input
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.q || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('customers.index'),
                                        { ...filters, q: e.target.value },
                                        { preserveState: true, replace: true },
                                    )
                                }
                                placeholder="Search by code, name, company, person, email, or phone…"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Status</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={filters?.status || ''}
                                onChange={(e) =>
                                    router.get(
                                        route('customers.index'),
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

                    <div className="flex shrink-0 items-center justify-end">
                        <Link href={route('customers.create')}>
                            <PrimaryButton type="button">New Customer</PrimaryButton>
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Location
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Commercial
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
                            {customers.data.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
                                            <span>{`${c.customer_code} - ${c.display_name || c.customer_name || '—'}`}</span>
                                            {isSystemCashCustomer(c) ? (
                                                <>
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                        System
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                        Walk-in
                                                    </span>
                                                </>
                                            ) : null}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {c.customer_name || '—'}
                                            {c.company_name &&
                                            c.company_name.trim().toLowerCase() !==
                                                (c.customer_name || '').trim().toLowerCase()
                                                ? ` (${c.company_name})`
                                                : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <div className="text-xs text-gray-500">
                                            {c.email ? `E-mail: ${c.email}` : 'E-mail: —'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {renderPhoneList(c.phone_numbers, 10)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">{c.city || '—'}</div>
                                        <div className="mt-1 text-xs text-gray-500">{c.country || '—'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                    (c.credit_eligible
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                {c.credit_eligible ? 'Credit Eligible' : 'No Credit'}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            Limit: {formatCreditLimit(c.credit_limit)}
                                        </div>
                                        {c.guarantor ? (
                                            <div className="mt-1 text-xs text-gray-500">
                                                Guarantor: {c.guarantor}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                (c.status === 'active'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 text-gray-700')
                                            }
                                        >
                                            {c.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                                        {isSystemCashCustomer(c) ? (
                                            <span className="text-xs">—</span>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('customers.show', c.id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    View
                                                </Link>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <Link
                                                    href={route('customers.edit', c.id)}
                                                    className="font-medium text-gray-700 hover:text-gray-900"
                                                >
                                                    Edit
                                                </Link>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {customers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            No customers found
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

                {customers.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {customers.links.map((l) => (
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
            </div>
        </AuthenticatedLayout>
    );
}

