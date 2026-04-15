import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HrModuleLayout from '@/Layouts/HrModuleLayout';
import EmployeeForm from '@/Modules/Employees/Components/EmployeeForm';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { normalizeDateInputForForm } from '@/utils/employeeDates';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ employee, statusOptions, users, activeBranches }) {
    const company = usePage().props.company ?? {};
    const companyTz = company.time_zone || 'UTC';
    const defaultCountry = getCompanyDefaultCountry(company);
    const { data, setData, put, processing, errors } = useForm({
        branch_id: employee.branch_id ?? employee.branch?.id ?? '',
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
        joined_date: normalizeDateInputForForm(employee.joined_date, companyTz),
        date_of_birth: normalizeDateInputForForm(employee.date_of_birth, companyTz),
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
        country: employee.country || defaultCountry,
        bank_name: employee.bank_name || '',
        bank_branch: employee.bank_branch || '',
        bank_account_number: employee.bank_account_number || '',
        tin_number: employee.tin_number || '',
        epf_number: employee.epf_number || '',
        etf_number: employee.etf_number || '',
        emergency_contact_person: employee.emergency_contact_person || '',
        emergency_phone_numbers: (employee.emergency_phone_numbers || []).map((p) => ({
            phone_type: p.phone_type,
            country_code: p.country_code,
            country_iso2: p.country_iso2 ?? null,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
        user_id: employee.user_id || '',
        is_sales_commission_eligible: !!employee.is_sales_commission_eligible,
        profile_photo_path: employee.profile_photo_path || '',
        profile_photo: null,
        remove_profile_photo: false,
        phone_numbers: (employee.phone_numbers || []).map((p) => ({
            phone_type: p.phone_type,
            country_code: p.country_code,
            country_iso2: p.country_iso2 ?? null,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
    });

    return (
        <AuthenticatedLayout
            header={<ModuleStickyTitle module="Human Resource" section={`Edit · ${employee.display_name || 'Employee'}`} />}
        >
            <Head title={`Edit ${employee.display_name} · Human Resource`} />

            <HrModuleLayout
                breadcrumbs={[
                    { label: 'Employees', href: route('hr.employees.index') },
                    { label: employee.display_name || 'Employee', href: route('hr.employees.show', employee.id) },
                    { label: 'Edit' },
                ]}
            >
            <div className="flex flex-col gap-4">
                <ModuleDetailToolbar
                    backHref={route('hr.employees.show', employee.id)}
                    backLabel="← Back to employee"
                />

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <EmployeeForm
                    mode="edit"
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    statusOptions={statusOptions}
                    activeBranches={activeBranches}
                    users={users}
                    profilePhotoUrl={
                        employee.profile_photo_path
                            ? route('hr.employees.profilePhoto.view', employee.id)
                            : null
                    }
                    submitLabel="Save"
                    onSubmit={() =>
                        put(route('hr.employees.update', employee.id), {
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

