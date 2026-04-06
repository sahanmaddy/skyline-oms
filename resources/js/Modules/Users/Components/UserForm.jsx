import FormSelect from '@/Components/FormSelect';
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
    const branchOptions = useMemo(
        () =>
            (activeBranches || []).filter(
                (b) => b.is_active === undefined || b.is_active === true,
            ),
        [activeBranches],
    );

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

    const branchIds = useMemo(() => data.branch_ids ?? [], [data.branch_ids]);

    useEffect(() => {
        if (!branchIds.length) {
            if (data.branch_id) {
                setData('branch_id', '');
            }
            return;
        }
        if (!branchIds.includes(data.branch_id)) {
            setData('branch_id', branchIds[0]);
        }
    }, [branchIds, data.branch_id, setData]);

    function toggleBranchAccess(branchId, checked) {
        const next = new Set(branchIds);
        if (checked) {
            next.add(branchId);
        } else {
            next.delete(branchId);
        }
        const arr = Array.from(next).sort((a, b) => a - b);
        setData('branch_ids', arr);
        if (arr.length && !arr.includes(data.branch_id)) {
            setData('branch_id', arr[0]);
        }
        if (!arr.length) {
            setData('branch_id', '');
        }
    }

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
                    <InputLabel value="Branch access" />
                    <div className="mt-1 max-h-44 overflow-auto rounded-md border border-gray-300 p-2 dark:border-cursor-border">
                        <div className="space-y-1.5">
                            {branchOptions.map((b) => {
                                const checked = branchIds.includes(b.id);
                                return (
                                    <label
                                        key={b.id}
                                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50 dark:hover:bg-cursor-elevated"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={checked}
                                            onChange={(e) =>
                                                toggleBranchAccess(b.id, e.target.checked)
                                            }
                                        />
                                        <span>
                                            <span className="font-mono text-xs text-gray-600 dark:text-cursor-muted">
                                                {b.code}
                                            </span>
                                            <span className="text-gray-500"> — </span>
                                            {b.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        This user can switch the app context among these branches (active branches
                        only).
                    </p>
                    <InputError className="mt-2" message={errors.branch_ids} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel htmlFor="branch_id" value="Default branch" />
                    <FormSelect
                        id="branch_id"
                        className="mt-1"
                        value={data.branch_id ?? ''}
                        onChange={(v) => setData('branch_id', v === '' ? '' : Number(v))}
                        options={[
                            { value: '', label: 'Select branch…' },
                            ...branchOptions
                                .filter((b) => branchIds.includes(b.id))
                                .map((b) => ({
                                    value: b.id,
                                    label: `${b.code} — ${b.name}`,
                                })),
                        ]}
                        placeholder="Select branch…"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        Default home branch (must be one of the branches above).
                    </p>
                    <InputError className="mt-2" message={errors.branch_id} />
                </div>

                <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <FormSelect
                        id="status"
                        className="mt-1"
                        value={data.status || statusOptions?.[0] || 'active'}
                        onChange={(v) => setData('status', v)}
                        options={
                            statusOptions?.map((s) => ({
                                value: s,
                                label: s === 'active' ? 'Active' : 'Inactive',
                            })) ?? []
                        }
                    />
                    <InputError className="mt-2" message={errors.status} />
                </div>

                <div>
                    <InputLabel htmlFor="employee_id" value="Linked employee" />
                    <FormSelect
                        id="employee_id"
                        className="mt-1"
                        value={data.employee_id === '' || data.employee_id == null ? '' : data.employee_id}
                        onChange={(v) => setData('employee_id', v === '' ? '' : Number(v))}
                        options={[
                            { value: '', label: '— Not linked —' },
                            ...employeesInBranch.map((emp) => ({
                                value: emp.id,
                                label: `${emp.employee_code} - ${emp.display_name}`,
                            })),
                        ]}
                        placeholder="— Not linked —"
                    />
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
