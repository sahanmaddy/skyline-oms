import Dropdown from '@/Components/Dropdown';
import FormDateRangeFilter from '@/Components/FormDateRangeFilter';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCompanyCurrency, formatCompanyDateTime } from '@/lib/companyFormat';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { formatCalculationStatusLabel } from '@/Modules/Procurement/DutyCostCalculator/lib/formatCalculationStatusLabel';
import { formatMeasuredNumberForDisplay } from '@/Modules/Procurement/DutyCostCalculator/lib/formatDutyNumbers';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ calculations, filters, statusOptions, canCreate }) {
    const company = usePage().props.company ?? {};
    const { confirm } = useConfirm();
    const calculationRows = calculations?.data ?? [];
    const statusChoices = Array.isArray(statusOptions) ? statusOptions : [];

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title="Duty & Cost Calculator · Procurement" />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Duty & Cost Calculator' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-3 md:items-end"
                    filters={
                        <>
                            <div className="min-w-0">
                                <label htmlFor="dcc-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="dcc-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search code, title, supplier..."
                                />
                            </div>
                            <div className="min-w-0">
                                <label htmlFor="dcc-status" className="text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <FormSelect
                                    id="dcc-status"
                                    className="mt-1 w-full"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All' },
                                        ...statusChoices.map((s) => ({
                                            value: s,
                                            label: formatCalculationStatusLabel(s),
                                        })),
                                    ]}
                                    placeholder="All"
                                />
                            </div>
                            <div className="min-w-0">
                                <FormDateRangeFilter
                                    id="dcc-updated-range"
                                    label="Updated"
                                    timeZone={company?.time_zone}
                                    disableFutureDates
                                    dateFrom={filters?.date_from || ''}
                                    dateTo={filters?.date_to || ''}
                                    onApply={({ dateFrom, dateTo }) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, date_from: dateFrom, date_to: dateTo },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('procurement.duty-cost-calculations.create')}>
                                <PrimaryButton type="button">New Calculation</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="align-middle w-[19%] px-3 py-3 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Calculation
                                </th>
                                <th className="align-middle w-[5%] whitespace-normal px-2 py-3 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Items
                                </th>
                                <th className="align-middle w-[9%] whitespace-normal px-2 py-3 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Weight (KG)
                                </th>
                                <th className="align-middle w-[5%] whitespace-normal px-2 py-3 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    CBM
                                </th>
                                <th className="align-middle w-[18%] whitespace-normal py-3 pl-2 pr-0 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Costs
                                </th>
                                <th className="align-middle w-[18%] whitespace-normal py-3 pl-0 pr-2 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Totals
                                </th>
                                <th className="align-middle w-[9%] whitespace-normal px-2 py-3 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Status
                                </th>
                                <th className="align-middle w-[10%] whitespace-normal py-3 pl-1 pr-0 text-left text-[10px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-xs">
                                    Date
                                </th>
                                <th className="w-16 whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {calculationRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="align-middle min-w-0 px-3 py-3">
                                        <div className="break-words text-sm font-semibold text-gray-900">
                                            {row.title || '—'}
                                        </div>
                                        <div className="mt-1 break-words text-xs text-gray-500">
                                            {row.calculation_code}
                                            {row.supplier_name ? ` • ${row.supplier_name}` : ''}
                                        </div>
                                    </td>
                                    <td className="align-middle px-2 py-3 text-xs text-gray-500 tabular-nums">
                                        {row.item_count}
                                    </td>
                                    <td className="align-middle px-2 py-3 text-xs text-gray-500 tabular-nums">
                                        {formatMeasuredNumberForDisplay(row.total_weight_kg, 3) ?? '—'}
                                    </td>
                                    <td className="align-middle px-2 py-3 text-xs text-gray-500 tabular-nums">
                                        {formatMeasuredNumberForDisplay(row.total_cbm, 3) ?? '—'}
                                    </td>
                                    <td className="align-middle py-3 pl-2 pr-0 text-sm text-gray-700">
                                        <div className="text-xs text-gray-500 tabular-nums">
                                            Allocated Costs:{' '}
                                            {formatCompanyCurrency(row.total_allocated_other_costs_lkr, company) || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 tabular-nums">
                                            Bank Interest: {formatCompanyCurrency(row.bank_interest_lkr, company) || '—'}
                                        </div>
                                    </td>
                                    <td className="align-middle py-3 pl-0 pr-2 text-sm text-gray-700">
                                        <div className="text-xs text-gray-500 tabular-nums">
                                            Total Duty: {formatCompanyCurrency(row.total_duty_lkr, company) || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 tabular-nums">
                                            Remittance: {formatCompanyCurrency(row.remittance_lkr, company) || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 tabular-nums">
                                            Grand Total: {formatCompanyCurrency(row.grand_total_landed_cost_lkr, company) || '—'}
                                        </div>
                                    </td>
                                    <td className="align-middle px-2 py-3">
                                        <span
                                            className={
                                                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                (row.calculation_status === 'finalized'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-amber-50 text-amber-700')
                                            }
                                        >
                                            {formatCalculationStatusLabel(row.calculation_status)}
                                        </span>
                                    </td>
                                    <td className="align-middle whitespace-normal break-words py-3 pl-1 pr-0 text-xs text-gray-500 leading-snug">
                                        {row.updated_at
                                            ? formatCompanyDateTime(row.updated_at, company, {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {row.can_view || row.can_edit || row.can_delete || canCreate ? (
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
                                                        {row.can_view ? (
                                                            <Link
                                                                href={route('procurement.duty-cost-calculations.show', row.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {row.can_edit ? (
                                                            <Link
                                                                href={route('procurement.duty-cost-calculations.edit', row.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {canCreate ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                                onClick={() =>
                                                                    router.post(
                                                                        route('procurement.duty-cost-calculations.duplicate', row.id),
                                                                    )
                                                                }
                                                            >
                                                                Duplicate
                                                            </button>
                                                        ) : null}
                                                        {row.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete calculation',
                                                                        message:
                                                                            'This will permanently remove this saved estimate.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(
                                                                        route('procurement.duty-cost-calculations.destroy', row.id),
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
                            ))}

                            {calculationRows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="align-middle px-4 py-10 text-center">
                                        <div className="text-sm font-medium text-gray-900">No calculations found</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Try adjusting your search, status, or date filters.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {calculations?.links && calculations.links.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {calculations.links.map((l) => (
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
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}

