import Dropdown from '@/Components/Dropdown';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DocumentDropzone from '@/Modules/Employees/Components/DocumentDropzone';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Show({ employee, documentTypeOptions }) {
    const roles = usePage().props.auth.roles ?? [];
    const canManageDocuments =
        roles.includes('Admin') ||
        roles.includes('Management') ||
        roles.includes('Accounting and Finance');

    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState({});
    const replaceInputs = useRef({});

    const upload = ({ document_type, title, notes, file }) => {
        setUploading(true);
        setUploadErrors({});

        router.post(
            route('employees.documents.store', employee.id),
            { document_type, title, notes, file },
            {
                forceFormData: true,
                onFinish: () => setUploading(false),
                onError: (errs) => setUploadErrors(errs || {}),
            },
        );
    };

    const replace = (document, file) => {
        router.post(
            route('employees.documents.replace', [employee.id, document.id]),
            { file },
            {
                forceFormData: true,
            },
        );
    };

    const deleteDoc = (document) => {
        if (!confirm('Delete this document?')) return;
        router.delete(route('employees.documents.destroy', [employee.id, document.id]));
    };

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Employee</span>}>
            <Head title={`Employee - ${employee.display_name}`} />

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={route('employees.index')}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        ← Back to employees
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href={route('employees.edit', employee.id)}>
                            <PrimaryButton type="button">Edit</PrimaryButton>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-8">
                        <h3 className="text-sm font-semibold text-gray-900">Employee Information</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <Info label="Name" value={employee.display_name || '—'} />
                            <Info label="Employee Code" value={employee.employee_code || '—'} />
                            <Info label="NIC" value={employee.nic || '—'} />
                            <Info label="Designation" value={employee.designation || '—'} />
                            <Info label="Department" value={employee.department || '—'} />
                            <Info label="Joined Date" value={formatDisplayDate(employee.joined_date)} />
                            <Info label="Date of Birth" value={formatDisplayDate(employee.date_of_birth)} />
                            <StatusInfo
                                label="Status"
                                isPositive={employee.status === 'active'}
                                value={employee.status === 'active' ? 'Active' : 'Inactive'}
                            />
                            <StatusInfo
                                label="Sales Commission Eligible"
                                isPositive={!!employee.is_sales_commission_eligible}
                                value={employee.is_sales_commission_eligible ? 'Yes' : 'No'}
                            />
                            <Info
                                label="Linked User / Access"
                                value={
                                    employee.user
                                        ? `${employee.user.name} (${employee.user.email})`
                                        : '—'
                                }
                                className="sm:col-span-2 xl:col-span-3"
                            />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-4">
                        <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                        <div className="mt-4 space-y-3">
                            <Info label="Email" value={employee.email || '—'} />
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Phone Numbers
                                </div>
                                <div className="mt-2 space-y-2">
                                    {employee.phone_numbers?.length ? (
                                        employee.phone_numbers.map((phone) => (
                                            <div
                                                key={phone.id}
                                                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                                            >
                                                <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3 sm:items-center">
                                                    <div className="font-medium text-gray-900">{phone.phone_type}</div>
                                                    <div className="text-gray-700">{phone.country_code}</div>
                                                    <div className="font-medium text-gray-900">{phone.phone_number}</div>
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

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
                        <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Info
                                label="Address"
                                value={[employee.address_line_1, employee.address_line_2].filter(Boolean).join(', ') || '—'}
                                className="sm:col-span-2"
                            />
                            <Info label="City" value={employee.city || '—'} />
                            <Info label="Country" value={employee.country || '—'} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
                        <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Info label="Bank Name" value={employee.bank_name || '—'} />
                            <Info label="Branch" value={employee.bank_branch || '—'} />
                            <Info label="Account Number" value={employee.bank_account_number || '—'} />
                        </div>
                    </section>
                </div>

                {employee.notes && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                        <div className="mt-2 text-sm text-gray-700">{employee.notes}</div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        {canManageDocuments ? (
                            <DocumentDropzone
                                documentTypeOptions={documentTypeOptions}
                                onUpload={upload}
                                processing={uploading}
                                errors={uploadErrors}
                            />
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="text-sm font-semibold text-gray-900">
                                    Employee documents
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    You don’t have access to employee document uploads.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-4 py-3">
                                <div className="text-sm font-semibold text-gray-900">
                                    Documents
                                </div>
                                <div className="text-xs text-gray-500">
                                    View, download, replace, or delete documents.
                                </div>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Type / Title
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
                                    {employee.documents?.map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {d.document_type}
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    {d.title}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {d.file_name}
                                                    {d.file_size
                                                        ? ` • ${Math.round(
                                                              d.file_size / 1024,
                                                          )} KB`
                                                        : ''}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <div className="text-xs text-gray-500">
                                                    {d.uploader?.name ? `By ${d.uploader.name}` : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatUploadedDateTime(d.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        className="inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                                        href={route('employees.documents.view', [
                                                            employee.id,
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
                                                            <Dropdown.Link
                                                                href={route('employees.documents.download', [
                                                                    employee.id,
                                                                    d.id,
                                                                ])}
                                                            >
                                                                Download
                                                            </Dropdown.Link>

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

                                    {(!employee.documents || employee.documents.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={3}
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
        </AuthenticatedLayout>
    );
}

function Info({ label, value, className = '' }) {
    return (
        <div className={`rounded-md border border-gray-200 bg-white p-3 ${className}`}>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}

function formatDisplayDate(value) {
    if (!value) {
        return '—';
    }

    if (typeof value === 'string' && value.includes('T')) {
        return value.slice(0, 10);
    }

    return value;
}

function formatUploadedDateTime(value) {
    if (!value) {
        return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(parsed);
}

function StatusInfo({ label, value, isPositive }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
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

