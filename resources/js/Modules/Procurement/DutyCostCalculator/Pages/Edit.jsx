import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import CalculationForm from '@/Modules/Procurement/DutyCostCalculator/Components/CalculationForm';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function Edit({ calculation, statusOptions, suppliers, unitOfMeasureOptions = [] }) {
    const firstUom = unitOfMeasureOptions[0]?.value ?? '';
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultLocalCurrency = String(company.currency_code || 'LKR').toUpperCase();
    const form = useForm({
        title: calculation.title || '',
        supplier_id: calculation.supplier_id || '',
        supplier_name: calculation.supplier_name || '',
        purchasing_currency: calculation.purchasing_currency || '',
        local_currency: calculation.local_currency || defaultLocalCurrency,
        shipment_currency_basis_notes: calculation.shipment_currency_basis_notes || '',
        exchange_rate: calculation.exchange_rate || '',
        freight_currency: calculation.freight_currency || '',
        freight_exchange_rate: calculation.freight_exchange_rate || '',
        freight_cost_total: calculation.freight_cost_total ?? '',
        loading_unloading_cost_lkr: calculation.loading_unloading_cost_lkr || '',
        additional_entry_cost_lkr: calculation.additional_entry_cost_lkr || '',
        transport_cost_lkr: calculation.transport_cost_lkr || '',
        delivery_order_charges_lkr: calculation.delivery_order_charges_lkr || '',
        clearing_charges_lkr: calculation.clearing_charges_lkr || '',
        demurrage_cost_lkr: calculation.demurrage_cost_lkr || '',
        cid_rate_per_kg_lkr:
            calculation.cid_rate_per_kg_lkr ??
            calculation.items?.[0]?.cid_rate_per_kg_lkr ??
            '',
        cid_basis: calculation.cid_basis || '',
        eid_rate_per_kg_lkr:
            calculation.eid_rate_per_kg_lkr ??
            calculation.items?.[0]?.eid_rate_per_kg_lkr ??
            '',
        eid_basis: calculation.eid_basis || '',
        statistical_value_basis: calculation.statistical_value_basis || '',
        duty_base_percent: calculation.duty_base_percent ?? '',
        vat_rate_percent: calculation.vat_rate_percent ?? '',
        sscl_rate_percent: calculation.sscl_rate_percent ?? '',
        bank_interest_rate_pa: calculation.bank_interest_rate_pa ?? '',
        bank_interest_months: calculation.bank_interest_months ?? '',
        notes: calculation.notes || '',
        calculation_status: calculation.calculation_status || 'draft',
        items: (calculation.items || []).map((row) => ({
            line_no: row.line_no,
            product_name: row.product_name || '',
            product_code: row.product_code || '',
            description: row.description || '',
            unit_of_measure: row.unit_of_measure || firstUom,
            quantity: row.quantity || '',
            unit_price_foreign: row.unit_price_foreign || '',
            cbm: row.cbm || '',
            weight_kg: row.weight_kg || '',
            customs_preset_value_foreign_or_base: row.customs_preset_value_foreign_or_base || '',
        })),
        other_costs: (calculation.other_costs || []).map((row) => ({
            cost_name: row.cost_name || '',
            amount_lkr: row.amount_lkr || '',
            remarks: row.remarks || '',
            sort_order: row.sort_order || 0,
        })),
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title={`Edit ${calculation.calculation_code} · Duty & Cost Calculator`} />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Duty & Cost Calculator', href: route('procurement.duty-cost-calculations.index') },
                    { label: calculation.calculation_code, href: route('procurement.duty-cost-calculations.show', calculation.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('procurement.duty-cost-calculations.show', calculation.id)}
                        backLabel="← Back to calculation"
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <CalculationForm
                            nextCode={calculation.calculation_code}
                            showCodeAsReadOnly
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            processing={form.processing}
                            statusOptions={statusOptions}
                            suppliers={suppliers}
                            unitOfMeasureOptions={unitOfMeasureOptions}
                            defaultUom={firstUom}
                            submitLabel="Update calculation"
                            onCancel={() =>
                                router.get(route('procurement.duty-cost-calculations.show', calculation.id))
                            }
                            onSubmit={() =>
                                form.put(route('procurement.duty-cost-calculations.update', calculation.id), {
                                    onError: () =>
                                        toast.error('Please fix the highlighted fields and try again.'),
                                })
                            }
                        />
                    </div>
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}

