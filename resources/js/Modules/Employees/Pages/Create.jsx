import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ statusOptions, users }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_code: '',
        first_name: '',
        last_name: '',
        display_name: '',
        email: '',
        designation: '',
        department: '',
        nic: '',
        status: statusOptions?.[0] ?? 'active',
        joined_date: '',
        notes: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: '',
        bank_name: '',
        bank_branch: '',
        bank_account_number: '',
        user_id: '',
        is_sales_commission_eligible: false,
        phone_numbers: [],
    });

    return (
        <AuthenticatedLayout
            header={<span className="text-base font-semibold">New Employee</span>}
        >
            <Head title="New Employee" />

            <div className="mb-4">
                <Link
                    href={route('employees.index')}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to employees
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
                    submitLabel="Create"
                    onSubmit={() => post(route('employees.store'))}
                />
            </div>
        </AuthenticatedLayout>
    );
}

