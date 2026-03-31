import Dropdown from '@/Components/Dropdown';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ role, assignedUsers, permissionsGrouped, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Role" />}>
            <Head title={`${role.name} · Roles · Settings`} />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Roles', href: route('settings.roles.index') }, { label: role.name }]}>
                <div className="space-y-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.roles.index')}
                        backLabel="← Back to roles"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex gap-2">
                                    {canEdit ? (
                                        <Link href={route('settings.roles.edit', role.id)}><PrimaryButton type="button">Edit</PrimaryButton></Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
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
                                        </DangerButton>
                                    ) : null}
                                </div>
                            ) : undefined
                        }
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-lg font-semibold text-gray-900">{role.name}</div>
                        <div className="mt-1 text-sm text-gray-600">{role.description || '—'}</div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Info label="Status" value={role.is_active ? 'Active' : 'Inactive'} />
                            <Info label="Permissions" value={String(role.permissions?.length || 0)} />
                            <Info label="Users" value={String(role.users?.length || 0)} />
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-900">Assigned permissions</div>
                        <div className="mt-3 space-y-3">
                            {Object.keys(permissionsGrouped || {}).map((module) => (
                                <div key={module}>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{module}</div>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {(permissionsGrouped[module] || []).map((permission) => (
                                            <span key={permission.id} className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{permission.display_name || permission.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-900">Assigned users</div>
                        <div className="mt-2 space-y-2">
                            {(assignedUsers || []).length ? (
                                assignedUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="truncate text-xs text-gray-500">{user.email}</div>
                                        </div>
                                        {user.can_view ? (
                                            <div className="relative z-10 shrink-0">
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button
                                                            type="button"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                            aria-label="User actions"
                                                        >
                                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        <Dropdown.Link href={route('settings.users.show', user.id)}>View</Dropdown.Link>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        ) : null}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">No users assigned.</div>
                            )}
                        </div>
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}

function Info({ label, value }) {
    return <div className="rounded-md border border-gray-200 p-3"><div className="text-xs uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 text-sm font-semibold text-gray-900">{value}</div></div>;
}
