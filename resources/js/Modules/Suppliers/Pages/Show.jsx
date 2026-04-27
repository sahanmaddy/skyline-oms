import { DetailFieldCard } from '@/Components/DetailFieldCard';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ supplier, canEdit, canDelete }) {
    const { confirm } = useConfirm();

    const headerDisplayName = supplier.display_name?.trim() || '—';
    const codePart = supplier.supplier_code?.trim();
    const companyPart = supplier.company_name?.trim();
    const headerSubtitle =
        codePart && companyPart ? `${codePart} · ${companyPart}` : codePart || companyPart || '—';

    const primaryPhone =
        [supplier.primary_phone_country_code, supplier.primary_phone_number].filter(Boolean).join(' ') ||
        '';
    const whatsappNumber = supplier.whatsapp_number?.trim() ?? '';
    const whatsappLine = whatsappNumber
        ? [supplier.whatsapp_country_code, whatsappNumber].filter(Boolean).join(' ')
        : '';

    const phoneRows = [];
    if (primaryPhone) {
        phoneRows.push({ key: 'primary', label: 'Primary', line: primaryPhone });
    }
    if (whatsappLine) {
        phoneRows.push({ key: 'whatsapp', label: 'WhatsApp', line: whatsappLine });
    }

    const banks = supplier.bank_accounts || [];

    return (
        <AuthenticatedLayout
            header={<ModuleStickyTitle module="Procurement" section={supplier.display_name || 'Supplier'} />}
        >
            <Head title={`${supplier.display_name || 'Supplier'} · Procurement`} />
            <ProcurementModuleLayout
                breadcrumbs={[
                    { label: 'Suppliers', href: route('procurement.suppliers.index') },
                    { label: supplier.display_name || 'Supplier' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('procurement.suppliers.index')}
                        backLabel="← Back to suppliers"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex items-center gap-2">
                                    {canEdit ? (
                                        <Link href={route('procurement.suppliers.edit', supplier.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete supplier',
                                                    message:
                                                        'Are you sure you want to delete this supplier? This action cannot be undone.',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(route('procurement.suppliers.destroy', supplier.id));
                                            }}
                                        >
                                            Delete
                                        </DangerButton>
                                    ) : null}
                                </div>
                            ) : undefined
                        }
                    />

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="flex flex-col gap-4 lg:col-span-8">
                            <section className="rounded-lg border border-gray-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-lg font-semibold text-gray-900">{headerDisplayName}</div>
                                        <div className="text-sm text-gray-600">{headerSubtitle}</div>
                                    </div>
                                    <span
                                        className={
                                            'shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                            (supplier.is_active
                                                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                                : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200')
                                        }
                                    >
                                        {supplier.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <DetailFieldCard label="Supplier Code" value={supplier.supplier_code || '—'} />
                                    <DetailFieldCard label="Display Name" value={headerDisplayName} />
                                    <DetailFieldCard label="Company Name" value={supplier.company_name?.trim() || '—'} />
                                    <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-2">
                                        <DetailFieldCard label="Contact Person" value={supplier.contact_person?.trim() || '—'} />
                                        <DetailFieldCard
                                            label="Website"
                                            value={
                                                supplier.website?.trim() ? (
                                                    <a
                                                        href={supplier.website}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-medium text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        {supplier.website}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-lg border border-gray-200 bg-white p-5">
                                <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <DetailFieldCard label="Address Line 1" value={supplier.address_line_1 || '—'} />
                                    <DetailFieldCard label="Address Line 2" value={supplier.address_line_2 || '—'} />
                                    <DetailFieldCard label="City" value={supplier.city || '—'} />
                                    <DetailFieldCard label="State / Province" value={supplier.state_province || '—'} />
                                    <DetailFieldCard label="Postal Code" value={supplier.postal_code || '—'} />
                                    <DetailFieldCard label="Country" value={supplier.country || '—'} />
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="flex flex-col gap-4 lg:sticky lg:top-20">
                                <section className="rounded-lg border border-gray-200 bg-white p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                                    <div className="mt-4 space-y-3">
                                        <DetailFieldCard label="Email" value={supplier.email || '—'} />
                                        <div className="rounded-md border border-gray-200 bg-white p-3">
                                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Phone Numbers
                                            </div>
                                            <div className="mt-2 space-y-2">
                                                {phoneRows.length ? (
                                                    phoneRows.map((row) => (
                                                        <div
                                                            key={row.key}
                                                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                                        >
                                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                                <div className="font-medium text-gray-900">{row.label}</div>
                                                                <div className="font-medium text-gray-900">{row.line}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500">No phone numbers.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-lg border border-gray-200 bg-white p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">Business Details</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-3">
                                        <DetailFieldCard label="TIN" value={supplier.tax_number || '—'} />
                                        <DetailFieldCard label="VAT" value={supplier.vat_number || '—'} />
                                    </div>
                                </section>
                            </div>
                        </div>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-12">
                            <h3 className="text-sm font-semibold text-gray-900">Bank Accounts</h3>
                            <div className="mt-4 space-y-3">
                                {banks.length ? (
                                    banks.map((row) => (
                                        <div
                                            key={row.id}
                                            className="rounded-md border border-gray-200 bg-white p-3"
                                        >
                                            {row.is_primary ? (
                                                <div className="mb-3 flex items-start justify-end gap-3">
                                                    <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                                                        Primary
                                                    </span>
                                                </div>
                                            ) : null}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
                                                    <DetailFieldCard label="Bank Name" value={row.bank_name || '—'} />
                                                    <DetailFieldCard
                                                        label="SWIFT/BIC Code"
                                                        value={row.swift_bic_code || '—'}
                                                    />
                                                </div>
                                                <DetailFieldCard label="Branch" value={row.branch_name || '—'} />
                                                <DetailFieldCard label="Account Number" value={row.account_number || '—'} />
                                                <DetailFieldCard label="Account Name" value={row.account_name || '—'} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No bank accounts.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    {supplier.notes?.trim() ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                            <div className="mt-2 text-sm text-gray-700">{supplier.notes}</div>
                        </div>
                    ) : null}
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
