import { DetailFieldCard } from '@/Components/DetailFieldCard';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryModuleLayout from '@/Layouts/InventoryModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ category, canEdit, canDelete }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section={category.name} />}>
            <Head title={`${category.name} · Inventory`} />
            <InventoryModuleLayout
                breadcrumbs={[
                    { label: 'Product Categories', href: route('inventory.categories.index') },
                    { label: category.name },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('inventory.categories.index')}
                        backLabel="← Back to categories"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex items-center gap-2">
                                    {canEdit ? (
                                        <Link href={route('inventory.categories.edit', category.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete category',
                                                    message:
                                                        'Are you sure you want to delete this category? This cannot be undone.',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(route('inventory.categories.destroy', category.id));
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-cursor-bright">{category.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-cursor-muted">{category.category_code}</p>
                            </div>
                            <span
                                className={
                                    'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                    (category.status === 'active'
                                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800'
                                        : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-cursor-raised dark:text-cursor-muted dark:ring-cursor-border')
                                }
                            >
                                {category.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DetailFieldCard label="Description" value={category.description?.trim() || '—'} className="sm:col-span-2" />
                        </div>
                    </section>
                </div>
            </InventoryModuleLayout>
        </AuthenticatedLayout>
    );
}
