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

export default function Index({
    attributeTypes,
    attributeValues,
    typeOptions,
    filters,
    statusOptions,
    canCreateType,
    canCreateValue,
}) {
    const { confirm } = useConfirm();

    const valueCreateHref =
        filters?.value_type_id && String(filters.value_type_id) !== ''
            ? `${route('inventory.attribute-values.create')}?type_id=${encodeURIComponent(filters.value_type_id)}`
            : route('inventory.attribute-values.create');

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Inventory" section="Product Attributes" />}>
            <Head title="Product Attributes · Inventory" />
            <InventoryModuleLayout breadcrumbs={[{ label: 'Product Attributes' }]}>
                <ModuleListToolbar
                    actionsAbove
                    heading="Attribute types"
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="type-q" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Search types
                                </label>
                                <input
                                    id="type-q"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.type_q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('inventory.attributes.index'),
                                            { ...filters, type_q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Code or name…"
                                />
                            </div>
                            <div>
                                <label htmlFor="type-status" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Type status
                                </label>
                                <FormSelect
                                    id="type-status"
                                    className="mt-1"
                                    value={filters?.type_status || ''}
                                    onChange={(type_status) =>
                                        router.get(
                                            route('inventory.attributes.index'),
                                            { ...filters, type_status },
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
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreateType ? (
                            <Link href={route('inventory.attribute-types.create')}>
                                <PrimaryButton type="button">New attribute type</PrimaryButton>
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
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Values
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Sort
                                        </th>
                                        <th className="w-24 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                                    {(attributeTypes?.data || []).map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-cursor-raised/50">
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                                {row.code}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.name}</span>
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.values_count ?? 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.sort_order ?? '—'}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                {row.can_edit || row.can_delete ? (
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
                                                                {row.can_edit ? (
                                                                    <Link
                                                                        href={route('inventory.attribute-types.edit', row.id)}
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
                                                                                title: 'Delete attribute type',
                                                                                message:
                                                                                    'Delete this type? All values must be removed first.',
                                                                                confirmText: 'Delete',
                                                                                variant: 'destructive',
                                                                            });
                                                                            if (!ok) return;
                                                                            router.delete(
                                                                                route('inventory.attribute-types.destroy', row.id),
                                                                            );
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
                                    {(attributeTypes?.data || []).length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-sm text-gray-500 dark:text-cursor-muted"
                                            >
                                                No attribute types found.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                    </table>
                </div>

                {attributeTypes?.links?.length > 3 ? (
                    <div className="flex flex-wrap gap-2">
                        {attributeTypes.links.map((l) => (
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

                <ModuleListToolbar
                    actionsAbove
                    heading="Attribute values"
                    filtersWrapClassName="w-full max-w-none md:grid-cols-3 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="value-q" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Search values
                                </label>
                                <input
                                    id="value-q"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.value_q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('inventory.attributes.index'),
                                            { ...filters, value_q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Code or value…"
                                />
                            </div>
                            <div>
                                <label htmlFor="value-type" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Attribute type
                                </label>
                                <FormSelect
                                    id="value-type"
                                    className="mt-1"
                                    value={filters?.value_type_id === '' ? '' : String(filters?.value_type_id)}
                                    onChange={(value_type_id) =>
                                        router.get(
                                            route('inventory.attributes.index'),
                                            { ...filters, value_type_id: value_type_id || '' },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All types' },
                                        ...(typeOptions || []).map((t) => ({
                                            value: String(t.id),
                                            label: `${t.name} (${t.code})`,
                                        })),
                                    ]}
                                />
                            </div>
                            <div>
                                <label htmlFor="value-status" className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Value status
                                </label>
                                <FormSelect
                                    id="value-status"
                                    className="mt-1"
                                    value={filters?.value_status || ''}
                                    onChange={(value_status) =>
                                        router.get(
                                            route('inventory.attributes.index'),
                                            { ...filters, value_status },
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
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreateValue ? (
                            <Link href={valueCreateHref}>
                                <PrimaryButton type="button">New attribute value</PrimaryButton>
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
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Value
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Display
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Sort
                                        </th>
                                        <th className="w-24 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                                    {(attributeValues?.data || []).map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-cursor-raised/50">
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                                {row.code}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.attribute_type?.name ?? '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.value}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.display_value || row.value}</span>
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-cursor-muted">
                                                <span className="font-semibold">{row.sort_order ?? '—'}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                {row.can_edit || row.can_delete ? (
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
                                                                {row.can_edit ? (
                                                                    <Link
                                                                        href={route('inventory.attribute-values.edit', row.id)}
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
                                                                                title: 'Delete value',
                                                                                message: 'Delete this attribute value?',
                                                                                confirmText: 'Delete',
                                                                                variant: 'destructive',
                                                                            });
                                                                            if (!ok) return;
                                                                            router.delete(
                                                                                route('inventory.attribute-values.destroy', row.id),
                                                                            );
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
                                    {(attributeValues?.data || []).length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-sm text-gray-500 dark:text-cursor-muted"
                                            >
                                                No attribute values found.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                    </table>
                </div>

                {attributeValues?.links?.length > 3 ? (
                    <div className="flex flex-wrap gap-2">
                        {attributeValues.links.map((l) => (
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
