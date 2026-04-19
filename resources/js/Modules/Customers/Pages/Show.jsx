import Dropdown from '@/Components/Dropdown';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import DocumentDropzone from '@/Modules/Customers/Components/DocumentDropzone';
import useConfirm from '@/feedback/useConfirm';
import { formatCompanyCurrency, formatCompanyDateTime } from '@/lib/companyFormat';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

function formatCreditLimitDisplay(value, company) {
    const trimmed = (value ?? '').toString().trim();
    if (!trimmed) return '—';

    const num = Number(trimmed);
    if (Number.isNaN(num)) return trimmed;

    return formatCompanyCurrency(num, company);
}

export default function Show({ customer, documentTypeOptions, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    const company = usePage().props.company ?? {};
    const roles = usePage().props.auth.roles ?? [];
    const canManageDocuments =
        roles.includes('Admin') ||
        roles.includes('Management') ||
        roles.includes('Sales and Marketing') ||
        roles.includes('Accounting and Finance');

    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState({});
    const replaceInputs = useRef({});

    const upload = ({ document_type, title, notes, file }) => {
        setUploading(true);
        setUploadErrors({});

        router.post(
            route('sales.customers.documents.store', customer.id),
            { document_type, title, notes, file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setUploading(false),
                onError: (errs) => setUploadErrors(errs || {}),
            },
        );
    };

    const replace = (document, file) => {
        router.post(
            route('sales.customers.documents.replace', [customer.id, document.id]),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    const deleteDoc = async (document) => {
        const ok = await confirm({
            title: 'Delete document',
            message: 'Are you sure you want to delete this document? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'destructive',
        });
        if (!ok) return;
        router.delete(route('sales.customers.documents.destroy', [customer.id, document.id]), {
            preserveScroll: true,
        });
    };

    const primaryDisplayName = customer.display_name || customer.customer_name || '—';
    const customerCodePart = customer.customer_code?.trim() || null;
    const customerDetailPart =
        customer.company_name?.trim() ||
        customer.customer_name?.trim() ||
        null;
    const headerSubtitle =
        customerCodePart && customerDetailPart
            ? `${customerCodePart} · ${customerDetailPart}`
            : customerCodePart || customerDetailPart || '—';

    return (
        <AuthenticatedLayout
            header={<ModuleStickyTitle module="Sales" section={primaryDisplayName} />}
        >
            <Head title={`${primaryDisplayName} · Sales`} />

            <SalesModuleLayout
                breadcrumbs={[
                    { label: 'Customers', href: route('sales.customers.index') },
                    { label: primaryDisplayName },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('sales.customers.index')}
                    backLabel="← Back to customers"
                    actions={
                        canEdit || canDelete ? (
                            <div className="flex items-center gap-2">
                                {canEdit ? (
                                    <Link href={route('sales.customers.edit', customer.id)}>
                                        <PrimaryButton type="button">Edit</PrimaryButton>
                                    </Link>
                                ) : null}
                                {canDelete ? (
                                    <DangerButton
                                        type="button"
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: 'Delete customer',
                                                message:
                                                    'Are you sure you want to delete this customer? This action cannot be undone.',
                                                confirmText: 'Delete',
                                                variant: 'destructive',
                                            });
                                            if (!ok) return;
                                            router.delete(route('sales.customers.destroy', customer.id));
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
                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-8">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="text-lg font-semibold text-gray-900">{primaryDisplayName}</div>
                                <div className="text-sm text-gray-600">{headerSubtitle}</div>
                            </div>
                            <span
                                className={
                                    'shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                    (customer.status === 'active'
                                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200')
                                }
                            >
                                {customer.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <Info label="Customer Code" value={customer.customer_code || '—'} />
                            <Info label="Display Name" value={primaryDisplayName} />
                            <Info label="Customer Name" value={customer.customer_name || '—'} />
                            <Info label="Company Name" value={customer.company_name || '—'} />
                            <Info label="NIC" value={customer.nic || '—'} />
                            <Info label="TIN" value={customer.tin_number || '—'} />
                            <Info label="VAT" value={customer.vat_number || '—'} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-4 lg:sticky lg:top-20 self-start">
                        <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                        <div className="mt-4">
                            <Info label="Email" value={customer.email || '—'} />
                        </div>
                        <div className="mt-4 rounded-md border border-gray-200 bg-white p-3">
                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Phone Numbers
                            </div>
                            <div className="mt-2 space-y-2">
                                {customer.phone_numbers?.length ? (
                                    customer.phone_numbers.map((phone) => (
                                        <div
                                            key={phone.id}
                                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                        >
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <div className="font-medium text-gray-900">{phone.phone_type}</div>
                                                <div className="font-medium text-gray-900">
                                                    {[phone.country_code, phone.phone_number]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No phone numbers.</div>
                                )}
                            </div>
                        </div>
                    </section>

                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
                        <h3 className="text-sm font-semibold text-gray-900">Commercial Information</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <StatusInfo
                                label="Credit Eligible"
                                isPositive={!!customer.credit_eligible}
                                value={customer.credit_eligible ? 'Yes' : 'No'}
                            />
                            <Info label="Credit Limit" value={formatCreditLimitDisplay(customer.credit_limit, company)} />
                            <Info label="Guarantor" value={customer.guarantor || '—'} className="sm:col-span-2" />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
                        <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Info
                                label="Address"
                                value={
                                    [customer.address_line_1, customer.address_line_2]
                                        .filter(Boolean)
                                        .join(', ') || '—'
                                }
                                className="sm:col-span-2"
                            />
                            <Info label="City/District" value={customer.city || '—'} />
                            <Info label="Country" value={customer.country || '—'} />
                        </div>
                    </section>
                </div>

                {customer.notes?.trim() ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                        <div className="mt-2 text-sm text-gray-700">{customer.notes}</div>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        {canManageDocuments ? (
                            <DocumentDropzone
                                customerCode={customer.customer_code}
                                documentTypeOptions={documentTypeOptions}
                                onUpload={upload}
                                processing={uploading}
                                errors={uploadErrors}
                            />
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="text-sm font-semibold text-gray-900">Customer documents</div>
                                <div className="mt-1 text-sm text-gray-600">
                                    You don’t have access to customer document uploads.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-4 py-3">
                                <div className="text-sm font-semibold text-gray-900">Documents</div>
                                <div className="text-xs text-gray-500">
                                    View, download, replace, or delete documents.
                                </div>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Uploaded
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customer.documents?.map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50">
                                            <td className="w-[180px] px-4 py-3">
                                                <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                    {d.document_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900">{d.title}</div>
                                                {d.notes && d.notes.trim() ? (
                                                    <div className="mt-1 text-xs text-gray-600">{d.notes}</div>
                                                ) : null}
                                                <div className="mt-1 whitespace-nowrap text-xs text-gray-500">
                                                    {formatDocumentFileMeta(d.file_name, d.file_size)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <div className="text-xs text-gray-500">
                                                    {d.uploader?.name ? `By ${d.uploader.name}` : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatUploadedDateTime(d.created_at, company)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="relative z-50 flex items-center justify-end gap-2">
                                                    <a
                                                        className="inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                                        href={route('sales.customers.documents.view', [
                                                            customer.id,
                                                            d.id,
                                                        ])}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                    </a>

                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                                aria-label="More actions"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                                </svg>
                                                            </button>
                                                        </Dropdown.Trigger>

                                                        <Dropdown.Content align="right" width="48">
                                                            <a
                                                                className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                href={route('sales.customers.documents.download', [
                                                                    customer.id,
                                                                    d.id,
                                                                ])}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Download
                                                            </a>

                                                            {canManageDocuments && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                                        onClick={() => replaceInputs.current[d.id]?.click()}
                                                                    >
                                                                        Replace
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                        onClick={() => deleteDoc(d)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </div>

                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={(el) => (replaceInputs.current[d.id] = el)}
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (!f) return;
                                                        replace(d, f);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                    {(!customer.documents || customer.documents.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center text-sm text-gray-500"
                                            >
                                                No documents yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            </SalesModuleLayout>
        </AuthenticatedLayout>
    );
}

function Info({ label, value, className = '' }) {
    return (
        <div className={`rounded-md border border-gray-200 bg-white p-3 ${className}`}>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}

function StatusInfo({ label, value, isPositive }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-2">
                <span
                    className={
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        (isPositive
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                            : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200')
                    }
                >
                    {value}
                </span>
            </div>
        </div>
    );
}

function formatUploadedDateTime(value, company) {
    if (!value) return '—';

    return formatCompanyDateTime(value, company, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatDocumentFileMeta(fileName, fileSize) {
    const fileNameTrim = (fileName || '').trim();
    const sizeKB = fileSize ? Math.round(fileSize / 1024) : null;

    const ext = fileNameTrim.includes('.') ? fileNameTrim.split('.').pop().toUpperCase() : '';

    if (!ext && sizeKB === null) return '—';
    if (ext && sizeKB !== null) return `${ext} • ${sizeKB} KB`;
    if (sizeKB !== null) return `${sizeKB} KB`;
    return ext;
}

