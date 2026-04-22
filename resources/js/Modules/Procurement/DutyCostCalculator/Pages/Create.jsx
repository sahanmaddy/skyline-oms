import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import CalculationForm from '@/Modules/Procurement/DutyCostCalculator/Components/CalculationForm';
import { Head, router, useForm, usePage } from '@inertiajs/react';

const defaultItem = {
    line_no: 1,
    product_name: '',
    product_code: '',
    description: '',
    unit_of_measure: 'Piece',
    quantity: '',
    unit_price_foreign: '',
    cbm: '',
    weight_kg: '',
    customs_preset_value_foreign_or_base: '',
};

export default function Create({ nextCode, statusOptions, suppliers }) {
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultLocalCurrency = String(company.currency_code || 'LKR').toUpperCase();

    const form = useForm({
        title: '',
        supplier_id: '',
        supplier_name: '',
        purchasing_currency: '',
        local_currency: defaultLocalCurrency,
        shipment_currency_basis_notes: '',
        exchange_rate: '',
        freight_currency: '',
        freight_exchange_rate: '',
        freight_cost_total: '',
        loading_unloading_cost_lkr: '',
        additional_entry_cost_lkr: '',
        transport_cost_lkr: '',
        delivery_order_charges_lkr: '',
        clearing_charges_lkr: '',
        demurrage_cost_lkr: '',
        cid_rate_per_kg_lkr: '',
        cid_basis: '',
        eid_rate_per_kg_lkr: '',
        eid_basis: '',
        statistical_value_basis: '',
        duty_base_percent: '',
        vat_rate_percent: '',
        sscl_rate_percent: '',
        bank_interest_rate_pa: '',
        bank_interest_months: '',
        notes: '',
        calculation_status: 'draft',
        items: [defaultItem],
        other_costs: [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Create Duty & Cost Calculation" />}>
            <Head title="Create Calculation · Duty & Cost Calculator" />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Duty & Cost Calculator', href: route('procurement.duty-cost-calculations.index') },
                    { label: `Create (${nextCode})` },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('procurement.duty-cost-calculations.index')}
                        backLabel="← Back to Duty & Cost Calculator"
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <CalculationForm
                            nextCode={nextCode}
                            showCodeAsReadOnly
                            data={form.data}
                            setData={form.setData}
                            errors={form.errors}
                            processing={form.processing}
                            statusOptions={statusOptions}
                            suppliers={suppliers}
                            submitLabel="Create calculation"
                            onCancel={() => router.get(route('procurement.duty-cost-calculations.index'))}
                            onSubmit={() =>
                                form.post(route('procurement.duty-cost-calculations.store'), {
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

