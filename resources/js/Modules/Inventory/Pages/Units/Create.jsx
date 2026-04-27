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

export default function Create() {
    const toast = useToast();
    const form = useForm({
        name: '',
        symbol: '',
        decimal_precision: 2,
        allow_decimal: true,
        is_base_unit: false,
        status: 'active',
        description: '',
    });

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section="New unit" />}>
            <Head title="New unit · Inventory" />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Units of Measure', href: route('inventory.units.index') },
                    { label: 'New' },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar backHref={route('inventory.units.index')} backLabel="← Back to units" />
                    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post(route('inventory.units.store'), {
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
                                <SecondaryButton type="button" onClick={() => router.get(route('inventory.units.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={form.processing}>
                                    Create unit
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </InventoryModuleLayout>
        </AuthenticatedLayout>
    );
}
