import AtmMoneyInput, {
    atmMoneyInputAddonLeftDefaultClass,
    atmMoneyInputAddonRightDefaultClass,
    atmMoneyInputInputLeftOfRightAddonClass,
    atmMoneyInputInputRightOfLeftAddonClass,
    atmMoneyInputShellNoLabelClass,
} from '@/Components/AtmMoneyInput';
import CommaDecimalInput from '@/Components/CommaDecimalInput';
import CurrencyCodeCombobox from '@/Components/CurrencyCodeCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { currencyCodes } from '@/data/currencyCodes';
import { calculateDutyCostPreview } from '@/Modules/Procurement/DutyCostCalculator/lib/calculateDutyCost';
import { formatCalculationStatusLabel } from '@/Modules/Procurement/DutyCostCalculator/lib/formatCalculationStatusLabel';
import { formatMeasuredNumberForDisplay } from '@/Modules/Procurement/DutyCostCalculator/lib/formatDutyNumbers';
import {
    currencyAddonLabelForIso,
    formatLocalMoneyDisplay,
    formatMoneyInputWithCommas,
} from '@/lib/companyFormat';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const uomOptions = [
    { value: 'Yard', label: 'Yard' },
    { value: 'Meter', label: 'Meter' },
    { value: 'KG', label: 'KG' },
    { value: 'Set', label: 'Set' },
    { value: 'Piece', label: 'Piece' },
];

const exchangeRateFormatOptions = { locale: 'en-US', minimumFractionDigits: 3 };

export default function CalculationForm({
    nextCode = '',
    showCodeAsReadOnly = false,
    data,
    setData,
    errors,
    processing,
    submitLabel,
    onSubmit,
    onCancel,
    statusOptions = ['draft', 'finalized'],
}) {
    const safeStatusOptions = Array.isArray(statusOptions) ? statusOptions : ['draft', 'finalized'];
    const company = usePage().props.company ?? {};
    const preview = useMemo(() => calculateDutyCostPreview(data), [data]);
    const currencyCodeOptions = useMemo(() => currencyCodes, []);
    const companyLocalCurrency = String(company.currency_code || 'LKR').toUpperCase();
    const localCurrencyCode = data.local_currency || companyLocalCurrency;
    const localCurrencyAddon = useMemo(
        () => currencyAddonLabelForIso(localCurrencyCode, company),
        [localCurrencyCode, company],
    );
    const purchasingCurrencyCode = data.purchasing_currency || 'USD';
    const purchasingCurrencyAddon = useMemo(
        () => currencyAddonLabelForIso(purchasingCurrencyCode, company),
        [purchasingCurrencyCode, company],
    );
    const freightCurrencyCode = data.freight_currency || '';
    const freightCurrencyAddon = useMemo(
        () =>
            currencyAddonLabelForIso(
                freightCurrencyCode || purchasingCurrencyCode || 'USD',
                company,
            ),
        [freightCurrencyCode, purchasingCurrencyCode, company],
    );

    const formulaHints = useMemo(() => {
        const basePct = String(Number(data.duty_base_percent) || 110);
        const vatPct = String(Number(data.vat_rate_percent) || 18);
        const ssclPct = String(Number(data.sscl_rate_percent) || 2.5);
        return [
            'Statistical Value = Preset Value × Weight × Exchange Rate',
            `${basePct}% Customs Base Value = Statistical Value × ${basePct}%`,
            'CID = Weight × CID / KG',
            `VAT = (${basePct}% Customs Base Value + CID) × ${vatPct}%`,
            `SSCL = (${basePct}% Customs Base Value + CID) × ${ssclPct}%`,
            'Duty = CID + VAT + SSCL',
            'Bank Transfer = 1% of (Shipment Purchase + Freight) in LKR',
            'Bank Interest = (Purchase + Freight) (LKR) × (Interest % p.a. / 100) × (Months / 12)',
            'Bank Charges are split by each product’s share of (Purchase LKR + Allocated Freight LKR)',
            'Freight per CBM = Total Freight (LKR) ÷ Σ Product CBM; Each product receives CBM × that rate',
        ];
    }, [data.duty_base_percent, data.vat_rate_percent, data.sscl_rate_percent]);

    const dutyBasePercentDisplay = Number(data.duty_base_percent) || 110;

    const updateField = (key, value) => setData(key, value);
    const updateItem = (idx, key, value) => {
        const next = [...(data.items || [])];
        next[idx] = { ...next[idx], [key]: value };
        setData('items', next);
    };
    const addItem = () => {
        setData('items', [
            ...(data.items || []),
            {
                line_no: (data.items || []).length + 1,
                product_name: '',
                product_code: '',
                description: '',
                unit_of_measure: 'Piece',
                quantity: '',
                unit_price_foreign: '',
                cbm: '',
                weight_kg: '',
                customs_preset_value_foreign_or_base: '',
            },
        ]);
    };
    const removeItem = (idx) => {
        const next = (data.items || []).filter((_, i) => i !== idx).map((row, i) => ({
            ...row,
            line_no: i + 1,
        }));
        setData('items', next);
    };
    const updateOtherCost = (idx, key, value) => {
        const next = [...(data.other_costs || [])];
        next[idx] = { ...next[idx], [key]: value };
        setData('other_costs', next);
    };
    const addOtherCost = () => {
        setData('other_costs', [
            ...(data.other_costs || []),
            { cost_name: '', amount_lkr: '', remarks: '', sort_order: (data.other_costs || []).length + 1 },
        ]);
    };
    const removeOtherCost = (idx) => {
        setData(
            'other_costs',
            (data.other_costs || []).filter((_, i) => i !== idx),
        );
    };

    const shipmentSummaryRows = useMemo(
        () => [
            ['No. of Products', preview.summary.item_count],
            [
                'Total Product Value',
                formatLocalMoneyDisplay(
                    preview.summary.total_product_value_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                'Total Statistical Value',
                formatLocalMoneyDisplay(
                    preview.summary.total_statistical_value_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                `Customs Base Value (${dutyBasePercentDisplay}%)`,
                formatLocalMoneyDisplay(
                    preview.summary.total_customs_base_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                'Total CID',
                formatLocalMoneyDisplay(preview.summary.total_cid_lkr, localCurrencyCode, company),
            ],
            [
                'Total VAT',
                formatLocalMoneyDisplay(preview.summary.total_vat_lkr, localCurrencyCode, company),
            ],
            [
                'Total SSCL',
                formatLocalMoneyDisplay(preview.summary.total_sscl_lkr, localCurrencyCode, company),
            ],
            [
                'Total Allocated Freight',
                formatLocalMoneyDisplay(
                    preview.summary.total_allocated_freight_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                'Bank Transfer (1%)',
                formatLocalMoneyDisplay(preview.summary.bank_transfer_charges_lkr, localCurrencyCode, company),
            ],
            [
                'Bank Interest',
                formatLocalMoneyDisplay(preview.summary.bank_interest_lkr, localCurrencyCode, company),
            ],
            [
                'Total Bank Charges (Allocated)',
                formatLocalMoneyDisplay(preview.summary.total_bank_charges_lkr, localCurrencyCode, company),
            ],
            [
                'Weight (KG)',
                formatMeasuredNumberForDisplay(preview.summary.total_weight_kg, 3) ?? '—',
            ],
            [
                `Total CBM (${String(preview.summary.item_count ?? 0)} Products)`,
                formatMeasuredNumberForDisplay(preview.summary.total_cbm, 3) ?? '—',
            ],
            [
                'Freight Per CBM',
                formatLocalMoneyDisplay(
                    preview.summary.freight_cost_per_cbm_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                'Total Allocated Other Costs',
                formatLocalMoneyDisplay(
                    preview.summary.total_allocated_other_costs_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
            [
                'Total Duty',
                formatLocalMoneyDisplay(preview.summary.total_duty_lkr, localCurrencyCode, company),
            ],
            [
                'Remittance',
                formatLocalMoneyDisplay(preview.summary.remittance_lkr, localCurrencyCode, company),
            ],
            [
                'Grand Total',
                formatLocalMoneyDisplay(
                    preview.summary.grand_total_landed_cost_lkr,
                    localCurrencyCode,
                    company,
                ),
            ],
        ],
        [preview, localCurrencyCode, company, dutyBasePercentDisplay],
    );

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-5"
            noValidate
        >
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Temporary decision-support tool. This does not create inventory, GRN/PO, accounting entries,
                or stock valuation.
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Shipment Information</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Basic shipment details, currencies, and freight.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {showCodeAsReadOnly ? (
                            <div>
                                <InputLabel value="Calculation Code" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={nextCode || data.calculation_code || ''}
                                    disabled
                                />
                                <div className="mt-1 text-xs text-gray-500">
                                    Auto-generated when saved.
                                </div>
                            </div>
                        ) : null}
                        <div className={showCodeAsReadOnly ? '' : 'sm:col-span-2'}>
                            <InputLabel value="Title" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.title || ''}
                                onChange={(e) => updateField('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel value="Supplier Name" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.supplier_name || ''}
                                onChange={(e) => updateField('supplier_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel value="Purchasing Currency" />
                            <CurrencyCodeCombobox
                                className="mt-1"
                                value={data.purchasing_currency || 'USD'}
                                onChange={(v) =>
                                    updateField('purchasing_currency', String(v || '').toUpperCase())
                                }
                                options={currencyCodeOptions}
                                placeholder="Select currency code..."
                            />
                            <InputError className="mt-2" message={errors.purchasing_currency} />
                        </div>
                        <div>
                            <InputLabel value="Local Currency" />
                            <CurrencyCodeCombobox
                                className="mt-1"
                                value={data.local_currency || companyLocalCurrency}
                                onChange={(v) =>
                                    updateField('local_currency', String(v || '').toUpperCase())
                                }
                                options={currencyCodeOptions}
                                placeholder="Select currency code..."
                            />
                            <InputError className="mt-2" message={errors.local_currency} />
                        </div>
                        <AtmMoneyInput
                            id="exchange_rate"
                            label="Exchange Rate"
                            addon={localCurrencyAddon}
                            value={data.exchange_rate}
                            onChange={(v) => updateField('exchange_rate', v)}
                            error={errors.exchange_rate}
                            fractionDigits={3}
                            formatOptions={exchangeRateFormatOptions}
                            placeholder="0.000"
                        />
                        <div>
                            <InputLabel value="Freight Currency" />
                            <CurrencyCodeCombobox
                                className="mt-1"
                                value={data.freight_currency || ''}
                                onChange={(v) =>
                                    updateField('freight_currency', String(v || '').toUpperCase())
                                }
                                options={currencyCodeOptions}
                                placeholder="Select currency code..."
                            />
                            <InputError className="mt-2" message={errors.freight_currency} />
                        </div>
                        <AtmMoneyInput
                            id="freight_cost_total"
                            label="Freight Cost"
                            addon={freightCurrencyAddon}
                            value={data.freight_cost_total}
                            onChange={(v) => updateField('freight_cost_total', v)}
                            error={errors.freight_cost_total}
                            fractionDigits={2}
                        />
                        <AtmMoneyInput
                            id="freight_exchange_rate"
                            label="Freight Exchange Rate"
                            addon={localCurrencyAddon}
                            value={data.freight_exchange_rate}
                            onChange={(v) => updateField('freight_exchange_rate', v)}
                            error={errors.freight_exchange_rate}
                            fractionDigits={3}
                            formatOptions={exchangeRateFormatOptions}
                            placeholder="0.000"
                        />
                        <div>
                            <InputLabel value="Calculation Status" />
                            <FormSelect
                                className="mt-1"
                                value={data.calculation_status || 'draft'}
                                onChange={(v) => updateField('calculation_status', v)}
                                options={safeStatusOptions.map((s) => ({
                                    value: s,
                                    label: formatCalculationStatusLabel(s),
                                }))}
                            />
                        </div>
                    </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Duty Rates</h3>
                <p className="mt-1 text-xs text-gray-500">Customs duty assumptions for this calculation.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AtmMoneyInput
                        id="cid_rate_per_kg_lkr"
                        label="CID / Kg"
                        addon={localCurrencyAddon}
                        value={data.cid_rate_per_kg_lkr ?? ''}
                        onChange={(v) => updateField('cid_rate_per_kg_lkr', v)}
                        error={errors.cid_rate_per_kg_lkr}
                        fractionDigits={2}
                    />
                    <AtmMoneyInput
                        id="duty_base_percent"
                        label="Customs Base Value (%)"
                        addonRight="%"
                        value={data.duty_base_percent ?? ''}
                        onChange={(v) => updateField('duty_base_percent', v)}
                        error={errors.duty_base_percent}
                        fractionDigits={2}
                    />
                    <AtmMoneyInput
                        id="vat_rate_percent"
                        label="VAT Rate (%)"
                        addonRight="%"
                        value={data.vat_rate_percent ?? ''}
                        onChange={(v) => updateField('vat_rate_percent', v)}
                        error={errors.vat_rate_percent}
                        fractionDigits={2}
                    />
                    <AtmMoneyInput
                        id="sscl_rate_percent"
                        label="SSCL Rate (%)"
                        addonRight="%"
                        value={data.sscl_rate_percent ?? ''}
                        onChange={(v) => updateField('sscl_rate_percent', v)}
                        error={errors.sscl_rate_percent}
                        fractionDigits={2}
                    />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Bank Charges</h3>
                <p className="mt-1 text-xs text-gray-500">
                    Bank charges split across products by each product’s share of purchase value.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AtmMoneyInput
                        id="bank_interest_rate_pa"
                        label="Bank Interest Rate (Per Annum)"
                        addonRight="%"
                        value={data.bank_interest_rate_pa ?? ''}
                        onChange={(v) => updateField('bank_interest_rate_pa', v)}
                        error={errors.bank_interest_rate_pa}
                        fractionDigits={2}
                    />
                    <AtmMoneyInput
                        id="bank_interest_months"
                        label="Number of Months"
                        value={data.bank_interest_months ?? ''}
                        onChange={(v) => updateField('bank_interest_months', v)}
                        error={errors.bank_interest_months}
                        fractionDigits={2}
                        useThousandSeparator={false}
                        placeholder="0"
                    />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Local Charges</h3>
                <p className="mt-1 text-xs text-gray-500">
                    Local charges are pooled with other common costs and allocated to each product by weight.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                        ['loading_unloading_cost_lkr', 'Loading / Unloading'],
                        ['additional_entry_cost_lkr', 'Additional Entry'],
                        ['transport_cost_lkr', 'Transport'],
                        ['delivery_order_charges_lkr', 'Delivery Order Charges'],
                        ['clearing_charges_lkr', 'Clearing Charges'],
                        ['demurrage_cost_lkr', 'Demurrage'],
                    ].map(([key, name]) => (
                        <AtmMoneyInput
                            key={key}
                            id={key}
                            label={name}
                            addon={localCurrencyAddon}
                            value={data[key]}
                            onChange={(v) => updateField(key, v)}
                            error={errors[key]}
                            fractionDigits={2}
                        />
                    ))}
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Extra Costs</h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Optional additional charges to include in the estimate.
                        </p>
                    </div>
                    <PrimaryButton type="button" onClick={addOtherCost}>
                        Add Cost
                    </PrimaryButton>
                </div>
                <div className="mt-4 space-y-3">
                    {(data.other_costs || []).map((row, idx) => (
                        <div
                            key={idx}
                            className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                        >
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                <div className="md:col-span-4">
                                    <InputLabel value="Cost Name" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.cost_name || ''}
                                        onChange={(e) => updateOtherCost(idx, 'cost_name', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <AtmMoneyInput
                                        id={`other-cost-amount-${idx}`}
                                        label="Amount"
                                        addon={localCurrencyAddon}
                                        value={row.amount_lkr}
                                        onChange={(v) => updateOtherCost(idx, 'amount_lkr', v)}
                                        error={errors[`other_costs.${idx}.amount_lkr`]}
                                        fractionDigits={2}
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <InputLabel value="Remarks" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.remarks || ''}
                                        onChange={(e) => updateOtherCost(idx, 'remarks', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-12 flex justify-end">
                                    <SecondaryButton type="button" onClick={() => removeOtherCost(idx)}>
                                        Remove
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Products</h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Products on this shipment, including quantities, prices, and customs values.
                        </p>
                    </div>
                    <PrimaryButton type="button" onClick={addItem}>
                        Add Product
                    </PrimaryButton>
                </div>
                <div className="mt-2 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                    {formulaHints.map((hint) => (
                        <div key={hint}>{hint}</div>
                    ))}
                </div>
                <InputError className="mt-2" message={errors.items} />

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-[842px] divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'No.',
                                    'Product',
                                    'UOM',
                                    'Qty',
                                    'Unit Price',
                                    'CBM',
                                    'Weight',
                                    'Preset',
                                    'Actions',
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className={[
                                            'whitespace-nowrap px-2 py-2 text-left text-xs font-semibold text-gray-600',
                                            h === 'Product' ? 'min-w-[162px]' : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {preview.items.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="px-2 py-2">{idx + 1}</td>
                                    <td className="min-w-[162px] px-2 py-2">
                                        <TextInput
                                            className="block w-full"
                                            value={data.items?.[idx]?.product_name || ''}
                                            onChange={(e) => updateItem(idx, 'product_name', e.target.value)}
                                        />
                                        <InputError className="mt-1" message={errors[`items.${idx}.product_name`]} />
                                    </td>
                                    <td className="min-w-[110px] px-2 py-2">
                                        <FormSelect
                                            value={data.items?.[idx]?.unit_of_measure || 'Piece'}
                                            onChange={(v) => updateItem(idx, 'unit_of_measure', v)}
                                            options={uomOptions}
                                        />
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <CommaDecimalInput
                                            className="block w-full min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right shadow-sm transition hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                            value={data.items?.[idx]?.quantity ?? ''}
                                            onChange={(v) => updateItem(idx, 'quantity', v)}
                                            maxFractionDigits={2}
                                        />
                                    </td>
                                    <td className="min-w-[148px] px-2 py-2">
                                        <div className={atmMoneyInputShellNoLabelClass}>
                                            <div className={atmMoneyInputAddonLeftDefaultClass}>
                                                {purchasingCurrencyAddon}
                                            </div>
                                            <CommaDecimalInput
                                                className={atmMoneyInputInputRightOfLeftAddonClass}
                                                value={data.items?.[idx]?.unit_price_foreign ?? ''}
                                                onChange={(v) => updateItem(idx, 'unit_price_foreign', v)}
                                                maxFractionDigits={2}
                                            />
                                        </div>
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <CommaDecimalInput
                                            className="block w-full min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-right shadow-sm transition hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                            value={data.items?.[idx]?.cbm ?? ''}
                                            onChange={(v) => updateItem(idx, 'cbm', v)}
                                            maxFractionDigits={3}
                                        />
                                    </td>
                                    <td className="min-w-[148px] px-2 py-2">
                                        <div className={atmMoneyInputShellNoLabelClass}>
                                            <CommaDecimalInput
                                                className={atmMoneyInputInputLeftOfRightAddonClass}
                                                value={data.items?.[idx]?.weight_kg ?? ''}
                                                onChange={(v) => updateItem(idx, 'weight_kg', v)}
                                                maxFractionDigits={3}
                                            />
                                            <div className={atmMoneyInputAddonRightDefaultClass}>KG</div>
                                        </div>
                                    </td>
                                    <td className="min-w-[148px] px-2 py-2">
                                        <div className={atmMoneyInputShellNoLabelClass}>
                                            <div className={atmMoneyInputAddonLeftDefaultClass}>
                                                {purchasingCurrencyAddon}
                                            </div>
                                            <CommaDecimalInput
                                                className={atmMoneyInputInputRightOfLeftAddonClass}
                                                value={data.items?.[idx]?.customs_preset_value_foreign_or_base ?? ''}
                                                onChange={(v) =>
                                                    updateItem(idx, 'customs_preset_value_foreign_or_base', v)
                                                }
                                                maxFractionDigits={2}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <SecondaryButton type="button" onClick={() => removeItem(idx)}>
                                            Remove
                                        </SecondaryButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-start">
                <section className="rounded-lg border border-gray-200 bg-white p-5 xl:sticky xl:top-20 xl:z-10 xl:self-start dark:border-cursor-border dark:bg-cursor-surface">
                    <h3 className="text-sm font-semibold text-gray-900">Shipment Summary</h3>
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
                                <div key={label} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                                    <span
                                        className={
                                            redRow
                                                ? 'font-semibold text-red-600 dark:text-red-400'
                                                : 'text-gray-600'
                                        }
                                    >
                                        {label}
                                    </span>
                                    <span
                                        className={
                                            redRow
                                                ? 'text-right font-semibold text-red-600 dark:text-red-400'
                                                : 'text-right font-medium text-gray-900'
                                        }
                                    >
                                        {value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                        Freight allocated by CBM. Other common costs allocated by Weight (KG).
                    </div>
                    <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600 space-y-1.5">
                        <div>
                            Purchasing exchange rate:{' '}
                            {formatMoneyInputWithCommas(
                                String(Number(data.exchange_rate) || 0),
                                3,
                                exchangeRateFormatOptions,
                            )}{' '}
                            {localCurrencyCode} per 1 {purchasingCurrencyCode}.
                        </div>
                        <div>
                            Freight exchange rate:{' '}
                            {formatMoneyInputWithCommas(
                                String(Number(data.freight_exchange_rate) || 0),
                                3,
                                exchangeRateFormatOptions,
                            )}{' '}
                            {localCurrencyCode} per 1{' '}
                            {freightCurrencyCode.trim().length === 3
                                ? freightCurrencyCode.trim().toUpperCase()
                                : '—'}
                            .
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-5 xl:sticky xl:top-20 xl:z-10 xl:self-start dark:border-cursor-border dark:bg-cursor-surface">
                    <h3 className="text-sm font-semibold text-gray-900">Product Summary</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        Per-product cost breakdown.
                    </p>
                    <div className="mt-3 flex flex-col gap-4">
                        {preview.items.map((row, idx) => {
                            const name = (data.items?.[idx]?.product_name || '').trim();
                            const productHeading = name ? `No. ${idx + 1} · ${name}` : `No. ${idx + 1}`;
                            const bankTransferShipment = Number(preview.summary.bank_transfer_charges_lkr) || 0;
                            const bankInterestShipment = Number(preview.summary.bank_interest_lkr) || 0;
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
                                    formatLocalMoneyDisplay(row.product_value_lkr, localCurrencyCode, company),
                                ],
                                [
                                    'Total Statistical Value',
                                    formatLocalMoneyDisplay(row.statistical_value_lkr, localCurrencyCode, company),
                                ],
                                [
                                    `Customs Base Value (${dutyBasePercentDisplay}%)`,
                                    formatLocalMoneyDisplay(row.customs_base_110_lkr, localCurrencyCode, company),
                                ],
                                ['Total CID', formatLocalMoneyDisplay(row.cid_lkr, localCurrencyCode, company)],
                                ['Total VAT', formatLocalMoneyDisplay(row.vat_lkr, localCurrencyCode, company)],
                                ['Total SSCL', formatLocalMoneyDisplay(row.sscl_lkr, localCurrencyCode, company)],
                                [
                                    'Total Allocated Freight',
                                    formatLocalMoneyDisplay(row.allocated_freight_lkr, localCurrencyCode, company),
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
                                    formatLocalMoneyDisplay(row.allocated_bank_charges_lkr, localCurrencyCode, company),
                                ],
                                [
                                    `Quantity (${(data.items?.[idx]?.unit_of_measure || '').trim() || '—'})`,
                                    (() => {
                                        const raw = data.items?.[idx]?.quantity;
                                        if (raw === null || raw === undefined || raw === '') {
                                            return '—';
                                        }
                                        return formatMeasuredNumberForDisplay(raw, 2) ?? '—';
                                    })(),
                                ],
                                [
                                    'Total Allocated Other Costs',
                                    formatLocalMoneyDisplay(row.allocated_other_costs_lkr, localCurrencyCode, company),
                                ],
                                [
                                    'Total Duty',
                                    formatLocalMoneyDisplay(row.duty_total_lkr, localCurrencyCode, company),
                                ],
                                [
                                    'Remittance',
                                    formatLocalMoneyDisplay(row.remittance_lkr, localCurrencyCode, company),
                                ],
                                [
                                    'Grand Total',
                                    formatLocalMoneyDisplay(row.total_landed_cost_lkr, localCurrencyCode, company),
                                ],
                                [
                                    'Landed Cost Per Unit',
                                    formatLocalMoneyDisplay(row.landed_cost_per_unit_lkr, localCurrencyCode, company),
                                ],
                            ];

                            return (
                                <div
                                    key={idx}
                                    className="overflow-hidden rounded-md border border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface"
                                >
                                    <div className="border-b border-gray-200 bg-slate-50 px-3 py-2 dark:border-cursor-border dark:bg-cursor-raised/50">
                                        <span className="text-sm font-semibold text-gray-600">{productHeading}</span>
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
                                                    className="flex justify-between gap-3 border-b border-gray-100 py-1.5 last:border-b-0"
                                                >
                                                    <span
                                                        className={
                                                            redRow
                                                                ? 'font-semibold text-red-600 dark:text-red-400'
                                                                : 'text-gray-600'
                                                        }
                                                    >
                                                        {label}
                                                    </span>
                                                    <span
                                                        className={
                                                            valueHighlight
                                                                ? 'text-right font-semibold text-red-600 dark:text-red-400'
                                                                : 'text-right font-medium text-gray-900'
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

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <div className="mt-4">
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.notes || ''}
                        onChange={(e) => updateField('notes', e.target.value)}
                        aria-label="Notes"
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>
            </section>

            <div className="flex items-center justify-end gap-3">
                <SecondaryButton type="button" onClick={onCancel}>
                    Back
                </SecondaryButton>
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

