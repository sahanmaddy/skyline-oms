import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomerForm from '@/Modules/Customers/Components/CustomerForm';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ customer, statusOptions }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_code: customer.customer_code || '',
        display_name: customer.display_name || customer.customer_name || '',
        customer_name: customer.customer_name || '',
        company_name: customer.company_name || '',
        nic: customer.nic || '',
        vat_tax_number: customer.vat_tax_number || '',
        email: customer.email || '',
        status: customer.status || statusOptions?.[0] || 'active',
        address_line_1: customer.address_line_1 || '',
        address_line_2: customer.address_line_2 || '',
        city: customer.city || '',
        country: customer.country || 'Sri Lanka',
        credit_eligible: !!customer.credit_eligible,
        credit_limit:
            customer.credit_limit !== null && customer.credit_limit !== undefined
                ? String(customer.credit_limit)
                : '',
        guarantor: customer.guarantor || '',
        notes: customer.notes || '',
        phone_numbers: (customer.phone_numbers || []).map((p) => ({
            phone_type: p.phone_type,
            country_code: p.country_code,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
    });

    return (
        <AuthenticatedLayout header={<span className="text-base font-semibold">Edit Customer</span>}>
            <Head title="Edit Customer" />

            <div className="mb-4">
                <Link
                    href={route('customers.show', customer.id)}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    ← Back to customer
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <CustomerForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    submitLabel="Save"
                    onSubmit={() =>
                        put(route('customers.update', customer.id), { preserveScroll: true })
                    }
                />
            </div>
        </AuthenticatedLayout>
    );
}

