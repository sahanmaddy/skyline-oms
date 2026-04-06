import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

function PaginationLinks({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((l) => (
                <Link
                    key={`${l.label}-${l.url}`}
                    href={l.url || '#'}
                    preserveScroll
                    className={
                        'rounded-md border px-3 py-1 text-sm ' +
                        (l.active
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-cursor-accent/40 dark:bg-cursor-accent/15 dark:text-cursor-accent-soft'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised') +
                        (l.url ? '' : ' pointer-events-none opacity-50')
                    }
                    dangerouslySetInnerHTML={{ __html: l.label }}
                />
            ))}
        </div>
    );
}

export default function Index({ branches, filters, statusOptions, canCreate }) {
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="Branches" />}>
            <Head title="Branches" />

            <SettingsModuleLayout breadcrumbs={[{ label: 'Branches' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-cursor-muted">
                                    Search
                                </label>
                                <input
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('settings.branches.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Code, name, or city…"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="branches-status-filter"
                                    className="text-xs font-medium text-gray-600 dark:text-cursor-muted"
                                >
                                    Status
                                </label>
                                <FormSelect
                                    id="branches-status-filter"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('settings.branches.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={(statusOptions || []).map((o) => ({
                                        value: o.value,
                                        label: o.label,
                                    }))}
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('settings.branches.create')}>
                                <PrimaryButton type="button">New branch</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                    <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-cursor-border">
                        <thead className="bg-gray-50 dark:bg-cursor-raised/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    City
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Users
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Employees
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-cursor-border">
                            {branches.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-sm text-gray-500 dark:text-cursor-muted"
                                    >
                                        No branches found.
                                    </td>
                                </tr>
                            ) : (
                                branches.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-cursor-raised/40">
                                        <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-cursor-bright">
                                            {b.code}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                            {b.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-cursor-fg">
                                            {b.city || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-cursor-fg">
                                            {b.phone || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    'inline-flex rounded-full px-2 py-1 text-xs font-medium ' +
                                                    (b.is_active
                                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-cursor-raised dark:text-cursor-muted')
                                                }
                                            >
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                            {b.users_count ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-cursor-fg">
                                            {b.employees_count ?? 0}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                    >
                                                        Actions
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    {b.can_view ? (
                                                        <Dropdown.Link href={route('settings.branches.show', b.id)}>
                                                            View
                                                        </Dropdown.Link>
                                                    ) : null}
                                                    {b.can_edit ? (
                                                        <Dropdown.Link href={route('settings.branches.edit', b.id)}>
                                                            Edit
                                                        </Dropdown.Link>
                                                    ) : null}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <PaginationLinks links={branches.links} />
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
