import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import PermissionGroupSelector from '@/Modules/RolesPermissions/Components/PermissionGroupSelector';

export default function RoleForm({
    data,
    setData,
    errors,
    processing,
    permissionGroups,
    submitLabel,
    onSubmit,
}) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
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
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.name} />
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
                        />
                        <InputError className="mt-2" message={errors.is_active} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            className={`${formTextareaClass} mt-1`}
                            rows={3}
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.description} />
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
                        error={errors.permission_ids}
                    />
                </div>
            </section>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
