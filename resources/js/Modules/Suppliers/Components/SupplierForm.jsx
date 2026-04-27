import Checkbox from '@/Components/Checkbox';
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
import { useRef, useState } from 'react';

function initialDisplayFollowsCompany(formData) {
    const disp = (formData.display_name || '').trim();
    const company = (formData.company_name || '').trim();
    if (!disp) return true;
    return disp === company;
}

const phoneTypeSelectOptions = [
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Land Phone', label: 'Land Phone' },
    { value: 'WhatsApp', label: 'WhatsApp' },
];

export default function SupplierForm({ data, setData, errors, processing, submitLabel, onSubmit, onCancel }) {
    const displayNameFollowsCompany = useRef(initialDisplayFollowsCompany(data));
    const [phoneRemoveWarning, setPhoneRemoveWarning] = useState('');
    const [phoneRows, setPhoneRows] = useState(() => {
        const rows = [];
        if (data.primary_phone_country_code || data.primary_phone_number) {
            rows.push({
                phone_type: '',
                country_code: data.primary_phone_country_code || '',
                country_iso2: null,
                phone_number: data.primary_phone_number || '',
            });
        }
        if (data.whatsapp_country_code || data.whatsapp_number) {
            rows.push({
                phone_type: '',
                country_code: data.whatsapp_country_code || '',
                country_iso2: null,
                phone_number: data.whatsapp_number || '',
            });
        }
        if (rows.length === 0) {
            rows.push({
                phone_type: '',
                country_code: '',
                country_iso2: null,
                phone_number: '',
            });
        }
        return rows;
    });

    const syncPhoneRowsToForm = (nextRows) => {
        const primary = nextRows[0] || null;
        const whatsapp = nextRows.find((row) => row.phone_type === 'WhatsApp') || nextRows[1] || null;

        setPhoneRows(nextRows);
        setData({
            ...data,
            primary_phone_country_code: primary?.country_code || '',
            primary_phone_number: primary?.phone_number || '',
            whatsapp_country_code: whatsapp?.country_code || '',
            whatsapp_number: whatsapp?.phone_number || '',
        });
    };

    const addPhone = () => {
        if (phoneRows.length >= 2) {
            setPhoneRemoveWarning('Only two contact numbers are supported.');
            return;
        }
        const hasWhatsapp = phoneRows.some((row) => row.phone_type === 'WhatsApp');
        const nextRows = [
            ...phoneRows,
            {
                phone_type: '',
                country_code: '',
                country_iso2: null,
                phone_number: '',
            },
        ];
        setPhoneRemoveWarning('');
        syncPhoneRowsToForm(nextRows);
    };

    const removePhone = (idx) => {
        if (phoneRows.length <= 1) {
            setPhoneRemoveWarning('At least one phone number is required.');
            return;
        }
        const nextRows = phoneRows.filter((_, i) => i !== idx);
        setPhoneRemoveWarning('');
        syncPhoneRowsToForm(nextRows);
    };

    const updatePhone = (idx, patch) => {
        const nextRows = phoneRows.map((row, i) => (i === idx ? { ...row, ...patch } : row));
        setPhoneRemoveWarning('');
        syncPhoneRowsToForm(nextRows);
    };
    const [bankRemoveWarning, setBankRemoveWarning] = useState('');
    const bankRows = data.bank_accounts || [];
    const hasBankAccountsServerErrors = Object.keys(errors || {}).some(
        (k) => k === 'bank_accounts' || k.startsWith('bank_accounts.'),
    );
    const bankAccountsBlockMessage = hasBankAccountsServerErrors
        ? errors.bank_accounts || ''
        : bankRemoveWarning || errors.bank_accounts || '';

    const updateBank = (idx, patch) => {
        setBankRemoveWarning('');
        setData(
            'bank_accounts',
            bankRows.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
        );
    };

    const setPrimaryBank = (idx) => {
        setBankRemoveWarning('');
        setData(
            'bank_accounts',
            bankRows.map((row, i) => ({ ...row, is_primary: i === idx })),
        );
    };

    const addBank = () => {
        setBankRemoveWarning('');
        setData('bank_accounts', [
            ...bankRows,
            {
                bank_name: '',
                branch_name: '',
                account_number: '',
                account_name: '',
                swift_bic_code: '',
                display_order: bankRows.length,
                is_primary: bankRows.length === 0,
            },
        ]);
    };

    const removeBank = (idx) => {
        if (bankRows.length <= 1) {
            setBankRemoveWarning('At least one bank account is required.');
            return;
        }
        setBankRemoveWarning('');
        const next = bankRows.filter((_, i) => i !== idx);
        const hasPrimary = next.some((row) => !!row.is_primary);
        setData(
            'bank_accounts',
            hasPrimary
                ? next
                : next.map((row, i) => ({
                      ...row,
                      is_primary: i === 0,
                  })),
        );
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6" noValidate>
            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Supplier Information</h3>
                <p className="mt-1 text-xs text-gray-500">Core supplier identity and profile details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="supplier_code" value="Supplier Code" />
                        <TextInput id="supplier_code" className="mt-1 block w-full" value={data.supplier_code || 'Auto-generated'} disabled />
                    </div>
                    <div>
                        <InputLabel htmlFor="is_active" value="Status" />
                        <FormSelect
                            id="is_active"
                            className="mt-1"
                            value={data.is_active ? 'active' : 'inactive'}
                            onChange={(value) => setData('is_active', value === 'active')}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                        <InputError className="mt-2" message={errors.is_active} />
                    </div>
                    <div>
                        <InputLabel htmlFor="company_name" value="Company Name" />
                        <TextInput id="company_name" className="mt-1 block w-full" value={data.company_name || ''} onChange={(e) => {
                            const value = e.target.value;
                            if (displayNameFollowsCompany.current) {
                                setData({ ...data, company_name: value, display_name: value });
                            } else {
                                setData('company_name', value);
                            }
                        }} />
                        <InputError className="mt-2" message={errors.company_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="display_name" value="Display Name" />
                        <TextInput id="display_name" className="mt-1 block w-full" value={data.display_name || ''} onChange={(e) => {
                            const value = e.target.value;
                            setData('display_name', value);
                            displayNameFollowsCompany.current = !value.trim();
                        }} onBlur={() => {
                            if (!(data.display_name || '').trim()) setData('display_name', data.company_name || '');
                        }} />
                        <InputError className="mt-2" message={errors.display_name} />
                    </div>
                    <div><InputLabel htmlFor="contact_person" value="Contact Person" /><TextInput id="contact_person" className="mt-1 block w-full" value={data.contact_person || ''} onChange={(e) => setData('contact_person', e.target.value)} /><InputError className="mt-2" message={errors.contact_person} /></div>
                    <div><InputLabel htmlFor="website" value="Website" /><TextInput id="website" className="mt-1 block w-full placeholder:text-gray-400" value={data.website || ''} onChange={(e) => setData('website', e.target.value)} placeholder="https://example.com" /><InputError className="mt-2" message={errors.website} /></div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                <p className="mt-1 text-xs text-gray-500">Manage supplier email and phone contacts.</p>

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
                        <InputLabel value="Phone Numbers" />
                        <PrimaryButton type="button" onClick={addPhone}>
                            Add phone
                        </PrimaryButton>
                    </div>

                    <div className="mt-3 space-y-4">
                        {phoneRows.map((row, idx) => (
                            <div
                                key={idx}
                                className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                    <div className="md:col-span-3">
                                        <InputLabel value="Type" className="mb-1" />
                                        <FormSelect
                                            value={row.phone_type || ''}
                                            onChange={(v) => updatePhone(idx, { phone_type: v })}
                                            options={phoneTypeSelectOptions}
                                            placeholder="Select phone type..."
                                        />
                                    </div>
                                    <div className="md:col-span-9">
                                        <PhoneNumberWithCountryField
                                            countryCode={row.country_code || ''}
                                            countryIso2={row.country_iso2}
                                            phoneNumber={row.phone_number || ''}
                                            onPhoneCountryChange={({ countryCode, iso2 }) =>
                                                updatePhone(idx, {
                                                    country_code: countryCode || '',
                                                    country_iso2: iso2 || null,
                                                })
                                            }
                                            onPhoneNumberChange={(number) =>
                                                updatePhone(idx, { phone_number: number })
                                            }
                                            options={countryCallingCodes}
                                            phoneInputId={`supplier_phone_numbers_${idx}_number`}
                                            countryCodeError={
                                                row.phone_type === 'WhatsApp'
                                                    ? errors.whatsapp_country_code
                                                    : errors.primary_phone_country_code
                                            }
                                            phoneNumberError={
                                                row.phone_type === 'WhatsApp'
                                                    ? errors.whatsapp_number
                                                    : errors.primary_phone_number
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-12 flex justify-end">
                                        <SecondaryButton type="button" onClick={() => removePhone(idx)}>
                                            Remove
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <InputError className="mt-2" message={phoneRemoveWarning} />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Address</h3>
                <p className="mt-1 text-xs text-gray-500">Primary location and mailing details.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><InputLabel htmlFor="address_line_1" value="Address Line 1" /><TextInput id="address_line_1" className="mt-1 block w-full" value={data.address_line_1 || ''} onChange={(e) => setData('address_line_1', e.target.value)} /><InputError className="mt-2" message={errors.address_line_1} /></div>
                    <div className="sm:col-span-2"><InputLabel htmlFor="address_line_2" value="Address Line 2" /><TextInput id="address_line_2" className="mt-1 block w-full" value={data.address_line_2 || ''} onChange={(e) => setData('address_line_2', e.target.value)} /><InputError className="mt-2" message={errors.address_line_2} /></div>
                    <div><InputLabel htmlFor="city" value="City" /><TextInput id="city" className="mt-1 block w-full" value={data.city || ''} onChange={(e) => setData('city', e.target.value)} /><InputError className="mt-2" message={errors.city} /></div>
                    <div><InputLabel htmlFor="state_province" value="State / Province" /><TextInput id="state_province" className="mt-1 block w-full" value={data.state_province || ''} onChange={(e) => setData('state_province', e.target.value)} /><InputError className="mt-2" message={errors.state_province} /></div>
                    <div><InputLabel htmlFor="postal_code" value="Postal Code" /><TextInput id="postal_code" className="mt-1 block w-full" value={data.postal_code || ''} onChange={(e) => setData('postal_code', e.target.value)} /><InputError className="mt-2" message={errors.postal_code} /></div>
                    <div><InputLabel htmlFor="country" value="Country" /><div className="mt-1"><CountryCombobox value={data.country || ''} onChange={(v) => setData('country', v)} options={countries} /></div><InputError className="mt-2" message={errors.country} /></div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Business Details</h3>
                <p className="mt-1 text-xs text-gray-500">Tax registration details for supplier compliance.</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><InputLabel htmlFor="tax_number" value="TIN" /><TextInput id="tax_number" className="mt-1 block w-full" value={data.tax_number || ''} onChange={(e) => setData('tax_number', e.target.value)} /><InputError className="mt-2" message={errors.tax_number} /></div>
                    <div><InputLabel htmlFor="vat_number" value="VAT" /><TextInput id="vat_number" className="mt-1 block w-full" value={data.vat_number || ''} onChange={(e) => setData('vat_number', e.target.value)} /><InputError className="mt-2" message={errors.vat_number} /></div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Bank Accounts</h3>
                        <p className="mt-1 text-xs text-gray-500">Bank account details used for supplier payments and transfers.</p>
                    </div>
                    <PrimaryButton type="button" onClick={addBank}>
                        Add account
                    </PrimaryButton>
                </div>

                <div className="mt-4 space-y-4">
                    {bankRows.map((row, idx) => (
                        <div
                            key={`supplier-bk-${idx}`}
                            className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                <div className="md:col-span-6">
                                    <InputLabel value="Bank Name" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.bank_name || ''}
                                        onChange={(e) => updateBank(idx, { bank_name: e.target.value })}
                                    />
                                    <InputError className="mt-2" message={errors[`bank_accounts.${idx}.bank_name`]} />
                                </div>
                                <div className="md:col-span-6">
                                    <InputLabel value="Branch" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.branch_name || ''}
                                        onChange={(e) => updateBank(idx, { branch_name: e.target.value })}
                                    />
                                    <InputError className="mt-2" message={errors[`bank_accounts.${idx}.branch_name`]} />
                                </div>
                                <div className="md:col-span-6">
                                    <InputLabel value="Account Number" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.account_number || ''}
                                        onChange={(e) => updateBank(idx, { account_number: e.target.value })}
                                    />
                                    <InputError className="mt-2" message={errors[`bank_accounts.${idx}.account_number`]} />
                                </div>
                                <div className="md:col-span-6">
                                    <InputLabel value="Account Name" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.account_name || ''}
                                        onChange={(e) => updateBank(idx, { account_name: e.target.value })}
                                    />
                                    <InputError className="mt-2" message={errors[`bank_accounts.${idx}.account_name`]} />
                                </div>
                                <div className="md:col-span-6">
                                    <InputLabel value="SWIFT/BIC Code" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={row.swift_bic_code || ''}
                                        onChange={(e) => updateBank(idx, { swift_bic_code: e.target.value })}
                                    />
                                    <InputError className="mt-2" message={errors[`bank_accounts.${idx}.swift_bic_code`]} />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-12 md:flex-row md:items-center md:justify-between">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox
                                            checked={!!row.is_primary}
                                            onChange={() => setPrimaryBank(idx)}
                                        />
                                        Primary account
                                    </label>
                                    <SecondaryButton type="button" onClick={() => removeBank(idx)}>
                                        Remove
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    ))}
                    <InputError className="mt-2" message={bankAccountsBlockMessage} />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <div className="mt-4">
                    <textarea
                        id="notes"
                        rows={4}
                        className={`mt-1 ${formTextareaClass}`}
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.notes} />
                </div>
            </section>

            <div className="flex items-center justify-end gap-3">
                {onCancel ? <SecondaryButton type="button" onClick={onCancel}>Back</SecondaryButton> : null}
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
