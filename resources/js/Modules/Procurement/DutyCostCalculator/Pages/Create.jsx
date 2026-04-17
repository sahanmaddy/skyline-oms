import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import CalculationForm from '@/Modules/Procurement/DutyCostCalculator/Components/CalculationForm';
import { Head, router, useForm } from '@inertiajs/react';

const defaultItem = {
    line_no: 1,
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
};

export default function Create({ nextCode, statusOptions }) {
    const toast = useToast();
    const form = useForm({
        title: '',
        reference_no: '',
        supplier_name: '',
        shipment_currency_basis_notes: '',
        exchange_rate: '',
        exchange_rate_currency_label: '',
        container_cbm_capacity: '',
        shipping_cost_total_lkr: '',
        loading_cost_lkr: '',
        unloading_cost_lkr: '',
        transport_cost_lkr: '',
        delivery_order_charges_lkr: '',
        clearing_charges_lkr: '',
        demurrage_cost_lkr: '',
        notes: '',
        calculation_status: 'draft',
        items: [defaultItem],
        other_costs: [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title="Create Calculation · Duty & Cost Calculator" />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Duty & Cost Calculator', href: route('procurement.duty-cost-calculations.index') },
                    { label: `Create (${nextCode})` },
                ]}
            >
                <CalculationForm
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    statusOptions={statusOptions}
                    submitLabel="Save Calculation"
                    onCancel={() => router.get(route('procurement.duty-cost-calculations.index'))}
                    onSubmit={() =>
                        form.post(route('procurement.duty-cost-calculations.store'), {
                            onSuccess: () => toast.success('Calculation saved.'),
                            onError: () => toast.error('Please fix the highlighted fields and try again.'),
                        })
                    }
                />
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}

