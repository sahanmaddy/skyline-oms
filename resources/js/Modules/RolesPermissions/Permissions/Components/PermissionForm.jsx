import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';

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
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Permission Information</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Define the permission key, grouping, and user-facing name.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Permission Key" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            disabled={isSystemPermission}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. employees.view"
                        />
                        <p className="mt-1 text-xs text-gray-500">Use format: module.action</p>
                        <InputError className="mt-2" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="module" value="Module / Group" />
                        <TextInput
                            id="module"
                            className="mt-1 block w-full"
                            value={data.module}
                            onChange={(e) => setData('module', e.target.value)}
                            placeholder="e.g. Employees"
                        />
                        <InputError className="mt-2" message={errors.module} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="display_name" value="Display Name" />
                        <TextInput
                            id="display_name"
                            className="mt-1 block w-full"
                            value={data.display_name}
                            onChange={(e) => setData('display_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.display_name} />
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

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
