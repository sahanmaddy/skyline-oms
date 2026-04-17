import FormSelect from '@/Components/FormSelect';
import LinkedEmployeeCombobox from '@/Components/LinkedEmployeeCombobox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { useEffect, useMemo, useState } from 'react';

function normId(v) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
}

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
    requirePassword = false,
    onSubmit,
    onClientValidationError,
}) {
    const [clientErrors, setClientErrors] = useState({});
    const branchOptions = useMemo(
        () =>
            (activeBranches || []).filter(
                (b) => b.is_active === undefined || b.is_active === true,
            ),
        [activeBranches],
    );

    const employeesList = useMemo(() => {
        const raw = employeesForLink;
        if (!raw) {
            return [];
        }
        return Array.isArray(raw) ? raw : Object.values(raw);
    }, [employeesForLink]);

    const branchIdsNorm = useMemo(
        () =>
            [...new Set((data.branch_ids ?? []).map((id) => normId(id)).filter(Boolean))].sort(
                (a, b) => a - b,
            ),
        [data.branch_ids],
    );

    const homeBranchId = normId(data.branch_id);
    const mergedErrors = useMemo(() => ({ ...clientErrors, ...errors }), [clientErrors, errors]);

    const employeesInBranch = useMemo(() => {
        if (!employeesList.length) {
            return [];
        }
        // Offer linkable employees in any branch the user has access to (not only the current
        // default). Server still requires employee.branch_id === default branch_id on save.
        if (branchIdsNorm.length === 0) {
            return employeesList;
        }
        return employeesList.filter((e) => branchIdsNorm.includes(Number(e.branch_id)));
    }, [employeesList, branchIdsNorm]);

    useEffect(() => {
        if (!homeBranchId || !data.employee_id) {
            return;
        }
        const empId = normId(data.employee_id);
        const ok = employeesList.some(
            (e) => Number(e.id) === empId && Number(e.branch_id) === homeBranchId,
        );
        if (!ok) {
            setData('employee_id', '');
        }
    }, [homeBranchId, data.employee_id, employeesList, setData]);

    useEffect(() => {
        if (!data.employee_id) {
            return;
        }
        const emp = employeesList.find((e) => Number(e.id) === Number(data.employee_id));
        if (!emp) {
            setData('employee_id', '');
            return;
        }
        const eb = normId(emp.branch_id);
        if (branchIdsNorm.length > 0 && eb !== null && !branchIdsNorm.includes(eb)) {
            setData('employee_id', '');
        }
    }, [branchIdsNorm, data.employee_id, employeesList, setData]);

    useEffect(() => {
        if (!branchIdsNorm.length) {
            if (data.branch_id) {
                setData('branch_id', '');
            }
            return;
        }
        if (!branchIdsNorm.includes(homeBranchId)) {
            setData('branch_id', branchIdsNorm[0]);
        }
    }, [branchIdsNorm, homeBranchId, data.branch_id, setData]);

    function toggleBranchAccess(branchId, checked) {
        const id = normId(branchId);
        if (!id) {
            return;
        }
        const next = new Set(branchIdsNorm);
        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }
        const arr = Array.from(next).sort((a, b) => a - b);
        setData('branch_ids', arr);
        const nextHome = normId(data.branch_id);
        if (arr.length && !arr.includes(nextHome)) {
            setData('branch_id', arr[0]);
        }
        if (!arr.length) {
            setData('branch_id', '');
        }
        setClientErrors((prev) => {
            const nextErrors = { ...prev };
            delete nextErrors.branch_ids;
            delete nextErrors.branch_id;
            return nextErrors;
        });
    }

    const validateBeforeSubmit = () => {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!String(data.name || '').trim()) nextErrors.name = 'Name is required.';
        if (!String(data.email || '').trim()) nextErrors.email = 'Email is required.';
        else if (!emailRegex.test(String(data.email || '').trim())) {
            nextErrors.email = 'Enter a valid email address.';
        }
        if (!String(data.status || '').trim()) nextErrors.status = 'Status is required.';
        if (!Array.isArray(data.branch_ids) || data.branch_ids.length === 0) {
            nextErrors.branch_ids = 'At least one branch access is required.';
        }
        if (!data.branch_id) nextErrors.branch_id = 'Default Branch is required.';
        if (!Array.isArray(data.roles) || data.roles.length === 0) {
            nextErrors.roles = 'At least one role is required.';
        }
        if (requirePassword && showPasswordFields) {
            const pw = String(data.password || '');
            const pwc = String(data.password_confirmation || '');
            if (!pw) nextErrors.password = 'Password is required.';
            else if (pw.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
            if (!pwc) nextErrors.password_confirmation = 'Confirm Password is required.';
            else if (pw !== pwc) nextErrors.password = 'Passwords do not match.';
        }

        setClientErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            scrollToFirstError();
            onClientValidationError?.();
        }

        return Object.keys(nextErrors).length === 0;
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!validateBeforeSubmit()) {
                    return;
                }
                onSubmit();
            }}
            className="space-y-6"
            noValidate
        >
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">User Information</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Core account details, branch access scope, and linked employee.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name || ''}
                            onChange={(e) => {
                                setClientErrors((prev) => {
                                    const nextErrors = { ...prev };
                                    delete nextErrors.name;
                                    return nextErrors;
                                });
                                setData('name', e.target.value);
                            }}
                        />
                        <InputError className="mt-2" message={mergedErrors.name} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email || ''}
                            onChange={(e) => {
                                setClientErrors((prev) => {
                                    const nextErrors = { ...prev };
                                    delete nextErrors.email;
                                    return nextErrors;
                                });
                                setData('email', e.target.value);
                            }}
                        />
                        <InputError className="mt-2" message={mergedErrors.email} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel value="Branch Access" />
                        <div className="mt-1 max-h-44 overflow-auto rounded-md border border-gray-300 p-2 dark:border-cursor-border">
                            <div className="space-y-1.5">
                                {branchOptions.map((b) => {
                                    const bid = normId(b.id);
                                    const checked = bid !== null && branchIdsNorm.includes(bid);
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
                                                    toggleBranchAccess(bid, e.target.checked)
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
                        <InputError className="mt-2" message={mergedErrors.branch_ids} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="branch_id" value="Default Branch" />
                        <FormSelect
                            id="branch_id"
                            className="mt-1"
                            value={data.branch_id ?? ''}
                            onChange={(v) => {
                                setClientErrors((prev) => {
                                    const nextErrors = { ...prev };
                                    delete nextErrors.branch_id;
                                    return nextErrors;
                                });
                                setData('branch_id', v === '' ? '' : Number(v));
                            }}
                            options={[
                                { value: '', label: 'Select Branch…' },
                                ...branchOptions
                                    .filter((b) => {
                                        const bid = normId(b.id);
                                        return bid !== null && branchIdsNorm.includes(bid);
                                    })
                                    .map((b) => ({
                                        value: b.id,
                                        label: `${b.code} — ${b.name}`,
                                    })),
                            ]}
                            placeholder="Select Branch…"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                            Default home branch (must be one of the branches above).
                        </p>
                        <InputError className="mt-2" message={mergedErrors.branch_id} />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Status" />
                        <FormSelect
                            id="status"
                            className="mt-1"
                            value={data.status || statusOptions?.[0] || 'active'}
                            onChange={(v) => {
                                setClientErrors((prev) => {
                                    const nextErrors = { ...prev };
                                    delete nextErrors.status;
                                    return nextErrors;
                                });
                                setData('status', v);
                            }}
                            options={
                                statusOptions?.map((s) => ({
                                    value: s,
                                    label: s === 'active' ? 'Active' : 'Inactive',
                                })) ?? []
                            }
                            placeholder="Select status..."
                        />
                        <InputError className="mt-2" message={mergedErrors.status} />
                    </div>

                    <div>
                        <InputLabel htmlFor="employee_id" value="Linked Employee (Optional)" />
                        <LinkedEmployeeCombobox
                            id="employee_id"
                            className="mt-1"
                            value={data.employee_id}
                            employees={employeesInBranch}
                            onChange={(emp) => {
                                if (!emp) {
                                    setClientErrors((prev) => {
                                        const nextErrors = { ...prev };
                                        delete nextErrors.employee_id;
                                        return nextErrors;
                                    });
                                    setData('employee_id', '');
                                    return;
                                }
                                const eb = normId(emp.branch_id);
                                setClientErrors((prev) => {
                                    const nextErrors = { ...prev };
                                    delete nextErrors.employee_id;
                                    return nextErrors;
                                });
                                setData((prev) => ({
                                    ...prev,
                                    employee_id: Number(emp.id),
                                    ...(eb !== null && branchIdsNorm.includes(eb) ? { branch_id: eb } : {}),
                                }));
                            }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Each employee can only be linked to one user.
                        </p>
                        <InputError className="mt-2" message={mergedErrors.employee_id} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Role Assignment</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Select one or more roles to control user permissions.
                </p>
                <div className="mt-4">
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
                                                setClientErrors((prev) => {
                                                    const nextErrors = { ...prev };
                                                    delete nextErrors.roles;
                                                    return nextErrors;
                                                });
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
                    <InputError className="mt-2" message={mergedErrors.roles} />
                </div>
            </section>

            {showPasswordFields && (
                <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Password Setup</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        Set the initial password for this user account.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password || ''}
                                onChange={(e) => {
                                    setClientErrors((prev) => {
                                        const nextErrors = { ...prev };
                                        delete nextErrors.password;
                                        delete nextErrors.password_confirmation;
                                        return nextErrors;
                                    });
                                    setData('password', e.target.value);
                                }}
                                autoComplete="new-password"
                            />
                            <InputError className="mt-2" message={mergedErrors.password} />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation || ''}
                                onChange={(e) => {
                                    setClientErrors((prev) => {
                                        const nextErrors = { ...prev };
                                        delete nextErrors.password;
                                        delete nextErrors.password_confirmation;
                                        return nextErrors;
                                    });
                                    setData('password_confirmation', e.target.value);
                                }}
                                autoComplete="new-password"
                            />
                            <InputError
                                className="mt-2"
                                message={mergedErrors.password_confirmation}
                            />
                        </div>
                    </div>
                </section>
            )}

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
