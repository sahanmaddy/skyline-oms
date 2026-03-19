import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DocumentDropzone from '@/Modules/Employees/Components/DocumentDropzone';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Show({ employee, documentTypeOptions }) {
    const roles = usePage().props.auth.roles ?? [];
    const canManageDocuments =
        roles.includes('Admin') || roles.includes('Manager') || roles.includes('Accountant');

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

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {employee.display_name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {employee.employee_code}
                                {employee.is_sales_commission_eligible
                                    ? ' • Commission eligible'
                                    : ''}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className={
                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                    (employee.status === 'active'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-700')
                                }
                            >
                                {employee.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Email" value={employee.email || '—'} />
                        <Info
                            label="Phone numbers"
                            value={
                                employee.phone_numbers?.length
                                    ? employee.phone_numbers
                                          .map(
                                              (p) =>
                                                  `${p.phone_type}: ${p.country_code} ${p.phone_number}`,
                                          )
                                          .join(' • ')
                                    : '—'
                            }
                        />
                        <Info label="Department" value={employee.department || '—'} />
                        <Info label="Designation" value={employee.designation || '—'} />
                        <Info label="Joined Date" value={employee.joined_date || '—'} />
                        <Info
                            label="Linked user"
                            value={
                                employee.user
                                    ? `${employee.user.name} (${employee.user.email})`
                                    : '—'
                            }
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="NIC" value={employee.nic || '—'} />
                        <Info label="Address line 1" value={employee.address_line_1 || '—'} />
                        <Info label="City" value={employee.city || '—'} />
                        <Info label="Country" value={employee.country || '—'} />
                        <Info label="Bank name" value={employee.bank_name || '—'} />
                        <Info label="Bank account" value={employee.bank_account_number || '—'} />
                    </div>

                    {employee.notes && (
                        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                            {employee.notes}
                        </div>
                    )}
                </div>

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
                                                    {d.created_at}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <a
                                                    className="font-medium text-indigo-600 hover:text-indigo-700"
                                                    href={route('employees.documents.view', [
                                                        employee.id,
                                                        d.id,
                                                    ])}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View
                                                </a>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <a
                                                    className="font-medium text-gray-700 hover:text-gray-900"
                                                    href={route('employees.documents.download', [
                                                        employee.id,
                                                        d.id,
                                                    ])}
                                                >
                                                    Download
                                                </a>

                                                {canManageDocuments && (
                                                    <>
                                                        <span className="mx-2 text-gray-300">
                                                            |
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="font-medium text-gray-700 hover:text-gray-900"
                                                            onClick={() => {
                                                                replaceInputs.current[d.id]?.click();
                                                            }}
                                                        >
                                                            Replace
                                                        </button>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            ref={(el) =>
                                                                (replaceInputs.current[d.id] = el)
                                                            }
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (!f) return;
                                                                replace(d, f);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <span className="mx-2 text-gray-300">
                                                            |
                                                        </span>
                                                        <DangerButton
                                                            type="button"
                                                            onClick={() => deleteDoc(d)}
                                                        >
                                                            Delete
                                                        </DangerButton>
                                                    </>
                                                )}
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

function Info({ label, value }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}

