import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import BranchForm from '@/Modules/Branches/Components/BranchForm';
import useToast from '@/feedback/useToast';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function Edit({ branch }) {
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultCountry = getCompanyDefaultCountry(company);
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name || '',
        address_line_1: branch.address_line_1 || '',
        address_line_2: branch.address_line_2 || '',
        city: branch.city || '',
        state_province: branch.state_province || '',
        postal_code: branch.postal_code || '',
        country: branch.country || defaultCountry,
        email: branch.email || '',
        phone_numbers: (branch.phone_numbers || []).map((p) => ({
            phone_type: p.phone_type,
            country_code: p.country_code,
            country_iso2: p.country_iso2 ?? null,
            phone_number: p.phone_number,
            is_primary: !!p.is_primary,
        })),
        is_active: Boolean(branch.is_active),
        notes: branch.notes || '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="Edit branch" />}>
            <Head title={`Edit ${branch.name} · Branches`} />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Branches', href: route('settings.branches.index') },
                    { label: branch.name, href: route('settings.branches.show', branch.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.branches.show', branch.id)}
                        backLabel="← Back to branch"
                    />

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <BranchForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            mode="edit"
                            branchCode={branch.code}
                            submitLabel="Update branch"
                            onCancel={() => router.get(route('settings.branches.show', branch.id))}
                            onClientValidationError={() =>
                                toast.error('Please fix the highlighted fields and try again.')
                            }
                            onSubmit={() =>
                                put(route('settings.branches.update', branch.id), {
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
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
