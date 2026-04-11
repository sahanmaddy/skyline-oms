import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ permission, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Permission" />}>
            <Head title={`${permission.name} · Permissions · Settings`} />
            <SettingsModuleLayout breadcrumbs={[{ label: 'Permissions', href: route('settings.permissions.index') }, { label: permission.name }]}>
                <div className="space-y-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.permissions.index')}
                        backLabel="← Back to permissions"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex gap-2">
                                    {canEdit ? (
                                        <Link href={route('settings.permissions.edit', permission.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
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
                                        </DangerButton>
                                    ) : null}
                                </div>
                            ) : undefined
                        }
                    />
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="text-lg font-semibold text-gray-900">
                                    {permission.display_name || permission.name}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">{permission.name}</div>
                            </div>
                            <span
                                className={
                                    'shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                    (permission.is_system
                                        ? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
                                        : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200')
                                }
                            >
                                {permission.is_system ? 'System' : 'Custom'}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Info label="Module" value={permission.module || 'General'} />
                            <Info label="Used By Roles" value={String(permission.roles?.length || 0)} />
                        </div>
                        <div className="mt-4 rounded-md border border-gray-200 p-3">
                            <div className="text-xs uppercase tracking-wide text-gray-500">Description</div>
                            <div className="mt-1 text-sm text-gray-800">{permission.description || '—'}</div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-900">Roles Using This Permission</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {(permission.roles || []).length ? (
                                permission.roles.map((role) => (
                                    <Link
                                        key={role.id}
                                        href={route('settings.roles.show', role.id)}
                                        className="inline-flex rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                    >
                                        {role.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500">No roles assigned.</div>
                            )}
                        </div>
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-md border border-gray-200 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
        </div>
    );
}
