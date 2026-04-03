import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import BranchForm from '@/Modules/Branches/Components/BranchForm';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ branch }) {
    const { data, setData, put, processing, errors } = useForm({
        name: branch.name || '',
        address_line_1: branch.address_line_1 || '',
        address_line_2: branch.address_line_2 || '',
        city: branch.city || '',
        country: branch.country || 'Sri Lanka',
        phone: branch.phone || '',
        email: branch.email || '',
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
                        <div className="mb-4 text-sm text-gray-600 dark:text-cursor-muted">
                            Code: <span className="font-mono font-semibold text-gray-900 dark:text-cursor-bright">{branch.code}</span>
                        </div>
                        <BranchForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            mode="edit"
                            submitLabel="Save changes"
                            onSubmit={() =>
                                put(route('settings.branches.update', branch.id), { preserveScroll: true })
                            }
                        />
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
