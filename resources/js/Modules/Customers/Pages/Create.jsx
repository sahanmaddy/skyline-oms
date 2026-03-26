import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomerForm from '@/Modules/Customers/Components/CustomerForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ statusOptions }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_code: '',
        customer_name: '',
        company_name: '',
        contact_person: '',
        email: '',
        status: statusOptions?.[0] ?? 'active',
        address_line_1: '',
        address_line_2: '',
        city: '',
        district: '',
        country: 'Sri Lanka',
        credit_eligible: false,
        credit_limit: '',
        guarantor: '',
        notes: '',
        phone_numbers: [],
    });

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">New Customer</span>}>
            <Head title="New Customer" />

            <div className="mb-4">
                <Link
                    href={route('customers.index')}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to customers
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <CustomerForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    submitLabel="Create"
                    onSubmit={() => post(route('customers.store'), { preserveScroll: true })}
                />
            </div>
        </AuthenticatedLayout>
    );
}

