import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import SupplierForm from '@/Modules/Suppliers/Components/SupplierForm';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm } from '@inertiajs/react';

export default function Create({ nextSupplierCode }) {
    const toast = useToast();
    const form = useForm({ supplier_code: nextSupplierCode || '', company_name: '', display_name: '', contact_person: '', email: '', website: '', primary_phone_country_code: '', primary_phone_number: '', whatsapp_country_code: '', whatsapp_number: '', address_line_1: '', address_line_2: '', city: '', state_province: '', postal_code: '', country: '', registration_number: '', tax_number: '', payment_terms_days: '', currency: 'USD', credit_limit: '', notes: '', is_active: true });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Create Supplier" />}>
            <Head title="Create supplier · Procurement" />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Suppliers', href: route('procurement.suppliers.index') }, { label: 'Create supplier' }]}>
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar backHref={route('procurement.suppliers.index')} backLabel="← Back to suppliers" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <SupplierForm data={form.data} setData={form.setData} errors={form.errors} processing={form.processing} submitLabel="Create supplier" onCancel={() => router.get(route('procurement.suppliers.index'))} onSubmit={() => form.post(route('procurement.suppliers.store'), { preserveScroll: true, onError: () => { scrollToFirstError(); toast.error('Please fix the highlighted fields and try again.'); } })} />
                    </div>
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
