import AtmMoneyInput from '@/Components/AtmMoneyInput';
import CountryCombobox from '@/Components/CountryCombobox';
import CurrencyCodeCombobox from '@/Components/CurrencyCodeCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { countries } from '@/data/countries';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { currencyCodes } from '@/data/currencyCodes';
import { useEffect, useRef, useState } from 'react';

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

    useEffect(() => {
        if (!data.currency) {
            setData('currency', 'USD');
        }
    }, [data.currency, setData]);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6" noValidate>
            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Supplier Information</h3>
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
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><InputLabel htmlFor="registration_number" value="Registration Number" /><TextInput id="registration_number" className="mt-1 block w-full" value={data.registration_number || ''} onChange={(e) => setData('registration_number', e.target.value)} /><InputError className="mt-2" message={errors.registration_number} /></div>
                    <div><InputLabel htmlFor="tax_number" value="Tax Number" /><TextInput id="tax_number" className="mt-1 block w-full" value={data.tax_number || ''} onChange={(e) => setData('tax_number', e.target.value)} /><InputError className="mt-2" message={errors.tax_number} /></div>
                    <div><InputLabel htmlFor="payment_terms_days" value="Payment Terms (days)" /><TextInput id="payment_terms_days" className="mt-1 block w-full" value={data.payment_terms_days || ''} onChange={(e) => setData('payment_terms_days', e.target.value)} /><InputError className="mt-2" message={errors.payment_terms_days} /></div>
                    <div><InputLabel value="Currency" /><CurrencyCodeCombobox className="mt-1" value={data.currency || ''} onChange={(v) => setData('currency', String(v || '').toUpperCase())} options={currencyCodes} placeholder="Select currency..." /><InputError className="mt-2" message={errors.currency} /></div>
                    <AtmMoneyInput id="credit_limit" label="Credit Limit" addon={data.currency || 'CUR'} value={data.credit_limit} onChange={(v) => setData('credit_limit', v)} error={errors.credit_limit} fractionDigits={2} />
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Other</h3>
                <textarea id="notes" rows={4} className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} />
                <InputError className="mt-2" message={errors.notes} />
            </section>

            <div className="flex items-center justify-end gap-3">
                {onCancel ? <SecondaryButton type="button" onClick={onCancel}>Back</SecondaryButton> : null}
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
