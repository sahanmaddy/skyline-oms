import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import BranchForm from '@/Modules/Branches/Components/BranchForm';
import useToast from '@/feedback/useToast';
import { getCompanyDefaultCountry } from '@/lib/companyLocationDefaults';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm, usePage } from '@inertiajs/react';

export default function Create({ nextCode }) {
    const toast = useToast();
    const company = usePage().props.company ?? {};
    const defaultCountry = getCompanyDefaultCountry(company);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: defaultCountry,
        email: '',
        phone_numbers: [],
        is_active: true,
        notes: '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="Create Branch" />}>
            <Head title="New branch · Branches" />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Branches', href: route('settings.branches.index') },
                    { label: 'New branch' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.branches.index')}
                        backLabel="← Back to branches"
                    />

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <BranchForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            mode="create"
                            nextCode={nextCode}
                            submitLabel="Create branch"
                            onCancel={() => router.get(route('settings.branches.index'))}
                            onClientValidationError={() =>
                                toast.error('Please fix the highlighted fields and try again.')
                            }
                            onSubmit={() =>
                                post(route('settings.branches.store'), {
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
