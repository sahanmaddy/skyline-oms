import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import PermissionGroupSelector from '@/Modules/RolesPermissions/Components/PermissionGroupSelector';
import { useMemo, useState } from 'react';

export default function RoleForm({
    data,
    setData,
    errors,
    processing,
    permissionGroups,
    submitLabel,
    onSubmit,
    onClientValidationError,
}) {
    const [clientErrors, setClientErrors] = useState({});
    const mergedErrors = useMemo(() => ({ ...clientErrors, ...errors }), [clientErrors, errors]);

    const validateBeforeSubmit = () => {
        const nextErrors = {};
        if (!String(data.name || '').trim()) {
            nextErrors.name = 'Role name is required.';
        }
        if (!String(data.description || '').trim()) {
            nextErrors.description = 'Description is required.';
        }
        setClientErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            scrollToFirstError();
            onClientValidationError?.();
        }
        return Object.keys(nextErrors).length === 0;
    };

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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Role Information</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Role identity and whether it is available for assignments.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Role Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => {
                                setClientErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.name;
                                    return next;
                                });
                                setData('name', e.target.value);
                            }}
                        />
                        <InputError className="mt-2" message={mergedErrors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="is_active" value="Status" />
                        <FormSelect
                            id="is_active"
                            className="mt-1"
                            value={data.is_active ? '1' : '0'}
                            onChange={(v) => setData('is_active', v === '1')}
                            options={[
                                { value: '1', label: 'Active' },
                                { value: '0', label: 'Inactive' },
                            ]}
                            placeholder="Select status..."
                        />
                        <InputError className="mt-2" message={mergedErrors.is_active} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            className={`${formTextareaClass} mt-1`}
                            rows={3}
                            value={data.description || ''}
                            onChange={(e) => {
                                setClientErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.description;
                                    return next;
                                });
                                setData('description', e.target.value);
                            }}
                        />
                        <InputError className="mt-2" message={mergedErrors.description} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Permission Assignment</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Choose the permissions this role should grant.
                </p>
                <div className="mt-4">
                    <PermissionGroupSelector
                        groups={permissionGroups}
                        selectedIds={data.permission_ids || []}
                        onChange={(next) => setData('permission_ids', next)}
                        error={mergedErrors.permission_ids}
                    />
                </div>
            </section>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
