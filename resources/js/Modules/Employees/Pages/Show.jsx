import Dropdown from '@/Components/Dropdown';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HrModuleLayout from '@/Layouts/HrModuleLayout';
import DocumentDropzone from '@/Modules/Employees/Components/DocumentDropzone';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

function formatSalary(value) {
    const trimmed = (value ?? '').toString().trim();
    if (!trimmed) {
        return '—';
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
        return trimmed;
    }

    return `Rs. ${new Intl.NumberFormat('en-LK', {
        maximumFractionDigits: 2,
    }).format(num)}`;
}

export default function Show({ employee, documentTypeOptions, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    const roles = usePage().props.auth.roles ?? [];
    const canManageDocuments =
        roles.includes('Admin') ||
        roles.includes('Management') ||
        roles.includes('Accounting and Finance');

    const fullNameWithGivenNames = [
        employee.first_name,
        employee.given_names,
        employee.last_name,
    ]
        .filter((p) => (p ?? '').toString().trim().length > 0)
        .join(' ');

    const employeeInitials = (fullNameWithGivenNames || employee.display_name || '')
        .split(' ')
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');

    const [uploading, setUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState({});
    const replaceInputs = useRef({});

    const upload = ({ document_type, title, notes, file }) => {
        setUploading(true);
        setUploadErrors({});

        router.post(
            route('hr.employees.documents.store', employee.id),
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
            route('hr.employees.documents.replace', [employee.id, document.id]),
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
        router.delete(route('hr.employees.documents.destroy', [employee.id, document.id]), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<ModuleStickyTitle module="Human Resource" section={employee.display_name || 'Employee'} />}
        >
            <Head title={`${employee.display_name} · Human Resource`} />

            <HrModuleLayout
                breadcrumbs={[
                    { label: 'Employees', href: route('hr.employees.index') },
                    { label: employee.display_name || 'Employee' },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('hr.employees.index')}
                    backLabel="← Back to employees"
                    actions={
                        canEdit || canDelete ? (
                            <div className="flex items-center gap-2">
                                {canEdit ? (
                                    <Link href={route('hr.employees.edit', employee.id)}>
                                        <PrimaryButton type="button">Edit</PrimaryButton>
                                    </Link>
                                ) : null}
                                {canDelete ? (
                                    <DangerButton
                                        type="button"
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: 'Delete employee',
                                                message:
                                                    'Are you sure you want to delete this employee? This action cannot be undone.',
                                                confirmText: 'Delete',
                                                variant: 'destructive',
                                            });
                                            if (!ok) return;
                                            router.delete(route('hr.employees.destroy', employee.id));
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
                        <h3 className="text-sm font-semibold text-gray-900">Employee Information</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Profile Photo
                                </div>
                                <div className="mt-2 flex items-center justify-center">
                                    {employee.profile_photo_path ? (
                                        <img
                                            src={route(
                                                'hr.employees.profilePhoto.view',
                                                employee.id,
                                            )}
                                            alt="Profile photo"
                                            className="h-20 w-20 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-400">
                                            {employeeInitials || '—'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Full name
                                </div>
                                <div className="mt-2 text-sm font-medium text-gray-900">
                                    {fullNameWithGivenNames || '—'}
                                </div>
                                <div className="mt-3 border-t border-gray-100 pt-2">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Display name
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-gray-900">
                                        {employee.display_name?.trim() || '—'}
                                    </div>
                                </div>
                            </div>
                            <Info
                                label="Employee Code"
                                value={employee.employee_code || '—'}
                            />
                            <Info
                                label="Branch"
                                value={
                                    employee.branch ? (
                                        <>
                                            <span className="font-mono text-xs">{employee.branch.code}</span>
                                            <span className="text-gray-500"> — </span>
                                            {employee.branch.name}
                                        </>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                            <Info label="Gender" value={employee.gender || '—'} />
                            <Info
                                label="Marital Status"
                                value={employee.marital_status || '—'}
                            />
                            <Info label="NIC" value={employee.nic || '—'} />
                            <Info
                                label="Date of Birth"
                                value={formatDisplayDate(
                                    employee.date_of_birth,
                                )}
                            />
                            <Info
                                label="Linked User / Access"
                                value={
                                    employee.user ? (
                                        <Link
                                            href={route('settings.users.show', employee.user.id)}
                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            {employee.user.name}{' '}
                                            <span className="font-normal text-gray-500">
                                                ({employee.user.email})
                                            </span>
                                        </Link>
                                    ) : (
                                        '—'
                                    )
                                }
                                className="sm:col-span-2 xl:col-span-2"
                            />
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <div className="text-sm font-semibold text-gray-900">
                                Employment Information
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <Info
                                    label="Designation"
                                    value={employee.designation || '—'}
                                />
                                <Info
                                    label="Department"
                                    value={employee.department || '—'}
                                />
                                <Info
                                    label="Joined Date"
                                    value={formatDisplayDate(
                                        employee.joined_date,
                                    )}
                                />
                                <StatusInfo
                                    label="Status"
                                    isPositive={employee.status === 'active'}
                                    value={
                                        employee.status === 'active'
                                            ? 'Active'
                                            : 'Inactive'
                                    }
                                />
                                <StatusInfo
                                    label="Sales Commission Eligible"
                                    isPositive={!!employee.is_sales_commission_eligible}
                                    value={
                                        employee.is_sales_commission_eligible
                                            ? 'Yes'
                                            : 'No'
                                    }
                                />
                                <StatusInfo
                                    label="Overtime Eligibility"
                                    isPositive={!!employee.is_overtime_eligible}
                                    value={
                                        employee.is_overtime_eligible ? 'Yes' : 'No'
                                    }
                                />
                                <Info
                                    label="Employment Type"
                                    value={employee.employment_type || '—'}
                                />
                                <Info
                                    label="Basic Salary"
                                    value={formatSalary(employee.basic_salary)}
                                />
                            </div>
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
                                                <div className="flex items-center justify-between gap-3 text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {phone.phone_type}
                                                    </div>
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

                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Emergency Contact
                                </div>

                                <div className="mt-2 space-y-2">
                                    {employee.emergency_contact_person ||
                                    employee.emergency_contact_phone ? (
                                        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {employee.emergency_contact_person || '—'}
                                                </div>
                                                <div className="font-medium text-gray-900">
                                                    {employee.emergency_contact_phone || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            No emergency contact.
                                        </div>
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
                            <Info label="City/District" value={employee.city || '—'} />
                            <Info label="Country" value={employee.country || '—'} />
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
                        <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-6">
                            <Info
                                label="Bank Name"
                                value={employee.bank_name || '—'}
                                className="sm:col-span-2"
                            />
                            <Info
                                label="Branch"
                                value={employee.bank_branch || '—'}
                                className="sm:col-span-2"
                            />
                            <Info
                                label="Account Number"
                                value={employee.bank_account_number || '—'}
                                className="sm:col-span-2"
                            />
                            <Info
                                label="EPF Number"
                                value={employee.epf_number || '—'}
                                className="sm:col-span-3"
                            />
                            <Info
                                label="ETF Number"
                                value={employee.etf_number || '—'}
                                className="sm:col-span-3"
                            />
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
                                employeeCode={employee.employee_code}
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
                                    {employee.documents?.map((d) => (
                                        <tr key={d.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 w-[110px]">
                                                <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                    {d.document_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {(d.title && d.title.trim()) ||
                                                        inferDocumentTitleFromFileName(
                                                            d.file_name,
                                                        )}
                                                </div>

                                                {d.notes && d.notes.trim() ? (
                                                    <div className="mt-1 text-xs text-gray-600">
                                                        {d.notes}
                                                    </div>
                                                ) : null}

                                                <div className="mt-1 text-xs text-gray-500 whitespace-nowrap">
                                                    {formatDocumentFileMeta(
                                                        d.file_name,
                                                        d.file_size,
                                                    )}
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
                                                <div className="relative z-50 flex items-center justify-end gap-2">
                                                    <a
                                                        className="inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                                        href={
                                                            route('hr.employees.documents.view', [
                                                                employee.id,
                                                                d.id,
                                                            ]) +
                                                            `?filename=${encodeURIComponent(
                                                                d.file_name || '',
                                                            )}`
                                                        }
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
                                                                href={
                                                                    route('hr.employees.documents.download', [
                                                                        employee.id,
                                                                        d.id,
                                                                    ]) +
                                                                    `?filename=${encodeURIComponent(
                                                                        d.file_name || '',
                                                                    )}`
                                                                }
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

                                    {(!employee.documents || employee.documents.length === 0) && (
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
            </HrModuleLayout>
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

    // Handle Date objects (rare, but can happen depending on how props are serialized).
    if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Colombo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(value);
        }

        return '—';
    }

    if (typeof value === 'string') {
        // Keep YYYY-MM-DD as-is if it's already date-only.
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        // Laravel may serialize date casts as UTC timestamps.
        // Example: "1995-04-30" (date) can arrive as "1995-04-29T18:30:00.000000Z"
        // depending on app timezone, which would be wrong if we just slice.
        if (value.includes('T')) {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                // Output YYYY-MM-DD in the app timezone so the calendar date is correct.
                return new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Colombo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).format(parsed);
            }
        }

        return value;
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

function inferDocumentTitleFromFileName(fileName) {
    const trimmed = (fileName || '').trim();
    if (!trimmed) {
        return '';
    }

    // Remove extension
    const lastDot = trimmed.lastIndexOf('.');
    const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;

    // Expected format: {employeeCode} - {docTypeNormalized}
    // (supports both "E-001-Doc" and "E-001 - Doc")
    const match = base.match(/^(E-\d{1,})\s*-\s*(.+)$/);
    if (!match) {
        // Fallback: replace hyphens with spaces for readability.
        return base.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const employeeCode = match[1];
    const docTypeNormalized = match[2];
    const docTypeReadable = docTypeNormalized
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return `${employeeCode} - ${docTypeReadable}`;
}

function formatDocumentFileMeta(fileName, fileSize) {
    const fileNameTrim = (fileName || '').trim();
    const sizeKB = fileSize ? Math.round(fileSize / 1024) : null;

    const ext = fileNameTrim.includes('.')
        ? fileNameTrim.split('.').pop().toUpperCase()
        : '';

    if (!ext && sizeKB === null) {
        return '—';
    }

    if (ext && sizeKB !== null) {
        return `${ext} • ${sizeKB} KB`;
    }

    if (sizeKB !== null) {
        return `${sizeKB} KB`;
    }

    return ext;
}

