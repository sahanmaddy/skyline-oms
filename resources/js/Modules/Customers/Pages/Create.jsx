import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import CustomerForm from '@/Modules/Customers/Components/CustomerForm';
import useToast from '@/feedback/useToast';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function Create({ statusOptions, nextCustomerCode }) {
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultCountry = getCompanyDefaultCountry(company);
    const form = useForm({
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
        state_province: '',
        postal_code: '',
        country: defaultCountry,
        credit_eligible: false,
        credit_limit: '',
        guarantor: '',
        notes: '',
        phone_numbers: [],
    });
    form.transform((payload) => ({
        ...payload,
        phone_numbers: (payload.phone_numbers || []).filter(
            (row) =>
                row &&
                [row.phone_type, row.country_code, row.phone_number].some(
                    (value) => String(value || '').trim() !== '',
                ),
        ),
    }));
    const { data, setData, post, processing, errors } = form;

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Sales" section="Create Customer" />}>
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
                    submitLabel="Create customer"
                    onCancel={() => router.get(route('sales.customers.index'))}
                    onSubmit={() =>
                        post(route('sales.customers.store'), {
                            preserveScroll: true,
                            onError: () => {
                                scrollToFirstError();
                                toast.error('Please fix the highlighted fields and try again.');
                            },
                        })
                    }
                />
            </div>
            </div>
            </SalesModuleLayout>
        </AuthenticatedLayout>
    );
}

