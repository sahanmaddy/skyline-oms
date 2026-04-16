import CountryCombobox from '@/Components/CountryCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { countries } from '@/data/countries';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import { getCompanyDefaultPhoneCountry } from '@/lib/companyLocationDefaults';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const phoneTypeSelectOptions = [
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Land Phone', label: 'Land Phone' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

export default function BranchForm({
    data,
    setData,
    errors,
    processing,
    mode = 'create',
    nextCode,
    branchCode,
    submitLabel,
    onSubmit,
}) {
    const company = usePage().props.company ?? {};
    const defaultPhoneCountry = getCompanyDefaultPhoneCountry(company);
    const [phoneRemoveWarning, setPhoneRemoveWarning] = useState('');
    const codeDisplay =
        mode === 'create' && nextCode
            ? nextCode
            : mode === 'edit' && branchCode
              ? branchCode
              : '';

    const phoneRows = data.phone_numbers || [];

    useEffect(() => {
        if (phoneRows.length > 0) {
            return;
        }

        setData('phone_numbers', [
            {
                phone_type: 'Mobile',
                country_code: defaultPhoneCountry.countryCode,
                country_iso2: defaultPhoneCountry.countryIso2,
                phone_number: '',
                is_primary: true,
            },
        ]);
    }, [defaultPhoneCountry.countryCode, defaultPhoneCountry.countryIso2, phoneRows.length, setData]);

    const addPhone = () => {
        setData('phone_numbers', [
            ...phoneRows,
            {
                phone_type: 'Mobile',
                country_code: defaultPhoneCountry.countryCode,
                country_iso2: defaultPhoneCountry.countryIso2,
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

        setData(
            'phone_numbers',
            phoneRows.filter((_, i) => i !== idx),
        );
        setPhoneRemoveWarning('');
    };

    const updatePhone = (idx, patch) => {
        setData(
            'phone_numbers',
            phoneRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
        );
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                    Branch Information
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Core identity and whether this branch is active in the system.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="branch_code_display" value="Branch Code" />
                        <TextInput
                            id="branch_code_display"
                            className="mt-1 block w-full"
                            value={codeDisplay || '—'}
                            disabled
                        />
                        <div className="mt-2 text-xs text-gray-500 dark:text-cursor-muted">
                            {mode === 'create'
                                ? 'The code is generated automatically when you save.'
                                : 'Branch code cannot be changed.'}
                        </div>
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
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name || ''}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                    Contact Information
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Branch email and phone numbers for correspondence.
                </p>

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

                <div className="mt-6 border-t border-gray-200 pt-4 dark:border-cursor-border">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <InputLabel value="Phone Numbers" />
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
                                            value={row.phone_type || 'Mobile'}
                                            onChange={(v) => updatePhone(idx, { phone_type: v })}
                                            options={phoneTypeSelectOptions}
                                        />
                                    </div>

                                    <div className="md:col-span-9">
                                        <PhoneNumberWithCountryField
                                            countryCode={
                                                row.country_code || defaultPhoneCountry.countryCode
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
                                            phoneInputId={`branch_phone_numbers_${idx}_number`}
                                        />
                                    </div>
                                    <div className="md:col-span-12">
                                        <InputError
                                            className="mt-0"
                                            message={[
                                                errors[`phone_numbers.${idx}.phone_type`],
                                                errors[`phone_numbers.${idx}.country_code`],
                                                errors[`phone_numbers.${idx}.phone_number`],
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
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
                    {phoneRemoveWarning ? (
                        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                            {phoneRemoveWarning}
                        </div>
                    ) : null}

                    <InputError className="mt-2" message={errors.phone_numbers} />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Address</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                    Primary location and mailing details.
                </p>

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

            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-cursor-border dark:bg-cursor-surface">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">Notes</h3>
                <div className="mt-4">
                    <textarea
                        id="notes"
                        rows={4}
                        className={`mt-1 ${formTextareaClass}`}
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        aria-label="Notes"
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
