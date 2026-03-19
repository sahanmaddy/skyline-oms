import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function UserForm({
    data,
    setData,
    errors,
    processing,
    roles,
    statusOptions,
    submitLabel,
    showPasswordFields,
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

                <div>
                    <InputLabel htmlFor="role" value="Role" />
                    <select
                        id="role"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.role || ''}
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        <option value="">—</option>
                        {roles?.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.role} />
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

