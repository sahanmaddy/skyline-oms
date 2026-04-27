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

export default function ValueEdit({ attributeValue, typeOptions }) {
    const toast = useToast();
    const form = useForm({
        product_attribute_type_id: String(attributeValue.product_attribute_type_id),
        value: attributeValue.value || '',
        display_value: attributeValue.display_value || '',
        description: attributeValue.description || '',
        status: attributeValue.status || 'active',
        sort_order: attributeValue.sort_order ?? '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section={`Edit value · ${attributeValue.value}`} />}>
            <Head title={`Edit value · Inventory`} />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Product Attributes', href: route('inventory.attributes.index') },
                    { label: `Edit · ${attributeValue.value}` },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('inventory.attributes.index')}
                        backLabel="← Back to attributes"
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.put(route('inventory.attribute-values.update', attributeValue.id), {
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
                                    <InputLabel htmlFor="code" value="Code" />
                                    <input
                                        id="code"
                                        readOnly
                                        className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted"
                                        value={attributeValue.code}
                                    />
                                </div>
                                <div />
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="product_attribute_type_id" value="Attribute type" />
                                    <FormSelect
                                        id="product_attribute_type_id"
                                        className="mt-1"
                                        value={form.data.product_attribute_type_id}
                                        onChange={(v) => form.setData('product_attribute_type_id', v)}
                                        options={(typeOptions || []).map((t) => ({
                                            value: String(t.id),
                                            label: `${t.name} (${t.code})`,
                                        }))}
                                    />
                                    <InputError className="mt-2" message={form.errors.product_attribute_type_id} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="value" value="Value" />
                                    <input
                                        id="value"
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.value}
                                        onChange={(e) => form.setData('value', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={form.errors.value} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="display_value" value="Display value" />
                                    <input
                                        id="display_value"
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.display_value}
                                        onChange={(e) => form.setData('display_value', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.display_value} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        rows={2}
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
                                <div>
                                    <InputLabel htmlFor="sort_order" value="Sort order" />
                                    <input
                                        id="sort_order"
                                        type="number"
                                        min={0}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.sort_order} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton type="button" onClick={() => router.get(route('inventory.attributes.index'))}>
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
