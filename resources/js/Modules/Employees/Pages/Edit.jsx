import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { normalizeDateInputForForm } from '@/utils/employeeDates';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ employee, statusOptions, users }) {
    const { data, setData, put, processing, errors } = useForm({
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        given_names: employee.given_names || '',
        display_name: employee.display_name || '',
        email: employee.email || '',
        designation: employee.designation || '',
        department: employee.department || '',
        gender: employee.gender || '',
        marital_status: employee.marital_status || '',
        nic: employee.nic || '',
        status: employee.status || statusOptions?.[0] || 'active',
        joined_date: normalizeDateInputForForm(employee.joined_date),
        date_of_birth: normalizeDateInputForForm(employee.date_of_birth),
        notes: employee.notes || '',
        employment_type: employee.employment_type || '',
        basic_salary:
            employee.basic_salary !== null && employee.basic_salary !== undefined
                ? String(employee.basic_salary)
                : '',
        is_overtime_eligible: !!employee.is_overtime_eligible,
        address_line_1: employee.address_line_1 || '',
        address_line_2: employee.address_line_2 || '',
        city: employee.city || '',
        country: employee.country || '',
        bank_name: employee.bank_name || '',
        bank_branch: employee.bank_branch || '',
        bank_account_number: employee.bank_account_number || '',
        epf_number: employee.epf_number || '',
        etf_number: employee.etf_number || '',
        emergency_contact_person: employee.emergency_contact_person || '',
        emergency_contact_phone: employee.emergency_contact_phone || null,
        user_id: employee.user_id || '',
        is_sales_commission_eligible: !!employee.is_sales_commission_eligible,
        profile_photo_path: employee.profile_photo_path || '',
        profile_photo: null,
        phone_numbers: (employee.phone_numbers || []).map((p) => ({
            phone_type: p.phone_type,
            country_code: p.country_code,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
    });

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Edit Employee</span>}>
            <Head title="Edit Employee" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={route('employees.show', employee.id)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to employee
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <EmployeeForm
                    mode="edit"
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    users={users}
                    profilePhotoUrl={
                        employee.profile_photo_path
                            ? route('employees.profilePhoto.view', employee.id)
                            : null
                    }
                    submitLabel="Save"
                    onSubmit={() =>
                        put(route('employees.update', employee.id), {
                            forceFormData: true,
                            preserveScroll: true,
                        })
                    }
                />
            </div>
        </AuthenticatedLayout>
    );
}

