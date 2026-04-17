import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { calculateDutyCostPreview } from '@/Modules/Procurement/DutyCostCalculator/lib/calculateDutyCost';
import { formatCompanyCurrency } from '@/lib/companyFormat';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'CNY', label: 'CNY' },
];

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

function money(company, value) {
    return formatCompanyCurrency(Number(value || 0), company);
}

export default function CalculationForm({
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
                product_currency: 'USD',
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
                        <div className="sm:col-span-2">
                            <InputLabel value="Title" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.title || ''}
                                onChange={(e) => updateField('title', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel value="Reference No" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={data.reference_no || ''}
                                onChange={(e) => updateField('reference_no', e.target.value)}
                            />
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
                            <InputLabel value="Exchange Rate" />
                            <TextInput
                                type="number"
                                step="0.0001"
                                className="mt-1 block w-full text-right"
                                value={data.exchange_rate || ''}
                                onChange={(e) => updateField('exchange_rate', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.exchange_rate} />
                        </div>
                        <div>
                            <InputLabel value="Rate Label" />
                            <TextInput
                                className="mt-1 block w-full"
                                placeholder="e.g. USD/LKR"
                                value={data.exchange_rate_currency_label || ''}
                                onChange={(e) =>
                                    updateField('exchange_rate_currency_label', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <InputLabel value="Container CBM Capacity" />
                            <TextInput
                                type="number"
                                step="0.0001"
                                className="mt-1 block w-full text-right"
                                value={data.container_cbm_capacity || ''}
                                onChange={(e) => updateField('container_cbm_capacity', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.container_cbm_capacity} />
                        </div>
                        <div>
                            <InputLabel value="Shipping Cost (LKR)" />
                            <TextInput
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full text-right"
                                value={data.shipping_cost_total_lkr || ''}
                                onChange={(e) => updateField('shipping_cost_total_lkr', e.target.value)}
                            />
                        </div>
                        {[
                            ['loading_cost_lkr', 'Loading (LKR)'],
                            ['unloading_cost_lkr', 'Unloading (LKR)'],
                            ['transport_cost_lkr', 'Transport (LKR)'],
                            ['delivery_order_charges_lkr', 'Delivery Order Charges (LKR)'],
                            ['clearing_charges_lkr', 'Clearing Charges (LKR)'],
                            ['demurrage_cost_lkr', 'Demurrage (LKR)'],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <InputLabel value={label} />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full text-right"
                                    value={data[key] || ''}
                                    onChange={(e) => updateField(key, e.target.value)}
                                />
                            </div>
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
                            ['Total Product Value (LKR)', money(company, preview.summary.total_product_value_lkr)],
                            ['Total Statistical Value', money(company, preview.summary.total_statistical_value_lkr)],
                            ['Total CID', money(company, preview.summary.total_cid_lkr)],
                            ['Total VAT', money(company, preview.summary.total_vat_lkr)],
                            ['Total SSCL', money(company, preview.summary.total_sscl_lkr)],
                            ['Total Duty', money(company, preview.summary.total_duty_lkr)],
                            ['Total Allocated Shipping', money(company, preview.summary.total_allocated_shipping_lkr)],
                            ['Total Allocated Other Costs', money(company, preview.summary.total_allocated_other_costs_lkr)],
                            ['Grand Total Landed Cost', money(company, preview.summary.grand_total_landed_cost_lkr)],
                            ['Total Weight (KG)', preview.summary.total_weight_kg],
                            ['Total CBM', preview.summary.total_cbm],
                            ['Shipping Cost per CBM', money(company, preview.summary.shipping_cost_per_cbm_lkr)],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                                <span className="text-gray-600">{label}</span>
                                <span className="text-right font-medium text-gray-900">{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                        Shipping allocated by CBM. Other common costs allocated by Weight (KG).
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
                                <InputLabel value="Amount (LKR)" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full text-right"
                                    value={row.amount_lkr || ''}
                                    onChange={(e) => updateOtherCost(idx, 'amount_lkr', e.target.value)}
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
                    <table className="min-w-[2200px] divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'Line',
                                    'Product',
                                    'Currency',
                                    'UOM',
                                    'Qty',
                                    'Unit Price',
                                    'Total FCY',
                                    'Rate',
                                    'Product LKR',
                                    'CBM',
                                    'Weight',
                                    'Preset',
                                    'CID Rate',
                                    'Statistical',
                                    '110% Base',
                                    'CID',
                                    'VAT',
                                    'SSCL',
                                    'Duty',
                                    'Alloc. Shipping',
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
                                            value={data.items?.[idx]?.product_currency || 'USD'}
                                            onChange={(v) => updateItem(idx, 'product_currency', v)}
                                            options={currencyOptions}
                                        />
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
                                    <td className="px-2 py-2 text-right">{data.exchange_rate || 0}</td>
                                    <td className="px-2 py-2 text-right">{row.product_value_lkr}</td>
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
                                    <td className="min-w-[120px] px-2 py-2">
                                        <TextInput
                                            type="number"
                                            step="0.01"
                                            className="block w-full text-right"
                                            value={data.items?.[idx]?.cid_rate_per_kg_lkr ?? ''}
                                            onChange={(e) => updateItem(idx, 'cid_rate_per_kg_lkr', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right">{row.statistical_value_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.customs_base_110_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.cid_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.vat_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.sscl_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.duty_total_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.allocated_shipping_lkr}</td>
                                    <td className="px-2 py-2 text-right">{row.allocated_other_costs_lkr}</td>
                                    <td className="px-2 py-2 text-right font-medium">{row.total_landed_cost_lkr}</td>
                                    <td className="px-2 py-2 text-right font-medium">{row.landed_cost_per_unit_lkr}</td>
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

