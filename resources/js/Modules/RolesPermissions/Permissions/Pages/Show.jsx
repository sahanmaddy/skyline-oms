import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ permission, canEdit, canDelete }) {
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
                                            onClick={() => {
                                                if (confirm('Delete this permission?')) {
                                                    router.delete(route('settings.permissions.destroy', permission.id));
                                                }
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
                        <div className="text-lg font-semibold text-gray-900">{permission.display_name || permission.name}</div>
                        <div className="mt-1 text-sm text-gray-500">{permission.name}</div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Info label="Module" value={permission.module || 'General'} />
                            <Info label="Used by roles" value={String(permission.roles?.length || 0)} />
                            <Info label="System" value={permission.is_system ? 'Yes' : 'No'} />
                        </div>
                        <div className="mt-4 rounded-md border border-gray-200 p-3">
                            <div className="text-xs uppercase tracking-wide text-gray-500">Description</div>
                            <div className="mt-1 text-sm text-gray-800">{permission.description || '—'}</div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-900">Roles using this permission</div>
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
