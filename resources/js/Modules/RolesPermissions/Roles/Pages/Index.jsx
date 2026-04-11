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

export default function Index({ roles, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Roles" />}>
            <Head title="Roles · Settings" />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Roles' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Search</label>
                                <input
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) => router.get(route('settings.roles.index'), { ...filters, q: e.target.value }, { preserveState: true, replace: true })}
                                    placeholder="Search role or description..."
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="roles-status-filter"
                                    className="text-xs font-medium text-gray-600"
                                >
                                    Status
                                </label>
                                <FormSelect
                                    id="roles-status-filter"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('settings.roles.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All' },
                                        ...statusOptions.map((s) => ({
                                            value: s,
                                            label: s === 'active' ? 'Active' : 'Inactive',
                                        })),
                                    ]}
                                    placeholder="All"
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('settings.roles.create')}>
                                <PrimaryButton type="button">New role</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[46%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Role
                                </th>
                                <th className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Permissions
                                </th>
                                <th className="w-[14%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Users
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
                            {roles.data.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="min-w-0 px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                                        <div className="break-words text-xs text-gray-500">
                                            {role.description || '—'}
                                        </div>
                                    </td>
                                    <td className="min-w-0 px-4 py-3 text-sm text-gray-700">
                                        {role.permissions_count}
                                    </td>
                                    <td className="min-w-0 px-4 py-3 text-sm text-gray-700">{role.users_count}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${role.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {role.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {role.can_view || role.can_edit || role.can_delete ? (
                                            <div className="relative z-50 flex items-center justify-end">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                            aria-label="More actions"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        {role.can_view ? (
                                                            <Link href={route('settings.roles.show', role.id)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100">View</Link>
                                                        ) : null}
                                                        {role.can_edit ? (
                                                            <Link href={route('settings.roles.edit', role.id)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100">Edit</Link>
                                                        ) : null}
                                                        {role.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete role',
                                                                        message:
                                                                            'Are you sure you want to delete this role? This action cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('settings.roles.destroy', role.id));
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
                        </tbody>
                    </table>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
