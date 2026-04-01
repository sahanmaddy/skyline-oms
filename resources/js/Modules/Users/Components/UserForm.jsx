import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useEffect, useMemo } from 'react';

export default function UserForm({
    data,
    setData,
    errors,
    processing,
    roles,
    statusOptions,
    activeBranches,
    employeesForLink,
    submitLabel,
    showPasswordFields,
    onSubmit,
}) {
    const employeesInBranch = useMemo(() => {
        if (!employeesForLink?.length) {
            return [];
        }
        if (!data.branch_id) {
            return employeesForLink;
        }
        return employeesForLink.filter((e) => e.branch_id === data.branch_id);
    }, [employeesForLink, data.branch_id]);

    useEffect(() => {
        if (!data.branch_id || !data.employee_id) {
            return;
        }
        const ok = employeesForLink?.some(
            (e) => e.id === data.employee_id && e.branch_id === data.branch_id,
        );
        if (!ok) {
            setData('employee_id', '');
        }
    }, [data.branch_id, data.employee_id, employeesForLink, setData]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name || ''}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email || ''}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel htmlFor="branch_id" value="Default branch" />
                    <select
                        id="branch_id"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-fg"
                        value={data.branch_id ?? ''}
                        onChange={(e) =>
                            setData(
                                'branch_id',
                                e.target.value === '' ? '' : Number(e.target.value),
                            )
                        }
                    >
                        <option value="">Select branch…</option>
                        {activeBranches?.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.code} — {b.name}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        The user&apos;s default branch for this application.
                    </p>
                    <InputError className="mt-2" message={errors.branch_id} />
                </div>

                <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <select
                        id="status"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.status || statusOptions?.[0] || 'active'}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        {statusOptions?.map((s) => (
                            <option key={s} value={s}>
                                {s === 'active' ? 'Active' : 'Inactive'}
                            </option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.status} />
                </div>

                <div>
                    <InputLabel htmlFor="employee_id" value="Linked employee" />
                    <select
                        id="employee_id"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.employee_id ?? ''}
                        onChange={(e) =>
                            setData(
                                'employee_id',
                                e.target.value === '' ? '' : Number(e.target.value),
                            )
                        }
                    >
                        <option value="">— Not linked —</option>
                        {employeesInBranch.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.employee_code} - {emp.display_name}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Each employee can only be linked to one user.
                    </p>
                    <InputError className="mt-2" message={errors.employee_id} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel value="Roles" />
                    <div className="mt-1 max-h-44 overflow-auto rounded-md border border-gray-300 p-2">
                        <div className="space-y-1.5">
                            {roles?.map((r) => {
                                const checked = (data.roles || []).includes(r);
                                return (
                                    <label
                                        key={r}
                                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={checked}
                                            onChange={(e) => {
                                                const next = new Set(data.roles || []);
                                                if (e.target.checked) next.add(r);
                                                else next.delete(r);
                                                setData('roles', Array.from(next));
                                            }}
                                        />
                                        <span>{r}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <InputError className="mt-2" message={errors.roles} />
                </div>

                {showPasswordFields && (
                    <>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password || ''}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            <InputError className="mt-2" message={errors.password} />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm password"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation || ''}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                autoComplete="new-password"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

