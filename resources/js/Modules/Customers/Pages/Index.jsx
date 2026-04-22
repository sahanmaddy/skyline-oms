import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { formatCompanyCurrency } from '@/lib/companyFormat';
import { Head, Link, router, usePage } from '@inertiajs/react';

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
                    <span className="font-semibold">
                        {[p.country_code, p.phone_number].filter(Boolean).join(' ')}
                    </span>
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

function formatCreditLimit(value, company) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return value;
    }

    return formatCompanyCurrency(parsed, company);
}

export default function Index({ customers, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();
    const company = usePage().props.company ?? {};
    const formatStatusLabel = (value) => {
        if (value === 'active') return 'Active';
        if (value === 'inactive') return 'Inactive';
        return value;
    };

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Sales" section="Customers" />}>
            <Head title="Customers · Sales" />

            <SalesModuleLayout breadcrumbs={[{ label: 'Customers' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="cust-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="cust-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('sales.customers.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search by code, name, company, email, or phone…"
                                />
                            </div>
                            <div>
                                <label htmlFor="cust-status" className="text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <FormSelect
                                    id="cust-status"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('sales.customers.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All' },
                                        ...(statusOptions?.map((s) => ({
                                            value: s,
                                            label: formatStatusLabel(s),
                                        })) ?? []),
                                    ]}
                                    placeholder="All"
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('sales.customers.create')}>
                                <PrimaryButton type="button">New customer</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[24%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>
                                <th className="w-[22%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
                                </th>
                                <th className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Location
                                </th>
                                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Commercial
                                </th>
                                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Status
                                </th>
                                <th className="w-[10%] whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.data.map((c) => (
                                <tr
                                    key={c.id}
                                    className={
                                        isSystemCashCustomer(c)
                                            ? 'bg-slate-50 hover:bg-slate-100/90 dark:bg-cursor-raised/50 dark:hover:bg-cursor-raised'
                                            : 'hover:bg-gray-50 dark:hover:bg-cursor-raised/40'
                                    }
                                >
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {c.display_name || c.customer_name || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {c.customer_code || '—'}
                                            {(() => {
                                                const name = (c.customer_name || '').trim();
                                                const comp =
                                                    c.company_name &&
                                                    c.company_name.trim().toLowerCase() !== name.toLowerCase()
                                                        ? ` (${c.company_name})`
                                                        : '';
                                                const sub = `${name}${comp}`.trim();
                                                return sub ? ` • ${sub}` : '';
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {isSystemCashCustomer(c) ? (
                                            <span className="text-xs text-gray-500">—</span>
                                        ) : (
                                            <>
                                                <div className="text-xs text-gray-500">
                                                    {c.email ? (
                                                        <>
                                                            E-mail:{' '}
                                                            <span className="font-semibold">{c.email}</span>
                                                        </>
                                                    ) : (
                                                        'E-mail: —'
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {renderPhoneList(c.phone_numbers, 10)}
                                                </div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isSystemCashCustomer(c) ? (
                                            <span className="text-xs text-gray-500">—</span>
                                        ) : (
                                            <>
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-semibold">{c.city || '—'}</span>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {c.country || '—'}
                                                </div>
                                            </>
                                        )}
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
                                        {!isSystemCashCustomer(c) ? (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Limit:{' '}
                                                <span className="font-semibold text-[#FA923C]">
                                                    {formatCreditLimit(c.credit_limit, company)}
                                                </span>
                                            </div>
                                        ) : null}
                                        {c.guarantor ? (
                                            <div className="mt-1 text-xs text-gray-500">
                                                Guarantor:{' '}
                                                <span className="font-semibold">{c.guarantor}</span>
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
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                                        {isSystemCashCustomer(c) ? (
                                            <span className="text-xs">—</span>
                                        ) : c.can_view || c.can_edit || c.can_delete ? (
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
                                                        {c.can_view ? (
                                                            <Link
                                                                href={route('sales.customers.show', c.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {c.can_edit ? (
                                                            <Link
                                                                href={route('sales.customers.edit', c.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {c.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete customer',
                                                                        message:
                                                                            'Are you sure you want to delete this customer? This action cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('sales.customers.destroy', c.id));
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
            </SalesModuleLayout>
        </AuthenticatedLayout>
    );
}

