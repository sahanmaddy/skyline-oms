import Checkbox from '@/Components/Checkbox';
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

export default function Edit({ unit }) {
    const toast = useToast();
    const form = useForm({
        name: unit.name || '',
        symbol: unit.symbol || '',
        decimal_precision: unit.decimal_precision ?? 0,
        allow_decimal: Boolean(unit.allow_decimal),
        is_base_unit: Boolean(unit.is_base_unit),
        status: unit.status || 'active',
        description: unit.description || '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section={`Edit · ${unit.name}`} />}>
            <Head title={`Edit ${unit.name} · Inventory`} />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Units of Measure', href: route('inventory.units.index') },
                    { label: unit.name, href: route('inventory.units.show', unit.id) },
                    { label: 'Edit' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('inventory.units.show', unit.id)}
                        backLabel="← Back to unit"
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.put(route('inventory.units.update', unit.id), {
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
                                    <InputLabel htmlFor="unit_code" value="Unit code" />
                                    <input
                                        id="unit_code"
                                        readOnly
                                        className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted"
                                        value={unit.unit_code}
                                    />
                                </div>
                                <div />
                                <div>
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
                                <div>
                                    <InputLabel htmlFor="symbol" value="Symbol" />
                                    <input
                                        id="symbol"
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.symbol}
                                        onChange={(e) => form.setData('symbol', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={form.errors.symbol} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="decimal_precision" value="Decimal precision" />
                                    <input
                                        id="decimal_precision"
                                        type="number"
                                        min={0}
                                        max={6}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright"
                                        value={form.data.decimal_precision}
                                        onChange={(e) => form.setData('decimal_precision', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={form.errors.decimal_precision} />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Checkbox
                                        id="allow_decimal"
                                        checked={Boolean(form.data.allow_decimal)}
                                        onChange={(e) => form.setData('allow_decimal', e.target.checked)}
                                    />
                                    <InputLabel htmlFor="allow_decimal" value="Allow decimals" className="!mb-0" />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Checkbox
                                        id="is_base_unit"
                                        checked={Boolean(form.data.is_base_unit)}
                                        onChange={(e) => form.setData('is_base_unit', e.target.checked)}
                                    />
                                    <InputLabel htmlFor="is_base_unit" value="Base unit" className="!mb-0" />
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
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className={`mt-1 ${formTextareaClass}`}
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={form.errors.description} />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => router.get(route('inventory.units.show', unit.id))}
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
