import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import BranchForm from '@/Modules/Branches/Components/BranchForm';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ nextCode }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        country: 'Sri Lanka',
        email: '',
        phone_numbers: [],
        is_active: true,
        notes: '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="New branch" />}>
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
                            onSubmit={() => post(route('settings.branches.store'))}
                        />
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
