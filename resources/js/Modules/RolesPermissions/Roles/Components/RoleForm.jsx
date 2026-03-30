import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="name" value="Role name" />
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
                    <select
                        id="is_active"
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.is_active ? '1' : '0'}
                        onChange={(e) => setData('is_active', e.target.value === '1')}
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <InputError className="mt-2" message={errors.is_active} />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="description" value="Description" />
                    <textarea
                        id="description"
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                        value={data.description || ''}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.description} />
                </div>
            </div>

            <PermissionGroupSelector
                groups={permissionGroups}
                selectedIds={data.permission_ids || []}
                onChange={(next) => setData('permission_ids', next)}
                error={errors.permission_ids}
            />

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
