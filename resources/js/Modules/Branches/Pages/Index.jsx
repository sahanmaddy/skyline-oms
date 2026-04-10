import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

function renderPhoneList(phoneNumbers, max = 3) {
    const phones = phoneNumbers || [];
    if (!phones.length) {
        return <span className="text-gray-500">—</span>;
    }

    const shown = phones.slice(0, max);
    const remaining = phones.length - shown.length;

    return (
        <>
            {shown.map((p) => (
                <div key={p.id} className="leading-5">
                    {p.phone_type ? `${p.phone_type}: ` : ''}
                    {[p.country_code, p.phone_number].filter(Boolean).join(' ')}
                </div>
            ))}
            {remaining > 0 ? (
                <div className="leading-5 text-gray-400">+{remaining} more</div>
            ) : null}
        </>
    );
}

export default function Index({ branches, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="Branches" />}>
            <Head title="Branches" />

            <SettingsModuleLayout breadcrumbs={[{ label: 'Branches' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label htmlFor="branches-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="branches-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('settings.branches.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search by code, name, city, or phone…"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="branches-status-filter"
                                    className="text-xs font-medium text-gray-600"
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

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Branch
                                </th>
                                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Location
                                </th>
                                <th className="w-[24%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Contact
                                </th>
                                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Team
                                </th>
                                <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Status
                                </th>
                                <th className="w-16 whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {branches.data.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="min-w-0 px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">{b.name}</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            <span className="font-mono font-medium text-gray-700">{b.code}</span>
                                        </div>
                                    </td>
                                    <td className="min-w-0 px-4 py-3 text-sm text-gray-700">
                                        {b.city || b.country ? (
                                            <>
                                                <div className="font-medium text-gray-900">
                                                    {b.city || '—'}
                                                </div>
                                                <div className="mt-0.5 text-xs text-gray-500">
                                                    {b.country || '—'}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="min-w-0 px-4 py-3 text-sm text-gray-700">
                                        <div className="break-words text-xs text-gray-500">
                                            {b.email ? `E-mail: ${b.email}` : 'E-mail: —'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {renderPhoneList(b.phone_numbers, 10)}
                                        </div>
                                    </td>
                                    <td className="min-w-0 px-4 py-3">
                                        <div className="text-sm text-gray-900">
                                            Users: {b.users_count ?? 0}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Employees: {b.employees_count ?? 0}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={
                                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' +
                                                    (b.is_active
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-700')
                                                }
                                            >
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {b.can_view || b.can_edit || b.can_delete ? (
                                            <div className="relative z-50 flex items-center justify-end">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                            aria-label="More actions"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>

                                                    <Dropdown.Content align="right" width="48">
                                                        {b.can_view ? (
                                                            <Link
                                                                href={route('settings.branches.show', b.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {b.can_edit ? (
                                                            <Link
                                                                href={route('settings.branches.edit', b.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {b.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete branch',
                                                                        message:
                                                                            'Are you sure you want to delete this branch? This action cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(
                                                                        route('settings.branches.destroy', b.id),
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

                            {branches.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            No branches found
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Try adjusting your search or status filter.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {branches.links?.length > 3 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {branches.links.map((l) => (
                            <Link
                                key={l.label}
                                href={l.url || '#'}
                                preserveScroll
                                className={
                                    'rounded-md border px-3 py-1 text-sm ' +
                                    (l.active
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50') +
                                    (l.url ? '' : ' pointer-events-none opacity-50')
                                }
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </div>
                )}
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
