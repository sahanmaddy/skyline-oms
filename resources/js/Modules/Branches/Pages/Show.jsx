import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

function Info({ label, children }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-bg">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">{label}</div>
            <div className="mt-2 text-sm text-gray-900 dark:text-cursor-bright">{children}</div>
        </div>
    );
}

export default function Show({ branch, recentUsers, recentEmployees, canEdit, canDelete }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Branches" section="Branch" />}>
            <Head title={`${branch.name} · Branches`} />

            <SettingsModuleLayout
                breadcrumbs={[
                    { label: 'Branches', href: route('settings.branches.index') },
                    { label: branch.name },
                ]}
            >
                <div className="flex flex-col gap-4">
                    <ModuleDetailToolbar
                        backHref={route('settings.branches.index')}
                        backLabel="← Back to branches"
                        actions={
                            canEdit || canDelete ? (
                                <div className="flex items-center gap-2">
                                    {canEdit ? (
                                        <Link href={route('settings.branches.edit', branch.id)}>
                                            <PrimaryButton type="button">Edit</PrimaryButton>
                                        </Link>
                                    ) : null}
                                    {canDelete ? (
                                        <DangerButton
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: 'Delete branch',
                                                    message:
                                                        'Are you sure you want to delete this branch? This cannot be undone.',
                                                    confirmText: 'Delete',
                                                    variant: 'destructive',
                                                });
                                                if (!ok) return;
                                                router.delete(route('settings.branches.destroy', branch.id));
                                            }}
                                        >
                                            Delete
                                        </DangerButton>
                                    ) : null}
                                </div>
                            ) : undefined
                        }
                    />

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="font-mono text-sm text-gray-500 dark:text-cursor-muted">{branch.code}</div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-cursor-bright">{branch.name}</h1>
                            </div>
                            <span
                                className={
                                    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ' +
                                    (branch.is_active
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-cursor-raised dark:text-cursor-muted')
                                }
                            >
                                {branch.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Info label="Phone">{branch.phone || '—'}</Info>
                            <Info label="Email">{branch.email || '—'}</Info>
                            <Info label="City">{branch.city || '—'}</Info>
                            <Info label="Country">{branch.country || '—'}</Info>
                            <Info label="Address">
                                {[branch.address_line_1, branch.address_line_2].filter(Boolean).join(', ') || '—'}
                            </Info>
                        </div>

                        {branch.notes ? (
                            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-fg">
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                    Notes
                                </div>
                                <p className="mt-2 whitespace-pre-wrap">{branch.notes}</p>
                            </div>
                        ) : null}

                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    Users ({branch.users_count ?? 0})
                                </h2>
                                <ul className="mt-2 divide-y divide-gray-200 dark:divide-cursor-border">
                                    {(recentUsers || []).length === 0 ? (
                                        <li className="py-2 text-sm text-gray-500 dark:text-cursor-muted">None</li>
                                    ) : (
                                        recentUsers.map((u) => (
                                            <li key={u.id} className="flex justify-between gap-2 py-2 text-sm">
                                                <Link
                                                    href={route('settings.users.show', u.id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-cursor-accent-soft"
                                                >
                                                    {u.name}
                                                </Link>
                                                <span className="text-gray-500 dark:text-cursor-muted">{u.status}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    Employees ({branch.employees_count ?? 0})
                                </h2>
                                <ul className="mt-2 divide-y divide-gray-200 dark:divide-cursor-border">
                                    {(recentEmployees || []).length === 0 ? (
                                        <li className="py-2 text-sm text-gray-500 dark:text-cursor-muted">None</li>
                                    ) : (
                                        recentEmployees.map((e) => (
                                            <li key={e.id} className="flex justify-between gap-2 py-2 text-sm">
                                                <Link
                                                    href={route('hr.employees.show', e.id)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-cursor-accent-soft"
                                                >
                                                    {e.employee_code} — {e.display_name}
                                                </Link>
                                                <span className="text-gray-500 dark:text-cursor-muted">{e.status}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
