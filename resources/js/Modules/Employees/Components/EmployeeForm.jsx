import AtmMoneyInput from '@/Components/AtmMoneyInput';
import FormDatePicker from '@/Components/FormDatePicker';
import FormSelect from '@/Components/FormSelect';
import LinkedUserCombobox from '@/Components/LinkedUserCombobox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import CountryCombobox from '@/Components/CountryCombobox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { getCompanyDefaultPhoneCountry } from '@/lib/companyLocationDefaults';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import { scrollToFirstError } from '@/lib/scrollToFirstError';
import { countries } from '@/data/countries';
import { departments } from '@/data/departments';
import { subYears } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

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

const phoneTypeSelectOptions = [
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Land Phone', label: 'Land Phone' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

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
    onCancel,
    onClientValidationError,
    profilePhotoUrl,
    mode = 'create',
}) {
    const company = usePage().props.company ?? {};
    const currencyLabel = (company.currency_symbol || company.currency_code || '').trim() || '—';
    const defaultPhoneCountry = getCompanyDefaultPhoneCountry(company);

    const [displayNameTouched, setDisplayNameTouched] = useState(false);
    const [photoPreviewSrc, setPhotoPreviewSrc] = useState(profilePhotoUrl || null);
    const [phoneRemoveWarning, setPhoneRemoveWarning] = useState('');
    const [emergencyPhoneRemoveWarning, setEmergencyPhoneRemoveWarning] = useState('');
    const [clientErrors, setClientErrors] = useState({});
    const profilePhotoInputRef = useRef(null);
    const mergedErrors = useMemo(() => ({ ...clientErrors, ...errors }), [clientErrors, errors]);

    useEffect(() => {
        // Only auto-fill on create; on edit, overwriting display_name breaks saves and custom names.
        if (mode === 'edit') {
            return;
        }

        const first = (data.first_name || '').trim();
        const last = (data.last_name || '').trim();
        const auto = `${first} ${last}`.trim();

        if (!displayNameTouched && data.display_name !== auto) {
            setData('display_name', auto);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.first_name, data.last_name, mode]);

    const phoneRows = useMemo(() => data.phone_numbers || [], [data.phone_numbers]);

    const emergencyPhoneRows = useMemo(
        () => data.emergency_phone_numbers || [],
        [data.emergency_phone_numbers],
    );
    const hasPhoneNumbersServerErrors = useMemo(
        () =>
            Object.keys(errors || {}).some(
                (k) => k === 'phone_numbers' || k.startsWith('phone_numbers.'),
            ),
        [errors],
    );
    const hasPhoneNumbersClientErrors = useMemo(
        () =>
            Object.keys(clientErrors || {}).some(
                (k) => k === 'phone_numbers' || k.startsWith('phone_numbers.'),
            ),
        [clientErrors],
    );

    const hasEmergencyPhoneNumbersServerErrors = useMemo(
        () =>
            Object.keys(errors || {}).some(
                (k) => k === 'emergency_phone_numbers' || k.startsWith('emergency_phone_numbers.'),
            ),
        [errors],
    );
    const hasEmergencyPhoneNumbersClientErrors = useMemo(
        () =>
            Object.keys(clientErrors || {}).some(
                (k) => k === 'emergency_phone_numbers' || k.startsWith('emergency_phone_numbers.'),
            ),
        [clientErrors],
    );

    const phoneNumbersBlockMessage = useMemo(() => {
        if (hasPhoneNumbersServerErrors) {
            return errors.phone_numbers || '';
        }
        if (hasPhoneNumbersClientErrors) {
            return clientErrors.phone_numbers || '';
        }
        return phoneRemoveWarning || clientErrors.phone_numbers || errors.phone_numbers || '';
    }, [
        clientErrors.phone_numbers,
        errors.phone_numbers,
        hasPhoneNumbersClientErrors,
        hasPhoneNumbersServerErrors,
        phoneRemoveWarning,
    ]);

    const emergencyPhoneNumbersBlockMessage = useMemo(() => {
        if (hasEmergencyPhoneNumbersServerErrors) {
            return errors.emergency_phone_numbers || '';
        }
        if (hasEmergencyPhoneNumbersClientErrors) {
            return clientErrors.emergency_phone_numbers || '';
        }
        return emergencyPhoneRemoveWarning || clientErrors.emergency_phone_numbers || errors.emergency_phone_numbers || '';
    }, [
        clientErrors.emergency_phone_numbers,
        emergencyPhoneRemoveWarning,
        errors.emergency_phone_numbers,
        hasEmergencyPhoneNumbersClientErrors,
        hasEmergencyPhoneNumbersServerErrors,
    ]);

    useEffect(() => {
        if (phoneRows.length > 0) {
            return;
        }

        setData('phone_numbers', [
            {
                phone_type: '',
                country_code: '',
                country_iso2: '',
                phone_number: '',
                is_primary: true,
            },
        ]);
    }, [defaultPhoneCountry.countryCode, defaultPhoneCountry.countryIso2, phoneRows.length, setData]);

    useEffect(() => {
        if (emergencyPhoneRows.length > 0) {
            return;
        }

        setData('emergency_phone_numbers', [
            {
                phone_type: '',
                country_code: '',
                country_iso2: '',
                phone_number: '',
                is_primary: true,
            },
        ]);
    }, [
        defaultPhoneCountry.countryCode,
        defaultPhoneCountry.countryIso2,
        emergencyPhoneRows.length,
        setData,
    ]);

    const usersList = useMemo(() => {
        const raw = users;
        if (!raw) {
            return [];
        }
        return Array.isArray(raw) ? raw : Object.values(raw);
    }, [users]);

    const usersInBranch = useMemo(() => {
        if (!usersList.length) {
            return [];
        }
        if (!data.branch_id) {
            return usersList;
        }
        return usersList.filter((u) => userAssignableToEmployeeBranch(u, data.branch_id));
    }, [usersList, data.branch_id]);

    useEffect(() => {
        if (!data.branch_id || !data.user_id || !usersList.length) {
            return;
        }
        const ok = usersList.some(
            (u) =>
                Number(u.id) === Number(data.user_id) &&
                userAssignableToEmployeeBranch(u, data.branch_id),
        );
        if (!ok) {
            setData('user_id', '');
        }
    }, [data.branch_id, data.user_id, usersList, setData]);

    useEffect(() => {
        if (data.remove_profile_photo) {
            setPhotoPreviewSrc(null);
            return;
        }

        if (data.profile_photo) {
            const objUrl = URL.createObjectURL(data.profile_photo);
            setPhotoPreviewSrc(objUrl);

            return () => {
                URL.revokeObjectURL(objUrl);
            };
        }

        setPhotoPreviewSrc(profilePhotoUrl || null);
    }, [data.profile_photo, data.remove_profile_photo, profilePhotoUrl]);

    const addPhone = () => {
        setData('phone_numbers', [
            ...phoneRows,
            {
                phone_type: '',
                country_code: '',
                country_iso2: '',
                phone_number: '',
                is_primary: phoneRows.length === 0,
            },
        ]);
        setPhoneRemoveWarning('');
    };

    const removePhone = (idx) => {
        if (phoneRows.length <= 1) {
            setPhoneRemoveWarning('At least one phone number is required.');
            return;
        }

        const next = phoneRows.filter((_, i) => i !== idx);
        setData('phone_numbers', next);
        setPhoneRemoveWarning('');
    };

    const updatePhone = (idx, patch) => {
        setPhoneRemoveWarning('');
        const next = phoneRows.map((row, i) => (i === idx ? { ...row, ...patch } : row));
        setData('phone_numbers', next);
    };

    const addEmergencyPhone = () => {
        setData('emergency_phone_numbers', [
            ...emergencyPhoneRows,
            {
                phone_type: '',
                country_code: '',
                country_iso2: '',
                phone_number: '',
                is_primary: emergencyPhoneRows.length === 0,
            },
        ]);
        setEmergencyPhoneRemoveWarning('');
    };

    const removeEmergencyPhone = (idx) => {
        if (emergencyPhoneRows.length <= 1) {
            setEmergencyPhoneRemoveWarning('At least one phone number is required.');
            return;
        }

        const next = emergencyPhoneRows.filter((_, i) => i !== idx);
        setData('emergency_phone_numbers', next);
        setEmergencyPhoneRemoveWarning('');
    };

    const updateEmergencyPhone = (idx, patch) => {
        setEmergencyPhoneRemoveWarning('');
        setData(
            'emergency_phone_numbers',
            emergencyPhoneRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
        );
    };

    const validateBeforeSubmit = () => {
        const nextErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!String(data.first_name || '').trim()) nextErrors.first_name = 'First name is required.';
        if (!String(data.last_name || '').trim()) nextErrors.last_name = 'Last name is required.';
        if (!String(data.display_name || '').trim()) nextErrors.display_name = 'Display name is required.';
        if (!String(data.nic || '').trim()) nextErrors.nic = 'NIC is required.';
        if (!String(data.gender || '').trim()) nextErrors.gender = 'Gender is required.';
        if (!String(data.marital_status || '').trim()) nextErrors.marital_status = 'Marital status is required.';
        if (!String(data.date_of_birth || '').trim()) nextErrors.date_of_birth = 'Date of birth is required.';
        if (!String(data.designation || '').trim()) nextErrors.designation = 'Designation is required.';
        if (!String(data.department || '').trim()) nextErrors.department = 'Department is required.';
        if (!String(data.employment_type || '').trim()) nextErrors.employment_type = 'Employment type is required.';
        if (!String(data.joined_date || '').trim()) nextErrors.joined_date = 'Joined date is required.';
        if (!String(data.basic_salary || '').trim()) nextErrors.basic_salary = 'Basic salary is required.';
        if (!String(data.email || '').trim()) nextErrors.email = 'Email is required.';
        else if (!emailRegex.test(String(data.email || '').trim())) nextErrors.email = 'Enter a valid email address.';
        if (!String(data.address_line_1 || '').trim()) nextErrors.address_line_1 = 'Address Line 1 is required.';
        if (!String(data.city || '').trim()) nextErrors.city = 'City is required.';
        if (!String(data.country || '').trim()) nextErrors.country = 'Country is required.';
        if (!String(data.bank_name || '').trim()) nextErrors.bank_name = 'Bank name is required.';
        if (!String(data.bank_branch || '').trim()) nextErrors.bank_branch = 'Branch is required.';
        if (!String(data.bank_account_number || '').trim()) nextErrors.bank_account_number = 'Bank account number is required.';
        if (!String(data.emergency_contact_person || '').trim()) {
            nextErrors.emergency_contact_person = 'Contact person is required.';
        }

        const hasAnyPhoneNumber = (phoneRows || []).some((row) =>
            [row?.phone_type, row?.country_code, row?.phone_number].some(
                (value) => String(value || '').trim() !== '',
            ),
        );
        if (!hasAnyPhoneNumber) nextErrors.phone_numbers = 'At least one phone number is required.';
        phoneRows.forEach((row, idx) => {
            const type = String(row?.phone_type || '').trim();
            const code = String(row?.country_code || '').trim();
            const number = String(row?.phone_number || '').trim();
            const hasAny = Boolean(type || code || number);
            if (!hasAny) return;
            if (!type) nextErrors[`phone_numbers.${idx}.phone_type`] = 'Type is required.';
            if (!code) nextErrors[`phone_numbers.${idx}.country_code`] = 'Code is required.';
            if (!number) nextErrors[`phone_numbers.${idx}.phone_number`] = 'Phone number is required.';
        });

        const hasAnyEmergencyPhoneNumber = (emergencyPhoneRows || []).some((row) =>
            [row?.phone_type, row?.country_code, row?.phone_number].some(
                (value) => String(value || '').trim() !== '',
            ),
        );
        if (!hasAnyEmergencyPhoneNumber) {
            nextErrors.emergency_phone_numbers = 'At least one emergency contact phone number is required.';
        }
        emergencyPhoneRows.forEach((row, idx) => {
            const type = String(row?.phone_type || '').trim();
            const code = String(row?.country_code || '').trim();
            const number = String(row?.phone_number || '').trim();
            const hasAny = Boolean(type || code || number);
            if (!hasAny) return;
            if (!type) nextErrors[`emergency_phone_numbers.${idx}.phone_type`] = 'Emergency contact phone type is required.';
            if (!code) nextErrors[`emergency_phone_numbers.${idx}.country_code`] = 'Code is required.';
            if (!number) nextErrors[`emergency_phone_numbers.${idx}.phone_number`] = 'Emergency contact phone number is required.';
        });

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
                            options={
                                activeBranches?.map((b) => ({
                                    value: b.id,
                                    label: `${b.code} — ${b.name}`,
                                })) ?? []
                            }
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
                                        ref={profilePhotoInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-0"
                                        onChange={(e) => {
                                            setData(
                                                'profile_photo',
                                                e.target.files?.[0] || null,
                                            );
                                            setData('remove_profile_photo', false);
                                        }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                    Upload JPG/JPEG/PNG/WEBP.
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {photoPreviewSrc ? (
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => {
                                                setData('profile_photo', null);
                                                setData('remove_profile_photo', true);
                                                setPhotoPreviewSrc(null);
                                                if (profilePhotoInputRef.current) {
                                                    profilePhotoInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            Remove Photo
                                        </SecondaryButton>
                                    ) : null}
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
                        <InputError className="mt-2" message={mergedErrors.first_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            className="mt-1 block w-full"
                            value={data.last_name || ''}
                            onChange={(e) => setData('last_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={mergedErrors.last_name} />
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
                        <InputError className="mt-2" message={mergedErrors.display_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="nic" value="NIC" />
                        <TextInput
                            id="nic"
                            className="mt-1 block w-full"
                            value={data.nic || ''}
                            onChange={(e) => setData('nic', e.target.value)}
                        />
                        <InputError className="mt-2" message={mergedErrors.nic} />
                    </div>

                    <div>
                        <InputLabel htmlFor="gender" value="Gender" />
                        <FormSelect
                            id="gender"
                            className="mt-1"
                            value={data.gender || ''}
                            onChange={(v) => setData('gender', v)}
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' },
                                { value: 'Prefer not to say', label: 'Prefer not to say' },
                            ]}
                            placeholder="Select gender..."
                        />
                        <InputError className="mt-2" message={mergedErrors.gender} />
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
                                { value: 'Single', label: 'Single' },
                                { value: 'Married', label: 'Married' },
                                { value: 'Divorced', label: 'Divorced' },
                                { value: 'Widowed', label: 'Widowed' },
                            ]}
                            placeholder="Select marital status..."
                        />
                        <InputError
                            className="mt-2"
                            message={mergedErrors.marital_status}
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
                        <InputError className="mt-2" message={mergedErrors.date_of_birth} />
                    </div>

                    <div>
                        <InputLabel htmlFor="user_id" value="Linked User (Optional)" />
                        <LinkedUserCombobox
                            id="user_id"
                            className="mt-1"
                            value={data.user_id}
                            users={usersInBranch}
                            onChange={(u) => setData('user_id', u ? Number(u.id) : '')}
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
                        <InputError className="mt-2" message={mergedErrors.designation} />
                    </div>

                    <div>
                        <InputLabel htmlFor="department" value="Department" />
                        <FormSelect
                            id="department"
                            className="mt-1"
                            value={data.department || ''}
                            onChange={(v) => setData('department', v)}
                            options={[
                                ...departments.map((d) => ({ value: d, label: d })),
                            ]}
                            placeholder="Select department..."
                        />
                        <InputError className="mt-2" message={mergedErrors.department} />
                    </div>

                    <div>
                        <InputLabel htmlFor="employment_type" value="Employment Type" />
                        <FormSelect
                            id="employment_type"
                            className="mt-1"
                            value={data.employment_type || ''}
                            onChange={(v) => setData('employment_type', v)}
                            options={[
                                { value: 'Full-time', label: 'Full-time' },
                                { value: 'Part-time', label: 'Part-time' },
                                { value: 'Contract', label: 'Contract' },
                                { value: 'Intern', label: 'Intern' },
                            ]}
                            placeholder="Select employment type..."
                        />
                        <InputError
                            className="mt-2"
                            message={mergedErrors.employment_type}
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
                        <InputError className="mt-2" message={mergedErrors.joined_date} />
                    </div>

                    <div>
                        <AtmMoneyInput
                            id="basic_salary"
                            label="Basic Salary"
                            addon={currencyLabel}
                            value={data.basic_salary}
                            onChange={(v) => setData('basic_salary', v)}
                            error={mergedErrors.basic_salary}
                            fractionDigits={2}
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
                    <InputError className="mt-2" message={mergedErrors.email} />
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
                            <div
                                key={idx}
                                className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                            >
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                    <div className="md:col-span-3">
                                        <InputLabel value="Type" className="mb-1" />
                                        <FormSelect
                                            className=""
                                            value={row.phone_type || ''}
                                            onChange={(v) => updatePhone(idx, { phone_type: v })}
                                            options={phoneTypeSelectOptions}
                                            placeholder="Select phone type..."
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={mergedErrors[`phone_numbers.${idx}.phone_type`]}
                                        />
                                    </div>
                                    <div className="md:col-span-9">
                                        <PhoneNumberWithCountryField
                                            countryCode={
                                                row.country_code || ''
                                            }
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
                                            countryCodeError={
                                                mergedErrors[`phone_numbers.${idx}.country_code`]
                                            }
                                            phoneNumberError={
                                                mergedErrors[`phone_numbers.${idx}.phone_number`]
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-12 flex justify-end">
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => removePhone(idx)}
                                        >
                                            Remove
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <InputError className="mt-2" message={phoneNumbersBlockMessage} />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Emergency Contact</h3>
                <p className="mt-1 text-xs text-gray-500">
                    Person and phone numbers for emergencies.
                </p>

                <div className="mt-4">
                    <InputLabel htmlFor="emergency_contact_person" value="Contact Person" />
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
                    <InputError className="mt-2" message={mergedErrors.emergency_contact_person} />
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <InputLabel value="Phone Numbers" />
                        </div>
                        <PrimaryButton type="button" onClick={addEmergencyPhone}>
                            Add phone
                        </PrimaryButton>
                    </div>

                    <div className="mt-3 space-y-3">
                        {emergencyPhoneRows.map((row, idx) => (
                            <div
                                key={`em-${idx}`}
                                className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                            >
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                    <div className="md:col-span-3">
                                        <InputLabel value="Type" className="mb-1" />
                                        <FormSelect
                                            className=""
                                            value={row.phone_type || ''}
                                            onChange={(v) =>
                                                updateEmergencyPhone(idx, { phone_type: v })
                                            }
                                            options={phoneTypeSelectOptions}
                                            placeholder="Select phone type..."
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={
                                                mergedErrors[`emergency_phone_numbers.${idx}.phone_type`]
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-9">
                                        <PhoneNumberWithCountryField
                                            countryCode={
                                                row.country_code || ''
                                            }
                                            countryIso2={row.country_iso2}
                                            phoneNumber={row.phone_number || ''}
                                            onPhoneCountryChange={({ countryCode, iso2 }) =>
                                                updateEmergencyPhone(idx, {
                                                    country_code: countryCode,
                                                    country_iso2: iso2 || null,
                                                })
                                            }
                                            onPhoneNumberChange={(num) =>
                                                updateEmergencyPhone(idx, { phone_number: num })
                                            }
                                            options={countryCallingCodes}
                                            phoneInputId={`employee_emergency_phone_numbers_${idx}_number`}
                                            countryCodeError={
                                                mergedErrors[`emergency_phone_numbers.${idx}.country_code`]
                                            }
                                            phoneNumberError={
                                                mergedErrors[`emergency_phone_numbers.${idx}.phone_number`]
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-12 flex justify-end">
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => removeEmergencyPhone(idx)}
                                        >
                                            Remove
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <InputError className="mt-2" message={emergencyPhoneNumbersBlockMessage} />
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
                        <InputError className="mt-2" message={mergedErrors.address_line_1} />
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
                        <InputError className="mt-2" message={mergedErrors.city} />
                    </div>
                    <div>
                        <InputLabel htmlFor="country" value="Country" />
                        <div className="mt-1">
                            <CountryCombobox
                                value={data.country || ''}
                                onChange={(name) => setData('country', name)}
                                options={countries}
                                placeholder="Select country..."
                            />
                        </div>
                        <InputError className="mt-2" message={mergedErrors.country} />
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
                        <InputError className="mt-2" message={mergedErrors.bank_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="bank_branch" value="Bank Branch" />
                        <TextInput
                            id="bank_branch"
                            className="mt-1 block w-full"
                            value={data.bank_branch || ''}
                            onChange={(e) => setData('bank_branch', e.target.value)}
                        />
                        <InputError className="mt-2" message={mergedErrors.bank_branch} />
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
                        <InputError className="mt-2" message={mergedErrors.bank_account_number} />
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
                {typeof onCancel === 'function' ? (
                    <SecondaryButton type="button" onClick={onCancel}>
                        Back
                    </SecondaryButton>
                ) : null}
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

