import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import { formatLocalMoneyDisplay, formatMoneyInputWithCommas } from '@/lib/companyFormat';
import { formatCalculationStatusLabel } from '@/Modules/Procurement/DutyCostCalculator/lib/formatCalculationStatusLabel';
import {
    formatAnnualPercentRateDisplay,
    formatMeasuredNumberForDisplay,
} from '@/Modules/Procurement/DutyCostCalculator/lib/formatDutyNumbers';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

const exchangeRateFormatOptions = { locale: 'en-US', minimumFractionDigits: 3 };

function fmtDate(value) {
    return value ? new Date(value).toLocaleString() : '—';
}

function Info({ label, value, className = '' }) {
    return (
        <div className={`rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-surface ${className}`}>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-cursor-fg">{value}</div>
        </div>
    );
}

export default function Show({ calculation, canEdit, canDelete, canDuplicate }) {
    const company = usePage().props.company ?? {};
    const { confirm } = useConfirm();
    const totals = calculation.totals || {};
    const localCurrencyCode = calculation.local_currency || 'LKR';
    const purchasingCurrencyCode = calculation.purchasing_currency || 'USD';
    const freightCcy = calculation.freight_currency || purchasingCurrencyCode || 'USD';
    const freightCurrencyCode = String(calculation.freight_currency || '').trim();
    const freightCostForeign = calculation.freight_cost_total;
    const freightPerCbm = totals.freight_cost_per_cbm_lkr ?? calculation.freight_cost_per_cbm_lkr;

    const dutyBasePercentDisplay = Number(calculation.duty_base_percent) || 110;

    const t = useCallback((key) => totals[key] ?? calculation[key], [totals, calculation]);

    const otherCosts = calculation.other_costs || [];
    const items = calculation.items || [];
    const totalProductValueFcy = useMemo(
        () => items.reduce((sum, row) => sum + (Number(row.total_product_value_foreign) || 0), 0),
        [items],
    );

    const shipmentSummaryRows = useMemo(() => {
        const nProducts = String(t('item_count') ?? items.length ?? 0);
        const purchaseLkr = Number(t('total_product_value_lkr')) || 0;
        const freightLkr =
            Math.round(
                (Number(calculation.freight_cost_total || 0) * Number(calculation.freight_exchange_rate || 0)) *
                    100,
            ) / 100;
        const bankTransfer = Number(t('bank_transfer_charges_lkr')) || 0;
        const remittanceFromTotals = t('remittance_lkr');
        const remittanceLkr =
            remittanceFromTotals !== null &&
            remittanceFromTotals !== undefined &&
            remittanceFromTotals !== '' &&
            Number.isFinite(Number(remittanceFromTotals))
                ? Number(remittanceFromTotals)
                : Math.round((purchaseLkr + freightLkr + bankTransfer) * 100) / 100;

        return [
            ['No. of Products', t('item_count')],
            [
                'Total Product Value (Foreign)',
                formatLocalMoneyDisplay(totalProductValueFcy, purchasingCurrencyCode, company),
            ],
            [
                'Total Product Value',
                formatLocalMoneyDisplay(t('total_product_value_lkr'), localCurrencyCode, company),
            ],
            [
                'Total Statistical Value',
                formatLocalMoneyDisplay(t('total_statistical_value_lkr'), localCurrencyCode, company),
            ],
            [
                `Customs Base Value (${dutyBasePercentDisplay}%)`,
                formatLocalMoneyDisplay(t('total_customs_base_lkr'), localCurrencyCode, company),
            ],
            ['Total CID', formatLocalMoneyDisplay(t('total_cid_lkr'), localCurrencyCode, company)],
            ['Total VAT', formatLocalMoneyDisplay(t('total_vat_lkr'), localCurrencyCode, company)],
            ['Total SSCL', formatLocalMoneyDisplay(t('total_sscl_lkr'), localCurrencyCode, company)],
            [
                'Total Allocated Freight',
                formatLocalMoneyDisplay(t('total_allocated_freight_lkr'), localCurrencyCode, company),
            ],
            [
                'Bank Transfer (1%)',
                formatLocalMoneyDisplay(t('bank_transfer_charges_lkr'), localCurrencyCode, company),
            ],
            ['Bank Interest', formatLocalMoneyDisplay(t('bank_interest_lkr'), localCurrencyCode, company)],
            [
                'Total Bank Charges (Allocated)',
                formatLocalMoneyDisplay(t('total_bank_charges_lkr'), localCurrencyCode, company),
            ],
            [
                'Weight (KG)',
                (() => {
                    const raw = t('total_weight_kg');
                    if (raw === null || raw === undefined || raw === '') {
                        return '—';
                    }
                    return formatMeasuredNumberForDisplay(raw, 3) ?? '—';
                })(),
            ],
            [
                `Total CBM (${nProducts} Products)`,
                (() => {
                    const raw = t('total_cbm');
                    if (raw === null || raw === undefined || raw === '') {
                        return '—';
                    }
                    return formatMeasuredNumberForDisplay(raw, 3) ?? '—';
                })(),
            ],
            ['Freight Per CBM', formatLocalMoneyDisplay(freightPerCbm, localCurrencyCode, company)],
            [
                'Total Allocated Other Costs',
                formatLocalMoneyDisplay(t('total_allocated_other_costs_lkr'), localCurrencyCode, company),
            ],
            ['Total Duty', formatLocalMoneyDisplay(t('total_duty_lkr'), localCurrencyCode, company)],
            ['Remittance', formatLocalMoneyDisplay(remittanceLkr, localCurrencyCode, company)],
            [
                'Grand Total',
                formatLocalMoneyDisplay(t('grand_total_landed_cost_lkr'), localCurrencyCode, company),
            ],
        ];
    }, [
        t,
        localCurrencyCode,
        company,
        dutyBasePercentDisplay,
        freightPerCbm,
        totalProductValueFcy,
        purchasingCurrencyCode,
        items,
        calculation.freight_cost_total,
        calculation.freight_exchange_rate,
    ]);

    const statusBadgeClass =
        calculation.calculation_status === 'finalized'
            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';

    const dutyRatesSection = (
        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Duty Rates</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                Customs duty assumptions for this calculation.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Info
                    label="CID / Kg"
                    value={formatLocalMoneyDisplay(
                        calculation.cid_rate_per_kg_lkr ?? 0,
                        localCurrencyCode,
                        company,
                    )}
                />
                <Info label="Customs Base Value (%)" value={calculation.duty_base_percent ?? '—'} />
                <Info label="VAT Rate (%)" value={calculation.vat_rate_percent ?? '—'} />
                <Info label="SSCL Rate (%)" value={calculation.sscl_rate_percent ?? '—'} />
            </div>
        </section>
    );

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title={`${calculation.calculation_code} · Duty & Cost Calculator`} />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Duty & Cost Calculator', href: route('procurement.duty-cost-calculations.index') },
                    { label: calculation.calculation_code },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <div className="print:hidden">
                        <ModuleDetailToolbar
                            backHref={route('procurement.duty-cost-calculations.index')}
                            backLabel="← Back to duty & cost calculator"
                            actions={
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <SecondaryButton type="button" onClick={() => window.print()}>
                                        Print
                                    </SecondaryButton>
                                    {canDuplicate ? (
                                        <PrimaryButton
                                            type="button"
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        'procurement.duty-cost-calculations.duplicate',
                                                        calculation.id,
                                                    ),
                                                )
                                            }
                                        >
                                            Duplicate
                                        </PrimaryButton>
                                    ) : null}
                                    {canEdit ? (
                                        <Link href={route('procurement.duty-cost-calculations.edit', calculation.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete calculation',
                                                    message:
                                                        'Are you sure you want to delete this calculation? This action cannot be undone.',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(
                                                    route(
                                                        'procurement.duty-cost-calculations.destroy',
                                                        calculation.id,
                                                    ),
                                                );
                                            }}
                                        >
                                            Delete
                                        </DangerButton>
                                    ) : null}
                                </div>
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
                            <section className="self-start rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface lg:col-span-8 lg:sticky lg:top-20 lg:z-10">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-cursor-bright">
                                            {calculation.title}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                                            {[
                                                calculation.calculation_code,
                                                calculation.reference_no
                                                    ? `Ref. ${calculation.reference_no}`
                                                    : null,
                                                `Supplier: ${calculation.supplier_name || '—'}`,
                                            ]
                                                .filter((p) => (p ?? '').toString().trim().length > 0)
                                                .join(' · ') || '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                            Last updated: {fmtDate(calculation.updated_at)} by{' '}
                                            {calculation.updater?.name || '—'}
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
                                    >
                                        {formatCalculationStatusLabel(calculation.calculation_status)}
                                    </span>
                                </div>

                                <div className="mt-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Info label="Purchasing Currency" value={calculation.purchasing_currency || '—'} />
                                        <Info label="Local Currency" value={calculation.local_currency || '—'} />
                                        <Info
                                            label="Total Product Value (Foreign)"
                                            value={formatLocalMoneyDisplay(
                                                totalProductValueFcy,
                                                purchasingCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Exchange Rate"
                                            value={`${formatMoneyInputWithCommas(
                                                String(Number(calculation.exchange_rate) || 0),
                                                3,
                                                exchangeRateFormatOptions,
                                            )} ${localCurrencyCode} / 1 ${purchasingCurrencyCode}`}
                                        />
                                        <Info label="Freight Currency" value={calculation.freight_currency || '—'} />
                                        <Info
                                            label="Freight Cost"
                                            value={formatLocalMoneyDisplay(freightCostForeign, freightCcy, company)}
                                        />
                                        <Info
                                            label="Freight Exchange Rate"
                                            value={`${formatMoneyInputWithCommas(
                                                String(Number(calculation.freight_exchange_rate) || 0),
                                                3,
                                                exchangeRateFormatOptions,
                                            )} ${localCurrencyCode} / 1 ${
                                                freightCurrencyCode.length === 3
                                                    ? freightCurrencyCode.toUpperCase()
                                                    : freightCcy || '—'
                                            }`}
                                        />
                                        <Info
                                            label={`Total CBM (${String(t('item_count') ?? items.length ?? 0)} Products)`}
                                            value={(() => {
                                                const raw = totals.total_cbm ?? calculation.total_cbm;
                                                if (raw === null || raw === undefined || raw === '') {
                                                    return '—';
                                                }
                                                return formatMeasuredNumberForDisplay(raw, 3) ?? '—';
                                            })()}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col gap-4 self-start lg:col-span-4 lg:sticky lg:top-20 lg:z-10">
                                {dutyRatesSection}
                                <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        Bank Charges
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                        {`Bank charges split across products by each product's share of purchase value.`}
                                    </p>
                                    <div className="mt-4 grid grid-cols-1 gap-4">
                                        <Info
                                            label="Bank Interest Rate (Per Annum)"
                                            value={
                                                formatAnnualPercentRateDisplay(calculation.bank_interest_rate_pa) ??
                                                '—'
                                            }
                                        />
                                        <Info
                                            label="Number of Months"
                                            value={
                                                formatMeasuredNumberForDisplay(
                                                    calculation.bank_interest_months,
                                                    2,
                                                ) ?? '—'
                                            }
                                        />
                                    </div>
                                </section>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
                                <section className="self-start rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface lg:col-span-8 lg:sticky lg:top-20 lg:z-10">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        Local Charges
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                        Local charges are pooled with other common costs and allocated to each product
                                        by weight.
                                    </p>
                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Info
                                            label="Loading / Unloading"
                                            value={formatLocalMoneyDisplay(
                                                calculation.loading_unloading_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Additional Entry"
                                            value={formatLocalMoneyDisplay(
                                                calculation.additional_entry_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Transport"
                                            value={formatLocalMoneyDisplay(
                                                calculation.transport_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Delivery Order Charges"
                                            value={formatLocalMoneyDisplay(
                                                calculation.delivery_order_charges_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Clearing Charges"
                                            value={formatLocalMoneyDisplay(
                                                calculation.clearing_charges_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                        <Info
                                            label="Demurrage"
                                            value={formatLocalMoneyDisplay(
                                                calculation.demurrage_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            )}
                                        />
                                    </div>
                                </section>

                                <section className="self-start rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface lg:col-span-4 lg:sticky lg:top-20 lg:z-10">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        Extra Costs
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                        Optional additional charges to include in the estimate.
                                    </p>
                                    {otherCosts.length > 0 ? (
                                        <div className="mt-4 space-y-2">
                                            {otherCosts.map((row) => (
                                                <div
                                                    key={row.id}
                                                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-cursor-border dark:bg-cursor-raised/40"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                        <div className="font-medium text-gray-900 dark:text-cursor-fg">
                                                            {row.cost_name || '—'}
                                                        </div>
                                                        <div className="font-medium text-gray-900 dark:text-cursor-fg">
                                                            {formatLocalMoneyDisplay(
                                                                row.amount_lkr,
                                                                localCurrencyCode,
                                                                company,
                                                            )}
                                                        </div>
                                                    </div>
                                                    {row.remarks ? (
                                                        <div className="mt-1 text-xs text-gray-600 dark:text-cursor-muted">
                                                            {row.remarks}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-gray-600 dark:text-cursor-muted">
                                            No extra costs.
                                        </p>
                                    )}
                                </section>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                                <div className="border-b border-gray-200 px-4 py-3 dark:border-cursor-border">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        Products
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-cursor-muted">
                                        Products on this shipment, including quantities, prices, and customs values.
                                    </div>
                                </div>
                                <table className="min-w-full table-auto divide-y divide-gray-200">
                                    <thead className="bg-gray-50 dark:bg-cursor-raised/30">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                No.
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                UOM
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                CBM
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                Weight (KG)
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                                Preset
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                                        {items.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-gray-50 dark:hover:bg-cursor-raised/25"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-cursor-fg">
                                                    {row.line_no}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-fg">
                                                    {row.product_name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-cursor-fg">
                                                    {row.unit_of_measure}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                                    {formatMeasuredNumberForDisplay(row.quantity, 2) ?? ''}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                                    {formatLocalMoneyDisplay(
                                                        row.unit_price_foreign,
                                                        purchasingCurrencyCode,
                                                        company,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                                    {formatMeasuredNumberForDisplay(row.cbm, 3) ?? ''}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                                    {formatMeasuredNumberForDisplay(row.weight_kg, 3) ?? ''}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                                    {formatLocalMoneyDisplay(
                                                        row.customs_preset_value_foreign_or_base,
                                                        purchasingCurrencyCode,
                                                        company,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 xl:sticky xl:top-20 xl:z-10 xl:self-start dark:border-cursor-border dark:bg-cursor-surface">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                Shipment Summary
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                Totals for the shipment based on your entries.
                            </p>
                            <div className="mt-3 space-y-2 text-sm">
                                {shipmentSummaryRows.map(([label, value]) => {
                                    const redRow =
                                        label === 'Total Allocated Other Costs' ||
                                        label === 'Total Duty' ||
                                        label === 'Remittance' ||
                                        label === 'Grand Total';
                                    return (
                                        <div
                                            key={label}
                                            className="flex justify-between gap-3 border-b border-gray-100 py-1.5 dark:border-cursor-border"
                                        >
                                            <span
                                                className={
                                                    redRow
                                                        ? 'font-semibold text-red-600 dark:text-red-400'
                                                        : 'text-gray-600 dark:text-cursor-muted'
                                                }
                                            >
                                                {label}
                                            </span>
                                            <span
                                                className={
                                                    redRow
                                                        ? 'text-right font-semibold text-red-600 dark:text-red-400'
                                                        : 'text-right font-medium text-gray-900 dark:text-cursor-fg'
                                                }
                                            >
                                                {value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600 dark:bg-cursor-raised/50 dark:text-cursor-muted">
                                Freight allocated by CBM. Other common costs allocated by Weight (KG).
                            </div>
                            <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600 space-y-1.5 dark:bg-cursor-raised/50 dark:text-cursor-muted">
                                <div>
                                    Purchasing exchange rate:{' '}
                                    {formatMoneyInputWithCommas(
                                        String(Number(calculation.exchange_rate) || 0),
                                        3,
                                        exchangeRateFormatOptions,
                                    )}{' '}
                                    {localCurrencyCode} / 1 {purchasingCurrencyCode}.
                                </div>
                                <div>
                                    Freight exchange rate:{' '}
                                    {formatMoneyInputWithCommas(
                                        String(Number(calculation.freight_exchange_rate) || 0),
                                        3,
                                        exchangeRateFormatOptions,
                                    )}{' '}
                                    {localCurrencyCode} / 1{' '}
                                    {freightCurrencyCode.length === 3
                                        ? freightCurrencyCode.toUpperCase()
                                        : '—'}
                                    .
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 xl:sticky xl:top-20 xl:z-10 xl:self-start dark:border-cursor-border dark:bg-cursor-surface">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                Product Summary
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                Per-product cost breakdown.
                            </p>
                            <div className="mt-3 flex flex-col gap-4">
                                {items.map((row, idx) => {
                                    const name = (row.product_name || '').trim();
                                    const productHeading = name
                                        ? `No. ${row.line_no ?? idx + 1} · ${name}`
                                        : `No. ${row.line_no ?? idx + 1}`;
                                    const bankTransferShipment = Number(t('bank_transfer_charges_lkr')) || 0;
                                    const bankInterestShipment = Number(t('bank_interest_lkr')) || 0;
                                    const bankPool = bankTransferShipment + bankInterestShipment;
                                    const allocBank = Number(row.allocated_bank_charges_lkr) || 0;
                                    let lineBankTransfer = 0;
                                    let lineBankInterest = 0;
                                    if (bankPool > 0) {
                                        lineBankTransfer =
                                            Math.round(((allocBank * bankTransferShipment) / bankPool) * 100) / 100;
                                        lineBankInterest =
                                            Math.round((allocBank - lineBankTransfer) * 100) / 100;
                                    }
                                    const productSummaryRows = [
                                        [
                                            'Total Product Value (Foreign)',
                                            formatLocalMoneyDisplay(
                                                row.total_product_value_foreign,
                                                purchasingCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Total Product Value',
                                            formatLocalMoneyDisplay(
                                                row.product_value_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Total Statistical Value',
                                            formatLocalMoneyDisplay(
                                                row.statistical_value_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            `Customs Base Value (${dutyBasePercentDisplay}%)`,
                                            formatLocalMoneyDisplay(
                                                row.customs_base_110_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Total CID',
                                            formatLocalMoneyDisplay(row.cid_lkr, localCurrencyCode, company),
                                        ],
                                        [
                                            'Total VAT',
                                            formatLocalMoneyDisplay(row.vat_lkr, localCurrencyCode, company),
                                        ],
                                        [
                                            'Total SSCL',
                                            formatLocalMoneyDisplay(row.sscl_lkr, localCurrencyCode, company),
                                        ],
                                        [
                                            'Total Allocated Freight',
                                            formatLocalMoneyDisplay(
                                                row.allocated_freight_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Bank Transfer (1%)',
                                            formatLocalMoneyDisplay(lineBankTransfer, localCurrencyCode, company),
                                        ],
                                        [
                                            'Bank Interest',
                                            formatLocalMoneyDisplay(lineBankInterest, localCurrencyCode, company),
                                        ],
                                        [
                                            'Total Bank Charges (Allocated)',
                                            formatLocalMoneyDisplay(
                                                row.allocated_bank_charges_lkr ?? 0,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            `Quantity (${(row.unit_of_measure || '').trim() || '—'})`,
                                            (() => {
                                                const q = row.quantity;
                                                if (q === null || q === undefined || q === '') {
                                                    return '—';
                                                }
                                                return formatMeasuredNumberForDisplay(q, 2) ?? '—';
                                            })(),
                                        ],
                                        [
                                            'Weight (KG)',
                                            (() => {
                                                const raw = row.weight_kg;
                                                if (raw === null || raw === undefined || raw === '') {
                                                    return '—';
                                                }
                                                return formatMeasuredNumberForDisplay(raw, 3) ?? '—';
                                            })(),
                                        ],
                                        [
                                            'CBM',
                                            (() => {
                                                const raw = row.cbm;
                                                if (raw === null || raw === undefined || raw === '') {
                                                    return '—';
                                                }
                                                return formatMeasuredNumberForDisplay(raw, 3) ?? '—';
                                            })(),
                                        ],
                                        [
                                            'Total Allocated Other Costs',
                                            formatLocalMoneyDisplay(
                                                row.allocated_other_costs_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Total Duty',
                                            formatLocalMoneyDisplay(row.duty_total_lkr, localCurrencyCode, company),
                                        ],
                                        [
                                            'Remittance',
                                            formatLocalMoneyDisplay(
                                                Math.round(
                                                    ((Number(row.product_value_lkr) || 0) +
                                                        (Number(row.allocated_freight_lkr) || 0) +
                                                        lineBankTransfer) *
                                                        100,
                                                ) / 100,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Grand Total',
                                            formatLocalMoneyDisplay(
                                                row.total_landed_cost_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                        [
                                            'Landed Cost Per Unit',
                                            formatLocalMoneyDisplay(
                                                row.landed_cost_per_unit_lkr,
                                                localCurrencyCode,
                                                company,
                                            ),
                                        ],
                                    ];

                                    return (
                                        <div
                                            key={row.id ?? idx}
                                            className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface"
                                        >
                                            <div className="border-b border-gray-200 bg-slate-50 px-3 py-2 dark:border-cursor-border dark:bg-cursor-raised/50">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-cursor-muted">
                                                    {productHeading}
                                                </span>
                                            </div>
                                            <div className="space-y-2 p-3 text-sm">
                                                {productSummaryRows.map(([label, value]) => {
                                                    const redRow =
                                                        label === 'Total Allocated Other Costs' ||
                                                        label === 'Total Duty' ||
                                                        label === 'Remittance' ||
                                                        label === 'Grand Total' ||
                                                        label === 'Landed Cost Per Unit';
                                                    const valueHighlight = redRow;
                                                    return (
                                                        <div
                                                            key={`${idx}-${label}`}
                                                            className="flex justify-between gap-3 border-b border-gray-100 py-1.5 last:border-b-0 dark:border-cursor-border"
                                                        >
                                                            <span
                                                                className={
                                                                    redRow
                                                                        ? 'font-semibold text-red-600 dark:text-red-400'
                                                                        : 'text-gray-600 dark:text-cursor-muted'
                                                                }
                                                            >
                                                                {label}
                                                            </span>
                                                            <span
                                                                className={
                                                                    valueHighlight
                                                                        ? 'text-right font-semibold text-red-600 dark:text-red-400'
                                                                        : 'text-right font-medium text-gray-900 dark:text-cursor-fg'
                                                                }
                                                            >
                                                                {value}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {String(calculation.notes || '').trim() ||
                    String(calculation.shipment_currency_basis_notes || '').trim() ? (
                        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Notes</h3>
                            {String(calculation.shipment_currency_basis_notes || '').trim() ? (
                                <div className="mt-4">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        Shipment currency basis
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-cursor-fg">
                                        {calculation.shipment_currency_basis_notes}
                                    </p>
                                </div>
                            ) : null}
                            {String(calculation.notes || '').trim() ? (
                                <div
                                    className={
                                        String(calculation.shipment_currency_basis_notes || '').trim()
                                            ? 'mt-6 border-t border-gray-200 pt-4 dark:border-cursor-border'
                                            : 'mt-4'
                                    }
                                >
                                    <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        General notes
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-cursor-fg">
                                        {calculation.notes}
                                    </p>
                                </div>
                            ) : null}
                        </section>
                    ) : null}
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
