import AtmMoneyInput from '@/Components/AtmMoneyInput';
import CurrencyCodeCombobox from '@/Components/CurrencyCodeCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { currencyCodes } from '@/data/currencyCodes';
import { calculateDutyCostPreview } from '@/Modules/Procurement/DutyCostCalculator/lib/calculateDutyCost';
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

const formulaHints = [
    'Statistical Value = Preset Value × Weight × Exchange Rate',
    '110% Base = Statistical Value × 110%',
    'CID = Weight × CID Rate',
    'VAT = (110% Base + CID) × 18%',
    'SSCL = (110% Base + CID) × 2.5%',
    'Duty = CID + VAT + SSCL',
];

const exchangeRateFormatOptions = { locale: 'en-US', minimumFractionDigits: 3 };

/** Digits and at most one `.` for decimal CBM entry (plain text field, not type="number"). */
function sanitizeDecimalNumericInput(raw) {
    const cleaned = String(raw ?? '').replace(/[^\d.]/g, '');
    if (!cleaned) {
        return '';
    }
    const firstDot = cleaned.indexOf('.');
    if (firstDot === -1) {
        return cleaned;
    }
    return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

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
                cid_rate_per_kg_lkr: 30,
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

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <section className="rounded-lg border border-gray-200 bg-white p-5 xl:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900">Shipment Information</h3>
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
                            <InputLabel value="Total CBM" />
                            <TextInput
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                spellCheck={false}
                                className="mt-1 block w-full text-right"
                                value={data.total_shipment_cbm ?? ''}
                                onChange={(e) =>
                                    updateField(
                                        'total_shipment_cbm',
                                        sanitizeDecimalNumericInput(e.target.value),
                                    )
                                }
                            />
                            <InputError className="mt-2" message={errors.total_shipment_cbm} />
                        </div>
                        {[
                            ['loading_cost_lkr', 'Loading'],
                            ['unloading_cost_lkr', 'Unloading'],
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
                        <div className="sm:col-span-2">
                            <InputLabel value="Calculation Status" />
                            <FormSelect
                                className="mt-1"
                                value={data.calculation_status || 'draft'}
                                onChange={(v) => updateField('calculation_status', v)}
                                options={statusOptions.map((s) => ({ value: s, label: s }))}
                            />
                        </div>
                    </div>
                </section>

                <aside className="sticky top-20 h-fit rounded-lg border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Shipment Summary</h3>
                    <div className="mt-3 space-y-2 text-sm">
                        {[
                            ['No. of Product Lines', preview.summary.item_count],
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
                                'Total Duty',
                                formatLocalMoneyDisplay(preview.summary.total_duty_lkr, localCurrencyCode, company),
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
                                'Total Allocated Other Costs',
                                formatLocalMoneyDisplay(
                                    preview.summary.total_allocated_other_costs_lkr,
                                    localCurrencyCode,
                                    company,
                                ),
                            ],
                            [
                                'Grand Total Landed Cost',
                                formatLocalMoneyDisplay(
                                    preview.summary.grand_total_landed_cost_lkr,
                                    localCurrencyCode,
                                    company,
                                ),
                            ],
                            ['Total Weight (KG)', preview.summary.total_weight_kg],
                            ['Sum of line CBM', preview.summary.total_cbm],
                            [
                                'Freight per CBM',
                                formatLocalMoneyDisplay(
                                    preview.summary.freight_cost_per_cbm_lkr,
                                    localCurrencyCode,
                                    company,
                                ),
                            ],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                                <span className="text-gray-600">{label}</span>
                                <span className="text-right font-medium text-gray-900">{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                        Freight allocated by CBM. Other common costs allocated by Weight (KG).
                    </div>
                </aside>
            </div>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Extra Costs</h3>
                    <PrimaryButton type="button" onClick={addOtherCost}>
                        Add Cost
                    </PrimaryButton>
                </div>
                <div className="mt-3 space-y-3">
                    {(data.other_costs || []).map((row, idx) => (
                        <div key={idx} className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-12">
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
                            <div className="md:col-span-4">
                                <InputLabel value="Remarks" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={row.remarks || ''}
                                    onChange={(e) => updateOtherCost(idx, 'remarks', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1 flex items-end justify-end">
                                <SecondaryButton type="button" onClick={() => removeOtherCost(idx)}>
                                    Remove
                                </SecondaryButton>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Product Lines</h3>
                        <div className="mt-1 text-xs text-gray-600">Duty formulas are applied per line.</div>
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
                    <table className="min-w-[2080px] divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'Line',
                                    'Product',
                                    'UOM',
                                    'Qty',
                                    'Unit Price',
                                    'Total FCY',
                                    'Rate',
                                    'Product',
                                    'CBM',
                                    'Weight',
                                    'Preset',
                                    'CID / kg',
                                    'Statistical',
                                    '110% Base',
                                    'CID',
                                    'VAT',
                                    'SSCL',
                                    'Duty',
                                    'Alloc. Freight',
                                    'Alloc. Other',
                                    'Total Landed',
                                    'Landed / Unit',
                                    'Actions',
                                ].map((h) => (
                                    <th key={h} className="whitespace-nowrap px-2 py-2 text-left text-xs font-semibold text-gray-600">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {preview.items.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="px-2 py-2">{idx + 1}</td>
                                    <td className="min-w-[220px] px-2 py-2">
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
                                        <TextInput
                                            type="number"
                                            step="0.0001"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.quantity ?? ''}
                                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                        />
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <TextInput
                                            type="number"
                                            step="0.0001"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.unit_price_foreign ?? ''}
                                            onChange={(e) => updateItem(idx, 'unit_price_foreign', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right">{row.total_product_value_foreign}</td>
                                    <td className="px-2 py-2 text-right">
                                        {formatMoneyInputWithCommas(
                                            String(Number(data.exchange_rate) || 0),
                                            3,
                                            exchangeRateFormatOptions,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(row.product_value_lkr, localCurrencyCode, company)}
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <TextInput
                                            type="number"
                                            step="0.0001"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.cbm ?? ''}
                                            onChange={(e) => updateItem(idx, 'cbm', e.target.value)}
                                        />
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <TextInput
                                            type="number"
                                            step="0.0001"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.weight_kg ?? ''}
                                            onChange={(e) => updateItem(idx, 'weight_kg', e.target.value)}
                                        />
                                    </td>
                                    <td className="min-w-[120px] px-2 py-2">
                                        <TextInput
                                            type="number"
                                            step="0.0001"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.customs_preset_value_foreign_or_base ?? ''}
                                            onChange={(e) =>
                                                updateItem(
                                                    idx,
                                                    'customs_preset_value_foreign_or_base',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="min-w-[132px] px-2 py-2 align-top">
                                        <AtmMoneyInput
                                            id={`items-${idx}-cid_rate_per_kg_lkr`}
                                            showLabel={false}
                                            dense
                                            addon={localCurrencyAddon}
                                            value={data.items?.[idx]?.cid_rate_per_kg_lkr ?? ''}
                                            onChange={(v) => updateItem(idx, 'cid_rate_per_kg_lkr', v)}
                                            error={errors[`items.${idx}.cid_rate_per_kg_lkr`]}
                                            fractionDigits={2}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(
                                            row.statistical_value_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(
                                            row.customs_base_110_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(row.cid_lkr, localCurrencyCode, company)}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(row.vat_lkr, localCurrencyCode, company)}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(row.sscl_lkr, localCurrencyCode, company)}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(row.duty_total_lkr, localCurrencyCode, company)}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(
                                            row.allocated_freight_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {formatLocalMoneyDisplay(
                                            row.allocated_other_costs_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium">
                                        {formatLocalMoneyDisplay(
                                            row.total_landed_cost_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium">
                                        {formatLocalMoneyDisplay(
                                            row.landed_cost_per_unit_lkr,
                                            localCurrencyCode,
                                            company,
                                        )}
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

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <InputLabel value="Notes" />
                <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                    value={data.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                />
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

