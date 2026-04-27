import Dropdown from '@/Components/Dropdown';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryModuleLayout from '@/Layouts/InventoryModuleLayout';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { formatCompanyDate } from '@/lib/companyFormat';
import { Head, Link, router, usePage } from '@inertiajs/react';

function statusBadge(status) {
    const active = status === 'active';
    return (
        <span
            className={
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                (active
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-cursor-raised dark:text-cursor-muted')
            }
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

export default function Index({ categories, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();
    const company = usePage().props.company ?? {};

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section="Product Categories" />}>
            <Head title="Product Categories · Inventory" />
            <InventoryModuleLayout breadcrumbs={[{ label: 'Product Categories' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="cat-search" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Search
                                </label>
                                <input
                                    id="cat-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('inventory.categories.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search code, name, description, or status…"
                                />
                            </div>
                            <div>
                                <label htmlFor="cat-status" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Status
                                </label>
                                <FormSelect
                                    id="cat-status"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('inventory.categories.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All' },
                                        ...(statusOptions?.map((s) => ({
                                            value: s,
                                            label: s === 'active' ? 'Active' : 'Inactive',
                                        })) ?? []),
                                    ]}
                                    placeholder="All"
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('inventory.categories.create')}>
                                <PrimaryButton type="button">New category</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-cursor-border">
                        <thead className="bg-gray-50 dark:bg-cursor-raised">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Created
                                </th>
                                <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                            {(categories?.data || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-cursor-raised/50">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        {row.category_code}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-cursor-bright">{row.name}</td>
                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600 dark:text-cursor-fg">
                                        {row.description || '—'}
                                    </td>
                                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-cursor-fg">
                                        {formatCompanyDate(row.created_at, company) || '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {row.can_view || row.can_edit || row.can_delete ? (
                                            <div className="relative z-50 flex justify-end">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-muted dark:hover:bg-cursor-raised"
                                                            aria-label="More actions"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        {row.can_view ? (
                                                            <Link
                                                                href={route('inventory.categories.show', row.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {row.can_edit ? (
                                                            <Link
                                                                href={route('inventory.categories.edit', row.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {row.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete category',
                                                                        message:
                                                                            'Are you sure you want to delete this category? This cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('inventory.categories.destroy', row.id));
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        ) : null}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(categories?.data || []).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-cursor-muted">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {categories?.links?.length > 3 ? (
                    <div className="flex flex-wrap gap-2">
                        {categories.links.map((l) => (
                            <Link
                                key={l.label}
                                href={l.url || '#'}
                                preserveScroll
                                className={
                                    'rounded-md border px-3 py-1 text-sm ' +
                                    (l.active
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-cursor-accent dark:bg-cursor-raised dark:text-cursor-bright'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised') +
                                    (l.url ? '' : ' pointer-events-none opacity-50')
                                }
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </div>
                ) : null}
            </InventoryModuleLayout>
        </AuthenticatedLayout>
    );
}
