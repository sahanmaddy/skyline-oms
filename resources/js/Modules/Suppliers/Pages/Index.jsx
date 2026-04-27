import Dropdown from '@/Components/Dropdown';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { Head, Link, router } from '@inertiajs/react';

function formatStatusLabel(value) {
    if (value === 'active') return 'Active';
    if (value === 'inactive') return 'Inactive';
    return value;
}

function renderSupplierContact(s) {
    const primary = [s.primary_phone_country_code, s.primary_phone_number].filter(Boolean).join(' ');
    const whatsappNumber = s.whatsapp_number?.trim() ?? '';
    const whatsappLine = whatsappNumber
        ? [s.whatsapp_country_code, whatsappNumber].filter(Boolean).join(' ')
        : '';

    return (
        <div className="text-xs text-gray-500">
            <div>
                {s.email ? (
                    <>
                        E-mail: <span className="font-semibold">{s.email}</span>
                    </>
                ) : (
                    'E-mail: —'
                )}
            </div>
            <div className="mt-1">
                {primary ? (
                    <>
                        Primary: <span className="font-semibold">{primary}</span>
                    </>
                ) : (
                    'Primary: —'
                )}
            </div>
            {whatsappLine ? (
                <div className="mt-1">
                    WhatsApp: <span className="font-semibold">{whatsappLine}</span>
                </div>
            ) : null}
        </div>
    );
}

export default function Index({ suppliers, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Suppliers" />}>
            <Head title="Suppliers · Procurement" />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Suppliers' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="supplier-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="supplier-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('procurement.suppliers.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search by code, name, company, contact, or phone…"
                                />
                            </div>
                            <div>
                                <label htmlFor="supplier-status" className="text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <FormSelect
                                    id="supplier-status"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('procurement.suppliers.index'),
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
                            <Link href={route('procurement.suppliers.create')}>
                                <PrimaryButton type="button">New supplier</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Supplier
                                </th>
                                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Location
                                </th>
                                <th className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact person
                                </th>
                                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
                                </th>
                                <th className="w-[16%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Tax
                                </th>
                                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Status & Flags
                                </th>
                                <th className="w-[8%] whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(suppliers?.data || []).map((s) => {
                                const locationLine1 = [s.city, s.state_province].filter(Boolean).join(', ');
                                const locationLine2 = s.country || '';

                                return (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {s.display_name || '—'}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {s.supplier_code || '—'}
                                                {s.company_name ? ` • ${s.company_name}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {locationLine1 || locationLine2 ? (
                                                <>
                                                    <div className="text-xs text-gray-500">
                                                        {locationLine1 ? (
                                                            <span className="font-semibold">{locationLine1}</span>
                                                        ) : (
                                                            <span className="font-semibold">{locationLine2}</span>
                                                        )}
                                                    </div>
                                                    {locationLine1 && locationLine2 ? (
                                                        <div className="mt-1 text-xs text-gray-500">{locationLine2}</div>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {s.contact_person?.trim() ? (
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-semibold">{s.contact_person.trim()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{renderSupplierContact(s)}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-gray-500">
                                                TIN:{' '}
                                                <span className="font-semibold">{s.tax_number?.trim() || '—'}</span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                VAT:{' '}
                                                <span className="font-semibold">{s.vat_number?.trim() || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={
                                                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                        (s.is_active
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-gray-100 text-gray-700')
                                                    }
                                                >
                                                    {s.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                {s.vat_number ? (
                                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
                                                        VAT
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                            {s.can_view || s.can_edit || s.can_delete ? (
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
                                                            {s.can_view ? (
                                                                <Link
                                                                    href={route('procurement.suppliers.show', s.id)}
                                                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                                >
                                                                    View
                                                                </Link>
                                                            ) : null}
                                                            {s.can_edit ? (
                                                                <Link
                                                                    href={route('procurement.suppliers.edit', s.id)}
                                                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            ) : null}
                                                            {s.can_delete ? (
                                                                <button
                                                                    type="button"
                                                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                    onClick={async () => {
                                                                        const ok = await confirm({
                                                                            title: 'Delete supplier',
                                                                            message:
                                                                                'Are you sure you want to delete this supplier? This action cannot be undone.',
                                                                            confirmText: 'Delete',
                                                                            variant: 'destructive',
                                                                        });
                                                                        if (!ok) return;
                                                                        router.delete(
                                                                            route('procurement.suppliers.destroy', s.id),
                                                                        );
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
                                );
                            })}

                            {(suppliers?.data || []).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center">
                                        <div className="text-sm font-medium text-gray-900">No suppliers found</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Try adjusting your search or status filter.
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {suppliers?.links?.length > 3 ? (
                    <div className="flex flex-wrap gap-2">
                        {suppliers.links.map((l) => (
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
                ) : null}
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
