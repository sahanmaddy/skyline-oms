import Dropdown from '@/Components/Dropdown';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InventoryModuleLayout from '@/Layouts/InventoryModuleLayout';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { Head, Link, router } from '@inertiajs/react';

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

export default function Index({ units, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section="Units of Measure" />}>
            <Head title="Units of Measure · Inventory" />
            <InventoryModuleLayout breadcrumbs={[{ label: 'Units of Measure' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="uom-search" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Search
                                </label>
                                <input
                                    id="uom-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('inventory.units.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Code, name, or symbol…"
                                />
                            </div>
                            <div>
                                <label htmlFor="uom-status" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Status
                                </label>
                                <FormSelect
                                    id="uom-status"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('inventory.units.index'),
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
                            <Link href={route('inventory.units.create')}>
                                <PrimaryButton type="button">New unit</PrimaryButton>
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
                                    Symbol
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Decimals
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Precision
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Status
                                </th>
                                <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                            {(units?.data || []).map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-cursor-raised/50">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                        {row.unit_code}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                        <span className="font-semibold">{row.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                        <span className="font-semibold">{row.symbol}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                        <span className="font-semibold">{row.allow_decimal ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                        <span className="font-semibold">{row.decimal_precision}</span>
                                    </td>
                                    <td className="px-4 py-3">{statusBadge(row.status)}</td>
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
                                                                href={route('inventory.units.show', row.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {row.can_edit ? (
                                                            <Link
                                                                href={route('inventory.units.edit', row.id)}
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
                                                                        title: 'Delete unit',
                                                                        message:
                                                                            'Are you sure you want to delete this unit of measure?',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('inventory.units.destroy', row.id));
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
                            {(units?.data || []).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-cursor-muted">
                                        No units found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {units?.links?.length > 3 ? (
                    <div className="flex flex-wrap gap-2">
                        {units.links.map((l) => (
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
