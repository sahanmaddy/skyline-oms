import FormDatePicker from '@/Components/FormDatePicker';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import CountryCombobox from '@/Components/CountryCombobox';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import { resolveCountryCallingOption } from '@/lib/phoneCountryDisplay';
import { countries } from '@/data/countries';
import { departments } from '@/data/departments';
import { subYears } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

/** Same branch rules as usersAvailableForEmployeeForm: home branch_id or assigned_branches. */
function userAssignableToEmployeeBranch(u, employeeBranchId) {
    if (employeeBranchId === '' || employeeBranchId === null || employeeBranchId === undefined) {
        return true;
    }
    const bid = Number(employeeBranchId);
    if (Number(u.branch_id) === bid) {
        return true;
    }
    const assigned = u.assigned_branches ?? [];
    return assigned.some((b) => b.is_active !== false && Number(b.id) === bid);
}

function formatMoneyWithCommas(value) {
    const trimmed = (value ?? '').toString().trim();
    if (!trimmed) {
        return '';
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) {
        return trimmed;
    }

    return new Intl.NumberFormat('en-LK', {
        maximumFractionDigits: 2,
    }).format(num);
}

const phoneTypeSelectOptions = [
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Land Phone', label: 'Land Phone' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

function normalizeMoneyInput(value) {
    const raw = (value ?? '').toString();
    const cleaned = raw.replace(/[^0-9.]/g, '');
    if (!cleaned) {
        return '';
    }

    // Keep only the first dot.
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
        return parts[1] !== undefined ? `${parts[0]}.${parts[1]}` : parts[0];
    }

    return `${parts[0]}.${parts.slice(1).join('')}`;
}

export default function EmployeeForm({
    data,
    setData,
    errors,
    processing,
    statusOptions,
    activeBranches,
    users,
    submitLabel,
    onSubmit,
    profilePhotoUrl,
    mode = 'create',
}) {
    const [displayNameTouched, setDisplayNameTouched] = useState(false);
    const [photoPreviewSrc, setPhotoPreviewSrc] = useState(profilePhotoUrl || null);
    const [emergencyPhoneTouched, setEmergencyPhoneTouched] = useState(false);
    const [emergencyPhoneCountryCode, setEmergencyPhoneCountryCode] = useState('+94');
    const [emergencyPhoneCountryIso2, setEmergencyPhoneCountryIso2] = useState('LK');
    const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState('');

    useEffect(() => {
        // Only auto-fill on create; on edit, overwriting display_name breaks saves and custom names.
        if (mode === 'edit') {
            return;
        }

        const first = (data.first_name || '').trim();
        const last = (data.last_name || '').trim();
        const auto = `${first} ${last}`.trim();

        if (!displayNameTouched && auto && data.display_name !== auto) {
            setData('display_name', auto);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.first_name, data.last_name, mode]);

    const phoneRows = useMemo(() => data.phone_numbers || [], [data.phone_numbers]);

    const usersInBranch = useMemo(() => {
        if (!users?.length) {
            return [];
        }
        if (!data.branch_id) {
            return users;
        }
        return users.filter((u) => userAssignableToEmployeeBranch(u, data.branch_id));
    }, [users, data.branch_id]);

    useEffect(() => {
        if (!data.branch_id || !data.user_id || !users?.length) {
            return;
        }
        const ok = users.some(
            (u) =>
                u.id === data.user_id &&
                userAssignableToEmployeeBranch(u, data.branch_id),
        );
        if (!ok) {
            setData('user_id', '');
        }
    }, [data.branch_id, data.user_id, users, setData]);

    useEffect(() => {
        if (data.profile_photo) {
            const objUrl = URL.createObjectURL(data.profile_photo);
            setPhotoPreviewSrc(objUrl);

            return () => {
                URL.revokeObjectURL(objUrl);
            };
        }

        setPhotoPreviewSrc(profilePhotoUrl || null);
    }, [data.profile_photo, profilePhotoUrl]);

    useEffect(() => {
        if (emergencyPhoneTouched) {
            return;
        }

        const raw = (data.emergency_contact_phone || '').trim();
        if (!raw) {
            setEmergencyPhoneCountryCode('+94');
            setEmergencyPhoneCountryIso2('LK');
            setEmergencyPhoneNumber('');
            return;
        }

        const sortedCodes = [...countryCallingCodes].sort(
            (a, b) => b.callingCode.length - a.callingCode.length,
        );

        const match = sortedCodes.find((c) => raw.startsWith(c.callingCode));
        if (!match) {
            setEmergencyPhoneCountryCode('+94');
            setEmergencyPhoneCountryIso2('LK');
            setEmergencyPhoneNumber(
                raw.replace(/[^\d]/g, '').replace(/^0+/, ''),
            );
            return;
        }

        const numberPart = raw
            .slice(match.callingCode.length)
            .trim()
            .replace(/^[-\s]+/, '');

        const resolved = resolveCountryCallingOption(
            countryCallingCodes,
            match.callingCode,
            null,
        );
        setEmergencyPhoneCountryCode(resolved.callingCode);
        setEmergencyPhoneCountryIso2(resolved.iso2);
        setEmergencyPhoneNumber(
            numberPart.replace(/[^\d]/g, '').replace(/^0+/, ''),
        );
    }, [data.emergency_contact_phone, emergencyPhoneTouched]);

    useEffect(() => {
        if (!emergencyPhoneTouched) {
            return;
        }

        const numberDigitsOnly = (emergencyPhoneNumber || '')
            .toString()
            .replace(/[^\d]/g, '');

        if (!numberDigitsOnly) {
            setData('emergency_contact_phone', null);
            return;
        }

        const ccDigits = (emergencyPhoneCountryCode || '')
            .toString()
            .replace(/[^\d]/g, '');

        let normalizedDigits = numberDigitsOnly;
        if (ccDigits && normalizedDigits.startsWith(ccDigits)) {
            normalizedDigits = normalizedDigits.slice(ccDigits.length);
        }
        normalizedDigits = normalizedDigits.replace(/^0+/, '');

        if (!normalizedDigits) {
            setData('emergency_contact_phone', null);
            return;
        }

        setData(
            'emergency_contact_phone',
            `${emergencyPhoneCountryCode} ${normalizedDigits}`.trim(),
        );
    }, [
        emergencyPhoneTouched,
        emergencyPhoneCountryCode,
        emergencyPhoneNumber,
        setData,
    ]);

    const addPhone = () => {
        setData('phone_numbers', [
            ...phoneRows,
            {
                phone_type: 'Mobile',
                country_code: '+94',
                country_iso2: 'LK',
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Employee Information</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">Core identity and basic profile details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="branch_id" value="Branch" />
                        <FormSelect
                            id="branch_id"
                            className="mt-1"
                            value={data.branch_id ?? ''}
                            onChange={(v) => setData('branch_id', v === '' ? '' : Number(v))}
                            options={[
                                { value: '', label: 'Select branch…' },
                                ...(activeBranches?.map((b) => ({
                                    value: b.id,
                                    label: `${b.code} — ${b.name}`,
                                })) ?? []),
                            ]}
                            placeholder="Select branch…"
                        />
                        <InputError className="mt-2" message={errors.branch_id} />
                    </div>

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
                        <FormSelect
                            id="status"
                            className="mt-1"
                            value={data.status || statusOptions?.[0] || 'active'}
                            onChange={(v) => setData('status', v)}
                            options={
                                statusOptions?.map((s) => ({
                                    value: s,
                                    label: s.charAt(0).toUpperCase() + s.slice(1),
                                })) ?? []
                            }
                        />
                        <InputError className="mt-2" message={errors.status} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel value="Profile Photo" />
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                                {photoPreviewSrc ? (
                                    <img
                                        src={photoPreviewSrc}
                                        alt="Profile preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-gray-400">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col justify-center sm:min-h-20">
                                <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:hover:bg-cursor-raised dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-0"
                                        onChange={(e) =>
                                            setData(
                                                'profile_photo',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                    Upload JPG/JPEG/PNG/WEBP.
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={errors.profile_photo}
                                />
                            </div>
                        </div>
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

                    <div>
                        <InputLabel htmlFor="given_names" value="Given Names" />
                        <TextInput
                            id="given_names"
                            className="mt-1 block w-full"
                            value={data.given_names || ''}
                            onChange={(e) => setData('given_names', e.target.value)}
                        />
                        <InputError
                            className="mt-2"
                            message={errors.given_names}
                        />
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
                        <InputLabel htmlFor="gender" value="Gender" />
                        <FormSelect
                            id="gender"
                            className="mt-1"
                            value={data.gender || ''}
                            onChange={(v) => setData('gender', v)}
                            options={[
                                { value: '', label: '—' },
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' },
                                { value: 'Prefer not to say', label: 'Prefer not to say' },
                            ]}
                            placeholder="—"
                        />
                        <InputError className="mt-2" message={errors.gender} />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="marital_status"
                            value="Marital Status"
                        />
                        <FormSelect
                            id="marital_status"
                            className="mt-1"
                            value={data.marital_status || ''}
                            onChange={(v) => setData('marital_status', v)}
                            options={[
                                { value: '', label: '—' },
                                { value: 'Single', label: 'Single' },
                                { value: 'Married', label: 'Married' },
                                { value: 'Divorced', label: 'Divorced' },
                                { value: 'Widowed', label: 'Widowed' },
                            ]}
                            placeholder="—"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.marital_status}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                        <div className="mt-1">
                            <FormDatePicker
                                id="date_of_birth"
                                value={data.date_of_birth || ''}
                                onChange={(v) => setData('date_of_birth', v)}
                                maxDate={new Date()}
                                minDate={subYears(new Date(), 120)}
                            />
                        </div>
                        <InputError className="mt-2" message={errors.date_of_birth} />
                    </div>

                    <div>
                        <InputLabel htmlFor="user_id" value="Linked User (Optional)" />
                        <FormSelect
                            id="user_id"
                            className="mt-1"
                            value={data.user_id === '' || data.user_id == null ? '' : data.user_id}
                            onChange={(v) => setData('user_id', v === '' ? '' : Number(v))}
                            options={[
                                { value: '', label: '— Not linked —' },
                                ...usersInBranch.map((u) => ({
                                    value: u.id,
                                    label: `${u.name} (${u.email})`,
                                })),
                            ]}
                            placeholder="— Not linked —"
                        />
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
                        <FormSelect
                            id="department"
                            className="mt-1"
                            value={data.department || ''}
                            onChange={(v) => setData('department', v)}
                            options={[
                                { value: '', label: '—' },
                                ...departments.map((d) => ({ value: d, label: d })),
                            ]}
                            placeholder="—"
                        />
                        <InputError className="mt-2" message={errors.department} />
                    </div>

                    <div>
                        <InputLabel htmlFor="employment_type" value="Employment Type" />
                        <FormSelect
                            id="employment_type"
                            className="mt-1"
                            value={data.employment_type || ''}
                            onChange={(v) => setData('employment_type', v)}
                            options={[
                                { value: '', label: '—' },
                                { value: 'Full-time', label: 'Full-time' },
                                { value: 'Part-time', label: 'Part-time' },
                                { value: 'Contract', label: 'Contract' },
                                { value: 'Intern', label: 'Intern' },
                            ]}
                            placeholder="—"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.employment_type}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="joined_date" value="Joined Date" />
                        <div className="mt-1">
                            <FormDatePicker
                                id="joined_date"
                                value={data.joined_date || ''}
                                onChange={(v) => setData('joined_date', v)}
                                maxDate={new Date()}
                                minDate={subYears(new Date(), 80)}
                            />
                        </div>
                        <InputError className="mt-2" message={errors.joined_date} />
                    </div>

                    <div>
                        <InputLabel htmlFor="basic_salary" value="Basic Salary" />
                        <div className="mt-1 flex items-stretch rounded-md transition duration-150 ease-in-out focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg">
                            <div className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                Rs.
                            </div>
                            <input
                                id="basic_salary"
                                type="text"
                                inputMode="decimal"
                                className="block w-full rounded-none rounded-r-md border border-gray-300 text-sm leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0"
                                value={formatMoneyWithCommas(data.basic_salary || '')}
                                placeholder="0.00"
                                onChange={(e) =>
                                    setData(
                                        'basic_salary',
                                        normalizeMoneyInput(
                                            e.target.value,
                                        ),
                                    )
                                }
                            />
                        </div>
                        <InputError
                            className="mt-2"
                            message={errors.basic_salary}
                        />
                    </div>

                    <div
                        className={
                            'sm:col-span-2 rounded-md border p-4 transition-colors ' +
                            (data.is_sales_commission_eligible
                                ? 'border-indigo-200 bg-indigo-50'
                                : 'border-gray-200 bg-white')
                        }
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
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

                    <div
                        className={
                            'sm:col-span-2 rounded-md border p-4 transition-colors ' +
                            (data.is_overtime_eligible
                                ? 'border-indigo-200 bg-indigo-50'
                                : 'border-gray-200 bg-white')
                        }
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={!!data.is_overtime_eligible}
                                onChange={(e) =>
                                    setData('is_overtime_eligible', e.target.checked)
                                }
                            />
                            <div>
                                <div
                                    className={
                                        'text-sm font-semibold ' +
                                        (data.is_overtime_eligible
                                            ? 'text-indigo-900'
                                            : 'text-gray-900')
                                    }
                                >
                                    Is overtime eligible
                                </div>
                                <div
                                    className={
                                        'text-xs ' +
                                        (data.is_overtime_eligible
                                            ? 'text-indigo-700'
                                            : 'text-gray-600')
                                    }
                                >
                                    Enable this if the employee can be considered for overtime payments.
                                </div>
                            </div>
                        </div>
                        <InputError
                            className="mt-2"
                            message={errors.is_overtime_eligible}
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
                                        <FormSelect
                                            className="mt-1"
                                            value={row.phone_type || 'Mobile'}
                                            onChange={(v) => updatePhone(idx, { phone_type: v })}
                                            options={phoneTypeSelectOptions}
                                        />
                                    </div>
                                    <div className="md:col-span-9">
                                        <InputLabel value="Phone" />
                                        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <div className="min-w-0 flex-1">
                                                <PhoneNumberWithCountryField
                                                    countryCode={row.country_code || '+94'}
                                                    countryIso2={row.country_iso2}
                                                    phoneNumber={row.phone_number || ''}
                                                    onPhoneCountryChange={({ countryCode, iso2 }) =>
                                                        updatePhone(idx, {
                                                            country_code: countryCode,
                                                            country_iso2: iso2 || null,
                                                        })
                                                    }
                                                    onPhoneNumberChange={(num) =>
                                                        updatePhone(idx, { phone_number: num })
                                                    }
                                                    options={countryCallingCodes}
                                                    phoneInputId={`employee_phone_numbers_${idx}_number`}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 self-end text-sm font-medium text-gray-700 hover:text-gray-900 sm:self-auto"
                                                onClick={() => removePhone(idx)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <InputError className="mt-2" message={errors['phone_numbers']} />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                    Emergency Contact
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                    Person and phone number for emergencies.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="emergency_contact_person"
                            value="Contact Person"
                        />
                        <TextInput
                            id="emergency_contact_person"
                            className="mt-1 block w-full"
                            value={data.emergency_contact_person || ''}
                            onChange={(e) =>
                                setData(
                                    'emergency_contact_person',
                                    e.target.value,
                                )
                            }
                        />
                        <InputError
                            className="mt-2"
                            message={errors.emergency_contact_person}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel value="Phone number" />
                        <div className="mt-1">
                            <PhoneNumberWithCountryField
                                countryCode={emergencyPhoneCountryCode || '+94'}
                                countryIso2={emergencyPhoneCountryIso2}
                                phoneNumber={emergencyPhoneNumber || ''}
                                onPhoneCountryChange={({ countryCode, iso2 }) => {
                                    setEmergencyPhoneTouched(true);
                                    setEmergencyPhoneCountryCode(countryCode || '+94');
                                    setEmergencyPhoneCountryIso2(iso2 || null);
                                }}
                                onPhoneNumberChange={(num) => {
                                    setEmergencyPhoneTouched(true);
                                    setEmergencyPhoneNumber(num);
                                }}
                                options={countryCallingCodes}
                                phoneInputId="emergency_contact_phone_input"
                            />
                        </div>

                        <InputError
                            className="mt-2"
                            message={errors.emergency_contact_phone}
                        />
                    </div>
                </div>
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
                        <InputLabel htmlFor="city" value="City/District" />
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
                                placeholder="Search countries..."
                            />
                        </div>
                        <InputError className="mt-2" message={errors.country} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Payroll & Statutory Details</h3>
                <p className="mt-1 text-xs text-gray-500">
                    Banking and statutory numbers used for salary and compliance processing.
                </p>
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
                    <div>
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

                    <div>
                        <InputLabel htmlFor="tin_number" value="TIN" />
                        <TextInput
                            id="tin_number"
                            className="mt-1 block w-full"
                            value={data.tin_number || ''}
                            onChange={(e) => setData('tin_number', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.tin_number} />
                    </div>

                    <div>
                        <InputLabel htmlFor="epf_number" value="EPF Number" />
                        <TextInput
                            id="epf_number"
                            className="mt-1 block w-full"
                            value={data.epf_number || ''}
                            onChange={(e) => setData('epf_number', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.epf_number} />
                    </div>

                    <div>
                        <InputLabel htmlFor="etf_number" value="ETF Number" />
                        <TextInput
                            id="etf_number"
                            className="mt-1 block w-full"
                            value={data.etf_number || ''}
                            onChange={(e) => setData('etf_number', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.etf_number} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <div className="mt-4">
                    <textarea
                        id="notes"
                        className={`mt-1 ${formTextareaClass}`}
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

