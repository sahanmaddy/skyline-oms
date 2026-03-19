import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { Head, Link, useForm } from '@inertiajs/react';

function normalizeDateInput(value) {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        if (value.includes('T')) {
            return value.slice(0, 10);
        }

        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toISOString().slice(0, 10);
}

export default function Edit({ employee, statusOptions, users }) {
    const { data, setData, put, processing, errors } = useForm({
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        display_name: employee.display_name || '',
        email: employee.email || '',
        designation: employee.designation || '',
        department: employee.department || '',
        nic: employee.nic || '',
        status: employee.status || statusOptions?.[0] || 'active',
        joined_date: normalizeDateInput(employee.joined_date),
        date_of_birth: normalizeDateInput(employee.date_of_birth),
        notes: employee.notes || '',
        address_line_1: employee.address_line_1 || '',
        address_line_2: employee.address_line_2 || '',
        city: employee.city || '',
        country: employee.country || '',
        bank_name: employee.bank_name || '',
        bank_branch: employee.bank_branch || '',
        bank_account_number: employee.bank_account_number || '',
        user_id: employee.user_id || '',
        is_sales_commission_eligible: !!employee.is_sales_commission_eligible,
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
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    users={users}
                    submitLabel="Save"
                    onSubmit={() => put(route('employees.update', employee.id))}
                />
            </div>
        </AuthenticatedLayout>
    );
}

