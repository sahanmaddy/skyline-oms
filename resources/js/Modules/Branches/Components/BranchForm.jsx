import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function BranchForm({
    data,
    setData,
    errors,
    processing,
    mode = 'create',
    nextCode,
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
            {mode === 'create' && nextCode ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-fg">
                    <span className="font-medium text-gray-900 dark:text-cursor-bright">Branch code:</span>{' '}
                    <span className="font-mono">{nextCode}</span>
                    <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                        The code is generated automatically when you save.
                    </p>
                </div>
            ) : null}

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

                <div>
                    <InputLabel htmlFor="address_line_1" value="Address line 1" />
                    <TextInput
                        id="address_line_1"
                        className="mt-1 block w-full"
                        value={data.address_line_1 || ''}
                        onChange={(e) => setData('address_line_1', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.address_line_1} />
                </div>

                <div>
                    <InputLabel htmlFor="address_line_2" value="Address line 2" />
                    <TextInput
                        id="address_line_2"
                        className="mt-1 block w-full"
                        value={data.address_line_2 || ''}
                        onChange={(e) => setData('address_line_2', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.address_line_2} />
                </div>

                <div>
                    <InputLabel htmlFor="city" value="City" />
                    <TextInput
                        id="city"
                        className="mt-1 block w-full"
                        value={data.city || ''}
                        onChange={(e) => setData('city', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.city} />
                </div>

                <div>
                    <InputLabel htmlFor="country" value="Country" />
                    <TextInput
                        id="country"
                        className="mt-1 block w-full"
                        value={data.country || 'Sri Lanka'}
                        onChange={(e) => setData('country', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.country} />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                        id="phone"
                        className="mt-1 block w-full"
                        value={data.phone || ''}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div>
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
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            checked={Boolean(data.is_active)}
                            onChange={(e) => setData('is_active', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 dark:text-cursor-fg">Active</span>
                    </label>
                    <InputError className="mt-2" message={errors.is_active} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel htmlFor="notes" value="Notes" />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-fg"
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>
            </div>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
