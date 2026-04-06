import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ user, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    const roles = user.roles || [];
    const assignedBranches = user.assigned_branches || [];
    const emp = user.employee;
    const linkedLine =
        emp
            ? [emp.employee_code, emp.display_name].filter(Boolean).join(' - ')
            : null;

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="User" />}>
            <Head title={`${user.name} · Users · Settings`} />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Users', href: route('settings.users.index') },
                    { label: user.name },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.users.index')}
                        backLabel="← Back to users"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex items-center gap-2">
                                    {canEdit ? (
                                        <Link href={route('settings.users.edit', user.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete user',
                                                    message:
                                                        'Are you sure you want to delete this user? This action cannot be undone.',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(route('settings.users.destroy', user.id));
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
                        <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Roles
                                </div>
                                <div className="mt-2 flex min-h-6 items-center">
                                    <div className="flex flex-wrap gap-1.5">
                                        {roles.length > 0 ? (
                                            roles.map((role) => (
                                                <span
                                                    key={role.id ?? role.name}
                                                    className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                                                >
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Info
                                label="Status"
                                value={user.status === 'active' ? 'Active' : 'Inactive'}
                                badge={
                                    user.status === 'active'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                }
                            />
                            <div className="rounded-md border border-gray-200 bg-white p-3 sm:col-span-2">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Branch access
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {assignedBranches.length > 0 ? (
                                        assignedBranches.map((b) => (
                                            <span
                                                key={b.id}
                                                className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800"
                                            >
                                                <span className="font-mono text-slate-600">{b.code}</span>
                                                <span className="text-slate-400"> — </span>
                                                {b.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">—</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Default branch
                                </div>
                                <div className="mt-2 text-sm font-medium text-gray-900">
                                    {user.branch ? (
                                        <>
                                            <span className="font-mono text-xs text-gray-600">{user.branch.code}</span>
                                            <span className="text-gray-500"> — </span>
                                            {user.branch.name}
                                        </>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Linked employee
                                </div>
                                <div className="mt-2 flex min-h-6 items-center text-sm font-medium text-gray-900">
                                    {linkedLine ? (
                                        <Link
                                            href={route('hr.employees.show', emp.id)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            {linkedLine}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-400">Not linked</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}

function Info({ label, value, badge }) {
    if (badge) {
        return (
            <div className="rounded-md border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {label}
                </div>
                <div className="mt-2 flex min-h-6 items-center">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badge}`}
                    >
                        {value}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900">{value}</div>
        </div>
    );
}
