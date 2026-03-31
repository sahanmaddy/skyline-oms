import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import CustomerForm from '@/Modules/Customers/Components/CustomerForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ statusOptions, nextCustomerCode }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_code: nextCustomerCode || '',
        display_name: '',
        customer_name: '',
        company_name: '',
        nic: '',
        vat_number: '',
        tin_number: '',
        email: '',
        status: statusOptions?.[0] ?? 'active',
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: 'Sri Lanka',
        credit_eligible: false,
        credit_limit: '',
        guarantor: '',
        notes: '',
        phone_numbers: [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Sales" section="Create customer" />}>
            <Head title="Create customer · Sales" />

            <SalesModuleLayout
                breadcrumbs={[
                    { label: 'Customers', href: route('sales.customers.index') },
                    { label: 'Create customer' },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('sales.customers.index')}
                    backLabel="← Back to customers"
                />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <CustomerForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    submitLabel="Create"
                    onSubmit={() => post(route('sales.customers.store'), { preserveScroll: true })}
                />
            </div>
            </div>
            </SalesModuleLayout>
        </AuthenticatedLayout>
    );
}

