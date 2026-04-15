import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HrModuleLayout from '@/Layouts/HrModuleLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create({ statusOptions, users, nextEmployeeCode, activeBranches, suggestedBranchId }) {
    const company = usePage().props.company ?? {};
    const defaultCountry = getCompanyDefaultCountry(company);
    const defaultBranchId =
        suggestedBranchId && activeBranches?.some((b) => b.id === suggestedBranchId)
            ? suggestedBranchId
            : (activeBranches?.[0]?.id ?? '');
    const { data, setData, post, processing, errors } = useForm({
        branch_id: defaultBranchId,
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
        country: defaultCountry,
        bank_name: '',
        bank_branch: '',
        bank_account_number: '',
        tin_number: '',
        epf_number: '',
        etf_number: '',
        emergency_contact_person: '',
        emergency_phone_numbers: [],
        user_id: '',
        is_sales_commission_eligible: false,
        profile_photo_path: '',
        profile_photo: null,
        remove_profile_photo: false,
        phone_numbers: [],
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Human Resource" section="Create employee" />}>
            <Head title="Create employee · Human Resource" />

            <HrModuleLayout
                breadcrumbs={[
                    { label: 'Employees', href: route('hr.employees.index') },
                    { label: 'Create employee' },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('hr.employees.index')}
                    backLabel="← Back to employees"
                />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <EmployeeForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    activeBranches={activeBranches}
                    users={users}
                    profilePhotoUrl={null}
                    submitLabel="Create"
                    onSubmit={() =>
                        post(route('hr.employees.store'), {
                            forceFormData: true,
                            preserveScroll: true,
                        })
                    }
                />
            </div>
            </div>
            </HrModuleLayout>
        </AuthenticatedLayout>
    );
}

