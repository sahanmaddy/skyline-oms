import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

function Info({ label, value, className = '' }) { return <div className={`rounded-md border border-gray-200 bg-white p-3 ${className}`}><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 text-sm font-medium text-gray-900">{value}</div></div>; }

export default function Show({ supplier, canEdit, canDelete }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section={supplier.display_name || 'Supplier'} />}>
            <Head title={`${supplier.display_name || 'Supplier'} · Procurement`} />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Suppliers', href: route('procurement.suppliers.index') }, { label: supplier.display_name || 'Supplier' }]}>
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar backHref={route('procurement.suppliers.index')} backLabel="← Back to suppliers" actions={canEdit || canDelete ? <div className="flex gap-2">{canEdit ? <Link href={route('procurement.suppliers.edit', supplier.id)}><PrimaryButton type="button">Edit</PrimaryButton></Link> : null}{canDelete ? <DangerButton type="button" onClick={async () => { const ok = await confirm({ title: 'Delete supplier', message: 'Are you sure you want to delete this supplier? This action cannot be undone.', confirmText: 'Delete', variant: 'destructive' }); if (!ok) return; router.delete(route('procurement.suppliers.destroy', supplier.id)); }}>Delete</DangerButton> : null}</div> : undefined} />

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div><div className="text-lg font-semibold text-gray-900">{supplier.display_name || '—'}</div><div className="text-sm text-gray-600">{supplier.supplier_code || '—'} · {supplier.company_name || '—'}</div></div>
                            <span className={'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' + (supplier.is_active ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200')}>{supplier.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Info label="Contact Person" value={supplier.contact_person || '—'} />
                            <Info label="Email" value={supplier.email || '—'} />
                            <Info label="Website" value={supplier.website || '—'} />
                            <Info label="Primary Phone" value={[supplier.primary_phone_country_code, supplier.primary_phone_number].filter(Boolean).join(' ') || '—'} />
                            <Info label="WhatsApp" value={[supplier.whatsapp_country_code, supplier.whatsapp_number].filter(Boolean).join(' ') || '—'} />
                            <Info label="Currency" value={supplier.currency || '—'} />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="text-sm font-semibold text-gray-900">Address</h3><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="Address Line 1" value={supplier.address_line_1 || '—'} /><Info label="Address Line 2" value={supplier.address_line_2 || '—'} /><Info label="City" value={supplier.city || '—'} /><Info label="State / Province" value={supplier.state_province || '—'} /><Info label="Postal Code" value={supplier.postal_code || '—'} /><Info label="Country" value={supplier.country || '—'} /></div></section>
                        <section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="text-sm font-semibold text-gray-900">Business Details</h3><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="TIN" value={supplier.tax_number || '—'} /><Info label="VAT" value={supplier.vat_number || '—'} /></div></section>
                        <section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="text-sm font-semibold text-gray-900">Bank Accounts</h3><div className="mt-3 space-y-3">{supplier.bank_accounts?.length ? supplier.bank_accounts.map((row) => <div key={row.id} className="rounded-md border border-gray-200 bg-white p-3"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Info label="Bank Name" value={row.bank_name || '—'} /><Info label="Branch" value={row.branch_name || '—'} /><Info label="Account Number" value={row.account_number || '—'} /><Info label="Account Name" value={row.account_name || '—'} /><Info label="SWIFT/BIC Code" value={row.swift_bic_code || '—'} /></div><div className="mt-2">{row.is_primary ? <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">Primary</span> : null}</div></div>) : <div className="text-sm text-gray-500">No bank accounts.</div>}</div></section>
                    </div>

                    {supplier.notes ? <section className="rounded-lg border border-gray-200 bg-white p-5"><h3 className="text-sm font-semibold text-gray-900">Notes</h3><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{supplier.notes}</p></section> : null}

                    <section className="rounded-lg border border-dashed border-gray-300 bg-white p-5"><h3 className="text-sm font-semibold text-gray-900">Related Records (Coming Soon)</h3><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3"><Info label="Purchase Orders" value="0" /><Info label="Shipments" value="0" /><Info label="Calculations" value="0" /></div><div className="mt-3 text-xs text-gray-500">This section is prepared for future supplier-linked procurement flows.</div></section>

                    <div className="text-xs text-gray-500">Created by: {supplier.creator?.name || '—'} · Updated by: {supplier.updater?.name || '—'}</div>
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
