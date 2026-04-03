import CountryCombobox from '@/Components/CountryCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { countries } from '@/data/countries';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { useRef } from 'react';

/** True while display name should stay in sync with customer name (until user edits display name). */
function initialDisplayFollowsCustomer(formData) {
    const disp = (formData.display_name || '').trim();
    const cust = (formData.customer_name || '').trim();
    if (!disp) {
        return true;
    }
    return disp === cust;
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

    const parts = cleaned.split('.');
    if (parts.length <= 2) {
        return parts[1] !== undefined ? `${parts[0]}.${parts[1]}` : parts[0];
    }

    return `${parts[0]}.${parts.slice(1).join('')}`;
}

export default function CustomerForm({
    data,
    setData,
    errors,
    processing,
    statusOptions,
    submitLabel,
    onSubmit,
}) {
    const displayNameFollowsCustomer = useRef(initialDisplayFollowsCustomer(data));
    const phoneRows = data.phone_numbers || [];

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
        setData(
            'phone_numbers',
            phoneRows.filter((_, i) => i !== idx),
        );
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
            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                <p className="mt-1 text-xs text-gray-500">Core identity and customer profile details.</p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="customer_code" value="Customer Code" />
                        <TextInput
                            id="customer_code"
                            className="mt-1 block w-full"
                            value={data.customer_code || 'Auto-generated'}
                            disabled
                        />
                        <div className="mt-2 text-xs text-gray-500">
                            Customer code is assigned automatically when you create the customer.
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

                    <div>
                        <InputLabel htmlFor="customer_name" value="Customer Name" />
                        <TextInput
                            id="customer_name"
                            className="mt-1 block w-full"
                            value={data.customer_name || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (displayNameFollowsCustomer.current) {
                                    setData({
                                        ...data,
                                        customer_name: value,
                                        display_name: value,
                                    });
                                } else {
                                    setData('customer_name', value);
                                }
                            }}
                        />
                        <InputError className="mt-2" message={errors.customer_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="display_name" value="Display Name" />
                        <TextInput
                            id="display_name"
                            className="mt-1 block w-full"
                            value={data.display_name || ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                setData('display_name', v);
                                if (!v.trim()) {
                                    displayNameFollowsCustomer.current = true;
                                } else {
                                    displayNameFollowsCustomer.current = false;
                                }
                            }}
                            onBlur={() => {
                                if (!(data.display_name || '').trim()) {
                                    setData('display_name', data.customer_name || '');
                                }
                            }}
                        />
                        <InputError className="mt-2" message={errors.display_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="company_name" value="Company Name" />
                        <TextInput
                            id="company_name"
                            className="mt-1 block w-full"
                            value={data.company_name || ''}
                            onChange={(e) => setData('company_name', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.company_name} />
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
                        <InputLabel htmlFor="vat_number" value="VAT" />
                        <TextInput
                            id="vat_number"
                            className="mt-1 block w-full"
                            value={data.vat_number || ''}
                            onChange={(e) => setData('vat_number', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.vat_number} />
                    </div>

                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
                <p className="mt-1 text-xs text-gray-500">
                    Manage customer email and phone contacts.
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

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <InputLabel value="Phone Numbers" />
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
                                                    phoneInputId={`customer_phone_numbers_${idx}_number`}
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

                    <InputError className="mt-2" message={errors.phone_numbers} />
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
                <h3 className="text-sm font-semibold text-gray-900">Commercial Information</h3>
                <p className="mt-1 text-xs text-gray-500">Credit and guarantor details.</p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div
                        className={
                            'sm:col-span-2 rounded-md border p-4 transition-colors ' +
                            (data.credit_eligible
                                ? 'border-indigo-200 bg-indigo-50'
                                : 'border-gray-200 bg-white')
                        }
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                checked={!!data.credit_eligible}
                                onChange={(e) => setData('credit_eligible', e.target.checked)}
                            />
                            <div>
                                <div
                                    className={
                                        'text-sm font-semibold ' +
                                        (data.credit_eligible
                                            ? 'text-indigo-900'
                                            : 'text-gray-900')
                                    }
                                >
                                    Credit Eligible
                                </div>
                                <div
                                    className={
                                        'text-xs ' +
                                        (data.credit_eligible
                                            ? 'text-indigo-700'
                                            : 'text-gray-600')
                                    }
                                >
                                    Enable if this customer can buy on credit.
                                </div>
                            </div>
                        </div>
                        <InputError className="mt-2" message={errors.credit_eligible} />
                    </div>

                    <div>
                        <InputLabel htmlFor="credit_limit" value="Credit Limit" />
                        <div className="mt-1 flex items-stretch">
                            <div className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                Rs.
                            </div>
                            <input
                                id="credit_limit"
                                type="text"
                                inputMode="decimal"
                                className="block w-full rounded-none rounded-r-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={formatMoneyWithCommas(data.credit_limit || '')}
                                placeholder="0.00"
                                onChange={(e) =>
                                    setData('credit_limit', normalizeMoneyInput(e.target.value))
                                }
                            />
                        </div>
                        <InputError className="mt-2" message={errors.credit_limit} />
                    </div>

                    <div>
                        <InputLabel htmlFor="guarantor" value="Guarantor" />
                        <TextInput
                            id="guarantor"
                            className="mt-1 block w-full"
                            value={data.guarantor || ''}
                            onChange={(e) => setData('guarantor', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.guarantor} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
                <div className="mt-4">
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

