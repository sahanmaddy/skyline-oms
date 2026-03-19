import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import CountryCallingCodeCombobox from '@/Components/CountryCallingCodeCombobox';
import CountryCombobox from '@/Components/CountryCombobox';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { countries } from '@/data/countries';
import { departments } from '@/data/departments';
import { useEffect, useMemo, useState } from 'react';

export default function EmployeeForm({
    data,
    setData,
    errors,
    processing,
    statusOptions,
    users,
    submitLabel,
    onSubmit,
}) {
    const [displayNameTouched, setDisplayNameTouched] = useState(false);

    useEffect(() => {
        const first = (data.first_name || '').trim();
        const last = (data.last_name || '').trim();
        const auto = `${first} ${last}`.trim();

        if (!displayNameTouched && auto && data.display_name !== auto) {
            setData('display_name', auto);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.first_name, data.last_name]);

    const phoneRows = useMemo(() => data.phone_numbers || [], [data.phone_numbers]);

    const addPhone = () => {
        setData('phone_numbers', [
            ...phoneRows,
            {
                phone_type: 'Mobile',
                country_code: '+94',
                phone_number: '',
                is_primary: phoneRows.length === 0,
            },
        ]);
    };

    const removePhone = (idx) => {
        const next = phoneRows.filter((_, i) => i !== idx);
        setData('phone_numbers', next);
    };

    const updatePhone = (idx, patch) => {
        const next = phoneRows.map((row, i) => (i === idx ? { ...row, ...patch } : row));
        setData('phone_numbers', next);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Employee Information</h3>
                <p className="mt-1 text-xs text-gray-500">Core identity and basic profile details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="employee_code" value="Employee Code" />
                        <TextInput
                            id="employee_code"
                            className="mt-1 block w-full"
                            value={data.employee_code || 'Auto-generated'}
                            disabled
                        />
                        <div className="mt-2 text-xs text-gray-500">
                            Employee code is assigned automatically when you create the employee.
                        </div>
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
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.status} />
                    </div>

                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            className="mt-1 block w-full"
                            value={data.first_name || ''}
                            onChange={(e) => setData('first_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.first_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            className="mt-1 block w-full"
                            value={data.last_name || ''}
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.last_name} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="display_name" value="Display Name" />
                        <TextInput
                            id="display_name"
                            className="mt-1 block w-full"
                            value={data.display_name || ''}
                            onChange={(e) => {
                                setDisplayNameTouched(true);
                                setData('display_name', e.target.value);
                            }}
                        />
                        <InputError className="mt-2" message={errors.display_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="nic" value="NIC" />
                        <TextInput
                            id="nic"
                            className="mt-1 block w-full"
                            value={data.nic || ''}
                            onChange={(e) => setData('nic', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.nic} />
                    </div>

                    <div>
                        <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                        <TextInput
                            id="date_of_birth"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.date_of_birth || ''}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.date_of_birth} />
                    </div>

                    <div>
                        <InputLabel htmlFor="user_id" value="Linked User (optional)" />
                        <select
                            id="user_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.user_id || ''}
                            onChange={(e) =>
                                setData('user_id', e.target.value ? Number(e.target.value) : '')
                            }
                        >
                            <option value="">—</option>
                            {users?.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.user_id} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Employment Information</h3>
                <p className="mt-1 text-xs text-gray-500">Role-related and organizational details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="designation" value="Designation" />
                        <TextInput
                            id="designation"
                            className="mt-1 block w-full"
                            value={data.designation || ''}
                            onChange={(e) => setData('designation', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.designation} />
                    </div>

                    <div>
                        <InputLabel htmlFor="department" value="Department" />
                        <select
                            id="department"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.department || ''}
                            onChange={(e) => setData('department', e.target.value)}
                        >
                            <option value="">—</option>
                            {departments.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.department} />
                    </div>

                    <div>
                        <InputLabel htmlFor="joined_date" value="Joined Date" />
                        <TextInput
                            id="joined_date"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.joined_date || ''}
                            onChange={(e) => setData('joined_date', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.joined_date} />
                    </div>

                    <div
                        className={
                            'sm:col-span-2 rounded-md border p-4 transition-colors ' +
                            (data.is_sales_commission_eligible
                                ? 'border-indigo-200 bg-indigo-50'
                                : 'border-gray-200 bg-white')
                        }
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={!!data.is_sales_commission_eligible}
                                onChange={(e) =>
                                    setData('is_sales_commission_eligible', e.target.checked)
                                }
                            />
                            <div>
                                <div
                                    className={
                                        'text-sm font-semibold ' +
                                        (data.is_sales_commission_eligible
                                            ? 'text-indigo-900'
                                            : 'text-gray-900')
                                    }
                                >
                                    Is sales commission eligible
                                </div>
                                <div
                                    className={
                                        'text-xs ' +
                                        (data.is_sales_commission_eligible
                                            ? 'text-indigo-700'
                                            : 'text-gray-600')
                                    }
                                >
                                    Enable this if this employee should be considered for sales commission calculation.
                                </div>
                            </div>
                        </div>
                        <InputError
                            className="mt-2"
                            message={errors.is_sales_commission_eligible}
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Manage employee email and phone contacts.
                    </p>
                </div>

                <div className="mt-5">
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

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <InputLabel value="Phone Numbers" />
                        </div>
                        <PrimaryButton type="button" onClick={addPhone}>
                            Add phone
                        </PrimaryButton>
                    </div>

                    <div className="mt-3 space-y-3">
                        {phoneRows.map((row, idx) => (
                            <div key={idx} className="rounded-md border border-gray-200 bg-white p-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                    <div className="md:col-span-3">
                                        <InputLabel value="Type" />
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={row.phone_type || 'Mobile'}
                                            onChange={(e) =>
                                                updatePhone(idx, { phone_type: e.target.value })
                                            }
                                        >
                                            <option value="Mobile">Mobile</option>
                                            <option value="Land Phone">Land Phone</option>
                                            <option value="WhatsApp">WhatsApp</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <InputLabel value="Country code" />
                                        <div className="mt-1">
                                            <CountryCallingCodeCombobox
                                                value={row.country_code || '+94'}
                                                onChange={(cc) => updatePhone(idx, { country_code: cc })}
                                                options={countryCallingCodes}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <InputLabel value="Phone number" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={row.phone_number || ''}
                                            onChange={(e) =>
                                                updatePhone(idx, { phone_number: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-end gap-2">
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                            onClick={() => removePhone(idx)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <InputError className="mt-2" message={errors['phone_numbers']} />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                <p className="mt-1 text-xs text-gray-500">Primary location and mailing details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="address_line_1" value="Address Line 1" />
                        <TextInput
                            id="address_line_1"
                            className="mt-1 block w-full"
                            value={data.address_line_1 || ''}
                            onChange={(e) => setData('address_line_1', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.address_line_1} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="address_line_2" value="Address Line 2" />
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
                        <div className="mt-1">
                            <CountryCombobox
                                value={data.country || ''}
                                onChange={(name) => setData('country', name)}
                                options={countries}
                                placeholder="Search country..."
                            />
                        </div>
                        <InputError className="mt-2" message={errors.country} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="bank_name" value="Bank Name" />
                        <TextInput
                            id="bank_name"
                            className="mt-1 block w-full"
                            value={data.bank_name || ''}
                            onChange={(e) => setData('bank_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.bank_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="bank_branch" value="Bank Branch" />
                        <TextInput
                            id="bank_branch"
                            className="mt-1 block w-full"
                            value={data.bank_branch || ''}
                            onChange={(e) => setData('bank_branch', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.bank_branch} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputLabel
                            htmlFor="bank_account_number"
                            value="Bank Account Number"
                        />
                        <TextInput
                            id="bank_account_number"
                            className="mt-1 block w-full"
                            value={data.bank_account_number || ''}
                            onChange={(e) => setData('bank_account_number', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.bank_account_number} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <div className="mt-4">
                    <InputLabel htmlFor="notes" value="Notes" />
                    <textarea
                        id="notes"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={4}
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>
            </section>

            <div className="flex items-center justify-end gap-3">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

