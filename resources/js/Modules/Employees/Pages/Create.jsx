import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ statusOptions, users, nextEmployeeCode }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_code: nextEmployeeCode || '',
        first_name: '',
        last_name: '',
        given_names: '',
        display_name: '',
        email: '',
        designation: '',
        department: '',
        gender: '',
        marital_status: '',
        nic: '',
        status: statusOptions?.[0] ?? 'active',
        joined_date: '',
        date_of_birth: '',
        notes: '',
        employment_type: '',
        basic_salary: '',
        is_overtime_eligible: false,
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: 'Sri Lanka',
        bank_name: '',
        bank_branch: '',
        bank_account_number: '',
        epf_number: '',
        etf_number: '',
        emergency_contact_person: '',
        emergency_contact_phone: null,
        user_id: '',
        is_sales_commission_eligible: false,
        profile_photo_path: '',
        profile_photo: null,
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
                    profilePhotoUrl={null}
                    submitLabel="Create"
                    onSubmit={() =>
                        post(route('employees.store'), {
                            forceFormData: true,
                            preserveScroll: true,
                        })
                    }
                />
            </div>
        </AuthenticatedLayout>
    );
}

