import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SalesModuleLayout from '@/Layouts/SalesModuleLayout';
import CustomerForm from '@/Modules/Customers/Components/CustomerForm';
import useToast from '@/feedback/useToast';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ customer, statusOptions }) {
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultCountry = getCompanyDefaultCountry(company);
    const form = useForm({
        customer_code: customer.customer_code || '',
        display_name: customer.display_name || customer.customer_name || '',
        customer_name: customer.customer_name || '',
        company_name: customer.company_name || '',
        nic: customer.nic || '',
        vat_number: customer.vat_number || '',
        tin_number: customer.tin_number || '',
        email: customer.email || '',
        status: customer.status || statusOptions?.[0] || 'active',
        address_line_1: customer.address_line_1 || '',
        address_line_2: customer.address_line_2 || '',
        city: customer.city || '',
        country: customer.country || defaultCountry,
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
            country_iso2: p.country_iso2 ?? null,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
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
    const { data, setData, put, processing, errors } = form;

    return (
        <AuthenticatedLayout
            header={
                <ModuleStickyTitle
                    module="Sales"
                    section={`Edit · ${customer.display_name || customer.customer_name || 'Customer'}`}
                />
            }
        >
            <Head title={`Edit ${customer.display_name || customer.customer_name || 'customer'} · Sales`} />

            <SalesModuleLayout
                breadcrumbs={[
                    { label: 'Customers', href: route('sales.customers.index') },
                    {
                        label: customer.display_name || customer.customer_name || 'Customer',
                        href: route('sales.customers.show', customer.id),
                    },
                    { label: 'Edit' },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('sales.customers.show', customer.id)}
                    backLabel="← Back to customer"
                />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <CustomerForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    submitLabel="Save"
                    onSubmit={() =>
                        put(route('sales.customers.update', customer.id), {
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

