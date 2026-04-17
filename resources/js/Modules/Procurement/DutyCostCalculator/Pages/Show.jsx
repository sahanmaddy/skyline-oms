import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import {
    currencyAddonLabelForIso,
    formatLocalMoneyDisplay,
    formatMoneyInputWithCommas,
} from '@/lib/companyFormat';
import { Head, Link, router, usePage } from '@inertiajs/react';

function fmtDate(value) {
    return value ? new Date(value).toLocaleString() : '—';
}

export default function Show({ calculation, canEdit, canDelete, canDuplicate }) {
    const company = usePage().props.company ?? {};
    const { confirm } = useConfirm();
    const totals = calculation.totals || {};
    const localCurrencyCode = calculation.local_currency || 'LKR';
    const freightCcy =
        calculation.freight_currency || calculation.purchasing_currency || 'USD';
    const freightCostForeign = calculation.freight_cost_total;
    const freightPerCbm = totals.freight_cost_per_cbm_lkr ?? calculation.freight_cost_per_cbm_lkr;
    const totalAllocatedFreight =
        totals.total_allocated_freight_lkr ?? calculation.total_allocated_freight_lkr;

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title={`${calculation.calculation_code} · Duty & Cost Calculator`} />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Duty & Cost Calculator', href: route('procurement.duty-cost-calculations.index') },
                    { label: calculation.calculation_code },
                ]}
            >
                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {calculation.calculation_code} - {calculation.title}
                            </h2>
                            <div className="mt-1 text-sm text-gray-600">
                                Supplier: {calculation.supplier_name || '—'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Last updated: {fmtDate(calculation.updated_at)} by {calculation.updater?.name || '—'}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('procurement.duty-cost-calculations.index')}>
                                <SecondaryButton type="button">Back</SecondaryButton>
                            </Link>
                            {canDuplicate && (
                                <PrimaryButton
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            route('procurement.duty-cost-calculations.duplicate', calculation.id),
                                        )
                                    }
                                >
                                    Duplicate
                                </PrimaryButton>
                            )}
                            {canEdit && (
                                <Link href={route('procurement.duty-cost-calculations.edit', calculation.id)}>
                                    <PrimaryButton type="button">Edit</PrimaryButton>
                                </Link>
                            )}
                            {canDelete && (
                                <SecondaryButton
                                    type="button"
                                    onClick={async () => {
                                        const ok = await confirm({
                                            title: 'Delete calculation',
                                            message: 'This action cannot be undone.',
                                            confirmText: 'Delete',
                                            variant: 'destructive',
                                        });
                                        if (!ok) return;
                                        router.delete(route('procurement.duty-cost-calculations.destroy', calculation.id));
                                    }}
                                >
                                    Delete
                                </SecondaryButton>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[
                            [
                                'Exchange Rate',
                                <div className="flex items-stretch overflow-hidden rounded-md border border-gray-200 bg-white">
                                    <div className="inline-flex items-center border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted">
                                        {currencyAddonLabelForIso(localCurrencyCode, company)}
                                    </div>
                                    <div className="flex flex-1 items-center px-3 py-2 text-sm font-semibold text-gray-900 dark:text-cursor-fg">
                                        {formatMoneyInputWithCommas(
                                            String(Number(calculation.exchange_rate) || 0),
                                            3,
                                            { locale: 'en-US', minimumFractionDigits: 3 },
                                        )}
                                    </div>
                                </div>,
                            ],
                            ['Purchasing Currency', calculation.purchasing_currency || '—'],
                            ['Local Currency', calculation.local_currency || '—'],
                            ['Freight Currency', calculation.freight_currency || '—'],
                            [
                                'Freight Cost',
                                formatLocalMoneyDisplay(freightCostForeign, freightCcy, company),
                            ],
                            [
                                'Freight Exchange Rate',
                                calculation.freight_exchange_rate != null &&
                                String(calculation.freight_exchange_rate) !== '' ? (
                                    <div className="flex items-stretch overflow-hidden rounded-md border border-gray-200 bg-white">
                                        <div className="inline-flex items-center border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted">
                                            {currencyAddonLabelForIso(localCurrencyCode, company)}
                                        </div>
                                        <div className="flex flex-1 items-center px-3 py-2 text-sm font-semibold text-gray-900 dark:text-cursor-fg">
                                            {formatMoneyInputWithCommas(
                                                String(Number(calculation.freight_exchange_rate) || 0),
                                                3,
                                                { locale: 'en-US', minimumFractionDigits: 3 },
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    '—'
                                ),
                            ],
                            [
                                'Total CBM',
                                calculation.total_shipment_cbm ?? calculation.container_cbm_capacity || '—',
                            ],
                            [
                                'Other Costs Total',
                                formatLocalMoneyDisplay(
                                    calculation.other_costs_lkr_total,
                                    localCurrencyCode,
                                    company,
                                ),
                            ],
                            ['Status', calculation.calculation_status],
                            ['Total Weight', totals.total_weight_kg ?? calculation.total_weight_kg],
                            ['Sum of line CBM', totals.total_cbm ?? calculation.total_cbm],
                            [
                                'Freight per CBM',
                                formatLocalMoneyDisplay(freightPerCbm, localCurrencyCode, company),
                            ],
                        ].map(([k, v]) => (
                            <div key={k} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                <div className="text-xs text-gray-500">{k}</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900">{v}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1680px] divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        'Line',
                                        'Product',
                                        'UOM',
                                        'Qty',
                                        'Total FCY',
                                        'Product',
                                        'Weight',
                                        'CBM',
                                        'Statistical',
                                        'CID',
                                        'VAT',
                                        'SSCL',
                                        'Duty',
                                        'Alloc. Freight',
                                        'Alloc. Other',
                                        'Total Landed',
                                        'Landed/Unit',
                                    ].map((h) => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(calculation.items || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-3 py-2">{row.line_no}</td>
                                        <td className="px-3 py-2">{row.product_name}</td>
                                        <td className="px-3 py-2">{row.unit_of_measure}</td>
                                        <td className="px-3 py-2 text-right">{row.quantity}</td>
                                        <td className="px-3 py-2 text-right">{row.total_product_value_foreign}</td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.product_value_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">{row.weight_kg}</td>
                                        <td className="px-3 py-2 text-right">{row.cbm}</td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.statistical_value_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.cid_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.vat_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.sscl_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(row.duty_total_lkr, localCurrencyCode, company)}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(
                                                row.allocated_freight_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            {formatLocalMoneyDisplay(
                                                row.allocated_other_costs_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold">
                                            {formatLocalMoneyDisplay(
                                                row.total_landed_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold">
                                            {formatLocalMoneyDisplay(
                                                row.landed_cost_per_unit_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Summary Totals</h3>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            ['Total Product Value', totals.total_product_value_lkr],
                            ['Total Statistical Value', totals.total_statistical_value_lkr],
                            ['Total CID', totals.total_cid_lkr],
                            ['Total VAT', totals.total_vat_lkr],
                            ['Total SSCL', totals.total_sscl_lkr],
                            ['Total Duty', totals.total_duty_lkr],
                            ['Total Allocated Freight', totalAllocatedFreight],
                            ['Total Allocated Other Costs', totals.total_allocated_other_costs_lkr],
                            ['Grand Total Landed Cost', totals.grand_total_landed_cost_lkr],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                                <div className="text-xs text-gray-500">{label}</div>
                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                    {formatLocalMoneyDisplay(value || 0, localCurrencyCode, company)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-md border border-dashed border-gray-300 p-3 text-xs text-gray-500">
                        Print/Export placeholder: export-ready layout will be added in a follow-up.
                    </div>
                </section>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}

