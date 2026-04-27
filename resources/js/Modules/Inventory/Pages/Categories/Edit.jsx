import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import FormSelect from '@/Components/FormSelect';
import useToast from '@/feedback/useToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryModuleLayout from '@/Layouts/InventoryModuleLayout';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { Head, router, useForm } from '@inertiajs/react';

export default function Edit({ category }) {
    const toast = useToast();
    const form = useForm({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section={`Edit · ${category.name}`} />}>
            <Head title={`Edit ${category.name} · Inventory`} />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Product Categories', href: route('inventory.categories.index') },
                    { label: category.name, href: route('inventory.categories.show', category.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('inventory.categories.show', category.id)}
                        backLabel="← Back to category"
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.put(route('inventory.categories.update', category.id), {
                                    preserveScroll: true,
                                    onError: () => {
                                        scrollToFirstError();
                                        toast.error('Please fix the highlighted fields and try again.');
                                    },
                                });
                            }}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="category_code" value="Category code" />
                                    <input
                                        id="category_code"
                                        type="text"
                                        readOnly
                                        className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted"
                                        value={category.category_code}
                                    />
                                </div>
                                <div />
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="name" value="Name" />
                                    <input
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={form.errors.name} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        rows={4}
                                        className={`mt-1 ${formTextareaClass}`}
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.description} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <FormSelect
                                        id="status"
                                        className="mt-1"
                                        value={form.data.status}
                                        onChange={(status) => form.setData('status', status)}
                                        options={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' },
                                        ]}
                                    />
                                    <InputError className="mt-2" message={form.errors.status} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => router.get(route('inventory.categories.show', category.id))}
                                >
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={form.processing}>
                                    Save changes
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </InventoryModuleLayout>
        </AuthenticatedLayout>
    );
}
