import Dropdown from '@/Components/Dropdown';
import DangerButton from '@/Components/DangerButton';
import ModuleDetailToolbar from '@/Components/ModuleDetailToolbar';
import PrimaryButton from '@/Components/PrimaryButton';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import useConfirm from '@/feedback/useConfirm';
import { Head, Link, router } from '@inertiajs/react';

function Info({ label, value, className = '', valueClassName = '' }) {
    return (
        <div
            className={`rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-bg ${className}`}
        >
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                {label}
            </div>
            <div
                className={`mt-1 text-sm font-medium text-gray-900 dark:text-cursor-bright ${valueClassName}`}
            >
                {value}
            </div>
        </div>
    );
}

export default function Show({ branch, recentUsers, recentEmployees, canEdit, canDelete }) {
    const { confirm } = useConfirm();
    const headerName = branch.name?.trim() || '—';
    const headerCode = branch.code?.trim() || '—';
    /** Plain subtitle like employee row typography; code only so the title line isn’t repeated. */
    const headerSubtitle = headerCode !== '—' ? headerCode : '—';

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

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface lg:col-span-12">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-cursor-bright">
                                        {headerName}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-cursor-muted">
                                        {headerSubtitle}
                                    </div>
                                </div>
                                <span
                                    className={
                                        'shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                                        (branch.is_active
                                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800'
                                            : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-cursor-raised dark:text-cursor-muted dark:ring-cursor-border')
                                    }
                                >
                                    {branch.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Info
                                    label="Branch Code"
                                    value={branch.code || '—'}
                                    valueClassName="font-mono text-xs text-gray-800 dark:text-cursor-bright"
                                />
                                <Info label="Branch Name" value={branch.name || '—'} />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface lg:col-span-8">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Address</h3>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Info
                                    label="Address"
                                    value={
                                        [branch.address_line_1, branch.address_line_2]
                                            .filter(Boolean)
                                            .join(', ') || '—'
                                    }
                                    className="sm:col-span-2"
                                />
                                <Info label="City/District" value={branch.city || '—'} />
                                <Info label="Country" value={branch.country || '—'} />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface lg:col-span-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                Contact Information
                            </h3>
                            <div className="mt-4 space-y-3">
                                <Info label="Email" value={branch.email || '—'} />
                                <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-bg">
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                                        Phone Numbers
                                    </div>
                                    <div className="mt-2 space-y-2">
                                        {branch.phone_numbers?.length ? (
                                            branch.phone_numbers.map((phone) => (
                                                <div
                                                    key={phone.id}
                                                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-cursor-border dark:bg-cursor-raised"
                                                >
                                                    <div className="flex items-center justify-between gap-3 text-sm">
                                                        <div className="font-medium text-gray-900 dark:text-cursor-bright">
                                                            {phone.phone_type}
                                                        </div>
                                                        <div className="font-medium text-gray-900 dark:text-cursor-bright">
                                                            {[phone.country_code, phone.phone_number]
                                                                .filter(Boolean)
                                                                .join(' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-500 dark:text-cursor-muted">
                                                No phone numbers.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {branch.notes ? (
                            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-cursor-border dark:bg-cursor-surface lg:col-span-12">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    Notes
                                </h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-cursor-bright">
                                    {branch.notes}
                                </p>
                            </section>
                        ) : null}

                        <div className="grid grid-cols-1 gap-4 lg:col-span-12 lg:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                                <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    Users ({branch.users_count ?? 0})
                                </div>
                                <div className="mt-2 space-y-2">
                                    {(recentUsers || []).length ? (
                                        recentUsers.map((u) => (
                                            <div
                                                key={u.id}
                                                className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-cursor-border dark:bg-cursor-bg/40"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-cursor-bright">
                                                        {u.name}
                                                    </div>
                                                    <div className="truncate text-xs text-gray-500 dark:text-cursor-muted">
                                                        {u.email || '—'}
                                                    </div>
                                                </div>
                                                <div className="relative z-10 flex shrink-0 items-center gap-2">
                                                    <span
                                                        className={
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                            (u.status === 'active'
                                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-cursor-raised dark:text-cursor-muted')
                                                        }
                                                    >
                                                        {u.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                                aria-label="User actions"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                                </svg>
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content align="right" width="48">
                                                            <Dropdown.Link
                                                                href={route('settings.users.show', u.id)}
                                                            >
                                                                View
                                                            </Dropdown.Link>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-cursor-muted">
                                            No users in this branch.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface">
                                <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    Employees ({branch.employees_count ?? 0})
                                </div>
                                <div className="mt-2 space-y-2">
                                    {(recentEmployees || []).length ? (
                                        recentEmployees.map((e) => (
                                            <div
                                                key={e.id}
                                                className="flex items-center justify-between gap-3 rounded-md border border-gray-100 px-3 py-2 dark:border-cursor-border dark:bg-cursor-bg/40"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-cursor-bright">
                                                        {e.display_name}
                                                    </div>
                                                    <div className="truncate font-mono text-xs text-gray-500 dark:text-cursor-muted">
                                                        {e.employee_code || '—'}
                                                    </div>
                                                </div>
                                                <div className="relative z-10 flex shrink-0 items-center gap-2">
                                                    <span
                                                        className={
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ' +
                                                            (e.status === 'active'
                                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-cursor-raised dark:text-cursor-muted')
                                                        }
                                                    >
                                                        {e.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised"
                                                                aria-label="Employee actions"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                                                                </svg>
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content align="right" width="48">
                                                            <Dropdown.Link href={route('hr.employees.show', e.id)}>
                                                                View
                                                            </Dropdown.Link>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-cursor-muted">
                                            No employees in this branch.
                                        </div>
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
