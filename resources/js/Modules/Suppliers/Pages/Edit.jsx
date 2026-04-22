import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import SupplierForm from '@/Modules/Suppliers/Components/SupplierForm';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm } from '@inertiajs/react';

export default function Edit({ supplier }) {
    const toast = useToast();
    const form = useForm({ ...supplier, is_active: !!supplier.is_active, credit_limit: supplier.credit_limit ?? '' });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section={`Edit · ${supplier.display_name || 'Supplier'}`} />}>
            <Head title={`Edit ${supplier.display_name || 'supplier'} · Procurement`} />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Suppliers', href: route('procurement.suppliers.index') }, { label: supplier.display_name || 'Supplier', href: route('procurement.suppliers.show', supplier.id) }, { label: 'Edit' }]}>
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar backHref={route('procurement.suppliers.show', supplier.id)} backLabel="← Back to supplier" />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <SupplierForm data={form.data} setData={form.setData} errors={form.errors} processing={form.processing} submitLabel="Update supplier" onCancel={() => router.get(route('procurement.suppliers.show', supplier.id))} onSubmit={() => form.put(route('procurement.suppliers.update', supplier.id), { preserveScroll: true, onError: () => { scrollToFirstError(); toast.error('Please fix the highlighted fields and try again.'); } })} />
                    </div>
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
