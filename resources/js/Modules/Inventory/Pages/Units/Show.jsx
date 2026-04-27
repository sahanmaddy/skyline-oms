import { DetailFieldCard } from '@/Components/DetailFieldCard';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryModuleLayout from '@/Layouts/InventoryModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ unit, canEdit, canDelete }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section={unit.name} />}>
            <Head title={`${unit.name} · Inventory`} />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Units of Measure', href: route('inventory.units.index') },
                    { label: unit.name },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('inventory.units.index')}
                        backLabel="← Back to units"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex items-center gap-2">
                                    {canEdit ? (
                                        <Link href={route('inventory.units.edit', unit.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete unit',
                                                    message: 'Are you sure you want to delete this unit?',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(route('inventory.units.destroy', unit.id));
                                            }}
                                        >
                                            Delete
                                        </DangerButton>
                                    ) : null}
                                </div>
                            ) : undefined
                        }
                    />
                    <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-cursor-bright">{unit.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-cursor-muted">
                                    {unit.unit_code} · {unit.symbol}
                                </p>
                            </div>
                            <span
                                className={
                                    'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                    (unit.status === 'active'
                                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800'
                                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-cursor-raised dark:text-cursor-muted dark:ring-cursor-border')
                                }
                            >
                                {unit.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailFieldCard
                                label="Decimals"
                                value={unit.allow_decimal ? 'Allowed' : 'Not allowed'}
                            />
                            <DetailFieldCard label="Decimal precision" value={String(unit.decimal_precision)} />
                            <DetailFieldCard label="Base unit" value={unit.is_base_unit ? 'Yes' : 'No'} />
                            <DetailFieldCard label="System unit" value={unit.is_system ? 'Yes' : 'No'} />
                            <DetailFieldCard label="Description" value={unit.description?.trim() || '—'} className="sm:col-span-2" />
                        </div>
                    </section>
                </div>
            </InventoryModuleLayout>
        </AuthenticatedLayout>
    );
}
