import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function PermissionForm({
    data,
    setData,
    errors,
    processing,
    submitLabel,
    onSubmit,
    isSystemPermission = false,
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
                    <InputLabel htmlFor="name" value="Permission key" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        disabled={isSystemPermission}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="employees.view"
                    />
                    <p className="mt-1 text-xs text-gray-500">Use format: module.action</p>
                    <InputError className="mt-2" message={errors.name} />
                </div>
                <div>
                    <InputLabel htmlFor="module" value="Module / group" />
                    <TextInput
                        id="module"
                        className="mt-1 block w-full"
                        value={data.module}
                        onChange={(e) => setData('module', e.target.value)}
                        placeholder="Employees"
                    />
                    <InputError className="mt-2" message={errors.module} />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="display_name" value="Display name" />
                    <TextInput
                        id="display_name"
                        className="mt-1 block w-full"
                        value={data.display_name}
                        onChange={(e) => setData('display_name', e.target.value)}
                        placeholder="View employees"
                    />
                    <InputError className="mt-2" message={errors.display_name} />
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

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
