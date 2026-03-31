import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import Dropdown from '@/Components/Dropdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ permissions, filters, moduleOptions, canCreate }) {
    const { confirm } = useConfirm();
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Permissions" />}>
            <Head title="Permissions · Settings" />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Permissions' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Search</label>
                                <input
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.q || ''}
                                    onChange={(e) => router.get(route('settings.permissions.index'), { ...filters, q: e.target.value }, { preserveState: true, replace: true })}
                                    placeholder="Search key, label, description..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Module</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters?.module || ''}
                                    onChange={(e) => router.get(route('settings.permissions.index'), { ...filters, module: e.target.value }, { preserveState: true, replace: true })}
                                >
                                    <option value="">All</option>
                                    {(moduleOptions || []).map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('settings.permissions.create')}>
                                <PrimaryButton type="button">New permission</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-[32%] px-4 py-3 text-left">Permission</th>
                                <th className="w-[32%] px-4 py-3 text-left">Description</th>
                                <th className="w-[20%] px-4 py-3 text-left">Module</th>
                                <th className="w-[8%] px-4 py-3 text-left">Roles</th>
                                <th className="w-[8%] whitespace-nowrap px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {permissions.data.map((permission) => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {permission.display_name || permission.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{permission.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {permission.description ? (
                                            <span className="line-clamp-2">{permission.description}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">No description</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{permission.module || 'General'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{permission.roles_count}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                        {permission.can_view || permission.can_edit || permission.can_delete ? (
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
                                                        {permission.can_view ? (
                                                            <Link
                                                                href={route('settings.permissions.show', permission.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                View
                                                            </Link>
                                                        ) : null}
                                                        {permission.can_edit ? (
                                                            <Link
                                                                href={route('settings.permissions.edit', permission.id)}
                                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </Link>
                                                        ) : null}
                                                        {permission.can_delete ? (
                                                            <button
                                                                type="button"
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                                                onClick={async () => {
                                                                    const ok = await confirm({
                                                                        title: 'Delete permission',
                                                                        message:
                                                                            'Are you sure you want to delete this permission? This action cannot be undone.',
                                                                        confirmText: 'Delete',
                                                                        variant: 'destructive',
                                                                    });
                                                                    if (!ok) return;
                                                                    router.delete(route('settings.permissions.destroy', permission.id));
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

                {permissions.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {permissions.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.url || '#'}
                                preserveScroll
                                className={
                                    'rounded-md border px-3 py-1 text-sm ' +
                                    (link.active
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50') +
                                    (link.url ? '' : ' pointer-events-none opacity-50')
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
