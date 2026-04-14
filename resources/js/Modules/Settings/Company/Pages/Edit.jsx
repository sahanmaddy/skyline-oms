import Checkbox from '@/Components/Checkbox';
import CurrencyCodeCombobox from '@/Components/CurrencyCodeCombobox';
import FormSelect from '@/Components/FormSelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PhoneNumberWithCountryField from '@/Components/PhoneNumberWithCountryField';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TimeZoneCombobox from '@/Components/TimeZoneCombobox';
import TextInput from '@/Components/TextInput';
import { currencyCodes } from '@/data/currencyCodes';
import useConfirm from '@/feedback/useConfirm';
import { formatCompanyCurrency } from '@/lib/companyFormat';
import { countryCallingCodes } from '@/data/countryCallingCodes';
import { formTextareaClass } from '@/lib/dropdownMenuStyles';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

function emptyPhoneRow(order) {
    return {
        phone_type: 'Office',
        country_code: '+94',
        country_iso2: 'LK',
        phone_number: '',
        display_order: order,
        is_primary: false,
    };
}

function emptyBankRow(order) {
    return {
        bank_name: '',
        branch_name: '',
        account_number: '',
        account_name: '',
        display_order: order,
        is_primary: false,
    };
}

function currencyPreview(pattern, symbol, code) {
    const amt = '1,234.56';
    return String(pattern || '{symbol} {amount}')
        .replaceAll('{symbol}', symbol || '')
        .replaceAll('{code}', code || '')
        .replaceAll('{amount}', amt)
        .replace(/\s+/g, ' ')
        .trim();
}

async function cropImageToSquareFile(file) {
    if (!file || !file.type?.startsWith('image/')) {
        return file;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Could not read image.'));
            img.src = objectUrl;
        });

        const size = Math.min(image.width, image.height);
        const sx = Math.floor((image.width - size) / 2);
        const sy = Math.floor((image.height - size) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return file;
        }

        const radius = Math.max(14, Math.round(size * 0.22));
        const r = Math.min(radius, Math.floor(size / 2));
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, sx, sy, size, size, 0, 0, size, size);

        const outputType = 'image/png';
        const blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), outputType, 0.92);
        });

        if (!blob) {
            return file;
        }

        const baseName = (file.name || 'site-icon').replace(/\.[^.]+$/, '');
        return new File([blob], `${baseName}-square-rounded.png`, {
            type: outputType,
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export default function Edit({
    companySetting,
    canEdit,
    timeZoneOptions = [],
    phoneTypeOptions = [],
    currencyFormatExamples = [],
}) {
    const { confirm } = useConfirm();
    const [iconPreviewUrl, setIconPreviewUrl] = useState(null);
    const [iconLoadFailed, setIconLoadFailed] = useState(false);

    const initialPhones =
        companySetting?.phone_numbers?.length > 0
            ? companySetting.phone_numbers.map((r, i) => ({
                  phone_type: r.phone_type || 'Office',
                  country_code: r.country_code || '+94',
                  country_iso2: r.country_iso2 || 'LK',
                  phone_number: r.phone_number || '',
                  display_order: r.display_order ?? i,
                  is_primary: !!r.is_primary,
              }))
            : [emptyPhoneRow(0)];

    const initialBanks =
        companySetting?.bank_accounts?.length > 0
            ? companySetting.bank_accounts.map((r, i) => ({
                  bank_name: r.bank_name || '',
                  branch_name: r.branch_name || '',
                  account_number: r.account_number || '',
                  account_name: r.account_name || '',
                  display_order: r.display_order ?? i,
                  is_primary: !!r.is_primary,
              }))
            : [emptyBankRow(0)];

    const transformRegistered = useRef(false);
    const siteIconInputRef = useRef(null);

    const form = useForm({
        company_name: companySetting?.name ?? '',
        registered_address: companySetting?.registered_address ?? '',
        company_email: companySetting?.email ?? '',
        tin_number: companySetting?.tin_number ?? '',
        vat_number: companySetting?.vat_number ?? '',
        time_zone: companySetting?.time_zone ?? 'UTC',
        currency_code: companySetting?.currency_code ?? '',
        currency_symbol: companySetting?.currency_symbol ?? '',
        currency_format: companySetting?.currency_format ?? '{symbol} {amount}',
        phone_numbers: initialPhones,
        bank_accounts: initialBanks,
        site_icon: null,
        remove_site_icon: false,
    });

    if (!transformRegistered.current) {
        form.transform((payload) => ({
            ...payload,
            phone_numbers: (payload.phone_numbers || []).filter(
                (r) => r && String(r.phone_number || '').trim() !== '',
            ),
            bank_accounts: (payload.bank_accounts || []).filter(
                (r) =>
                    r &&
                    String(r.bank_name || '').trim() !== '' &&
                    String(r.account_number || '').trim() !== '',
            ),
        }));
        transformRegistered.current = true;
    }

    const { data, setData, put, processing, errors } = form;

    const phoneTypeSelectOptions = useMemo(
        () => phoneTypeOptions.map((t) => ({ value: t, label: t })),
        [phoneTypeOptions],
    );

    const currencyFormatSelectOptions = useMemo(() => {
        const sym = data.currency_symbol || '¤';
        const code = (data.currency_code || 'XXX').toUpperCase();
        const examples = currencyFormatExamples.length
            ? currencyFormatExamples
            : ['{symbol} {amount}', '{code} {amount}', '{amount} {code}'];
        const current = (data.currency_format || '').trim();
        const base = examples.map((p) => ({
            value: p,
            label: p,
        }));
        if (current && !examples.includes(current)) {
            return [
                {
                    value: current,
                    label: current,
                },
                ...base,
            ];
        }
        return base;
    }, [currencyFormatExamples, data.currency_code, data.currency_format, data.currency_symbol]);

    const currencyCodeOptions = useMemo(() => currencyCodes, []);

    const sampleAmountPreview = useMemo(
        () =>
            formatCompanyCurrency(1234.56, {
                currency_code: data.currency_code,
                currency_symbol: data.currency_symbol,
                currency_format: data.currency_format,
            }),
        [data.currency_code, data.currency_symbol, data.currency_format],
    );

    const updatePhone = (idx, patch) => {
        setData(
            'phone_numbers',
            data.phone_numbers.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
        );
    };

    const setPrimaryPhone = (idx) => {
        setData(
            'phone_numbers',
            data.phone_numbers.map((row, i) => ({ ...row, is_primary: i === idx })),
        );
    };

    const addPhone = () => {
        setData('phone_numbers', [...data.phone_numbers, emptyPhoneRow(data.phone_numbers.length)]);
    };

    const removePhone = (idx) => {
        const next = data.phone_numbers.filter((_, i) => i !== idx);
        setData('phone_numbers', next.length ? next : [emptyPhoneRow(0)]);
    };

    const updateBank = (idx, patch) => {
        setData(
            'bank_accounts',
            data.bank_accounts.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
        );
    };

    const setPrimaryBank = (idx) => {
        setData(
            'bank_accounts',
            data.bank_accounts.map((row, i) => ({ ...row, is_primary: i === idx })),
        );
    };

    const addBank = () => {
        setData('bank_accounts', [...data.bank_accounts, emptyBankRow(data.bank_accounts.length)]);
    };

    const removeBank = (idx) => {
        const next = data.bank_accounts.filter((_, i) => i !== idx);
        setData('bank_accounts', next.length ? next : [emptyBankRow(0)]);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!canEdit) {
            return;
        }
        const ok = await confirm({
            title: 'Save company settings?',
            message: 'These details are used across the app for titles, money formatting, dates, and documents.',
            confirmText: 'Save',
            cancelText: 'Cancel',
        });
        if (!ok) {
            return;
        }
        put(route('settings.company.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        return () => {
            if (iconPreviewUrl) {
                URL.revokeObjectURL(iconPreviewUrl);
            }
        };
    }, [iconPreviewUrl]);

    useEffect(() => {
        setIconLoadFailed(false);
    }, [iconPreviewUrl, companySetting?.site_icon_url, data.remove_site_icon]);

    const showIconPreview =
        !iconLoadFailed && !data.remove_site_icon && (iconPreviewUrl || companySetting?.site_icon_url);

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="Company Settings" />}>
            <Head title="Company Settings · Settings" />

            <SettingsModuleLayout breadcrumbs={[{ label: 'Company Settings' }]}>
                <form className="space-y-6" onSubmit={submit}>
                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Company Identity</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                            Legal name, icon, and how the business appears in the system.
                        </p>

                        <div className="mt-6 space-y-5">
                            <div>
                                <InputLabel htmlFor="company_name" value="Company Name" />
                                <TextInput
                                    id="company_name"
                                    className="mt-1 block w-full"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    disabled={!canEdit}
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                    Used across the system as the business name, site title, and document header.
                                </p>
                                <InputError className="mt-2" message={errors.company_name} />
                            </div>

                            <div>
                                <InputLabel value="Site Icon" />
                                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                    Recommended: 512 × 512 pixels. You can upload any size; we auto-crop to a centered square.
                                </p>
                                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-cursor-border dark:bg-cursor-raised">
                                        {showIconPreview ? (
                                            <img
                                                src={iconPreviewUrl || companySetting.site_icon_url}
                                                alt="Site icon preview"
                                                className="h-full w-full object-cover"
                                                onError={() => setIconLoadFailed(true)}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-gray-400 dark:text-cursor-muted">
                                                —
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center sm:min-h-20">
                                        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:hover:bg-cursor-raised dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg">
                                            <input
                                                ref={siteIconInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-0 dark:text-cursor-fg dark:file:bg-cursor-raised dark:file:text-cursor-bright dark:hover:file:bg-cursor-border"
                                                disabled={!canEdit}
                                                onChange={async (e) => {
                                                    const f = e.target.files?.[0] ?? null;
                                                    const cropped = f ? await cropImageToSquareFile(f) : null;
                                                    setData('site_icon', cropped);
                                                    if (cropped) {
                                                        setData('remove_site_icon', false);
                                                        if (iconPreviewUrl) {
                                                            URL.revokeObjectURL(iconPreviewUrl);
                                                        }
                                                        setIconPreviewUrl(URL.createObjectURL(cropped));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                            Upload JPG/JPEG/PNG/WEBP.
                                        </div>
                                        {iconLoadFailed ? (
                                            <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                                                Could not preview current icon. Upload a new one to replace it.
                                            </div>
                                        ) : null}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {canEdit && !data.remove_site_icon && (companySetting?.site_icon_url || iconPreviewUrl) ? (
                                                <SecondaryButton
                                                    type="button"
                                                    onClick={() => {
                                                        setData('remove_site_icon', true);
                                                        setData('site_icon', null);
                                                        if (iconPreviewUrl) {
                                                            URL.revokeObjectURL(iconPreviewUrl);
                                                            setIconPreviewUrl(null);
                                                        }
                                                        if (siteIconInputRef.current) {
                                                            siteIconInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
                                                    Remove icon
                                                </SecondaryButton>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <InputError className="mt-2" message={errors.site_icon} />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Registered Details</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                            Registered business address used on invoices and letterheads.
                        </p>
                        <div className="mt-6">
                            <InputLabel htmlFor="registered_address" value="Registered Address" />
                            <textarea
                                id="registered_address"
                                className={`${formTextareaClass} mt-1`}
                                rows={4}
                                value={data.registered_address}
                                onChange={(e) => setData('registered_address', e.target.value)}
                                disabled={!canEdit}
                                required
                            />
                            <InputError className="mt-2" message={errors.registered_address} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Contact Details</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                            Email and phone numbers shown where the business is referenced.
                        </p>

                        <div className="mt-6">
                            <InputLabel htmlFor="company_email" value="Company Email" />
                            <TextInput
                                id="company_email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.company_email || ''}
                                onChange={(e) => setData('company_email', e.target.value)}
                                disabled={!canEdit}
                            />
                            <InputError className="mt-2" message={errors.company_email} />
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-cursor-border">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <InputLabel value="Phone Numbers" />
                                {canEdit ? (
                                    <PrimaryButton type="button" onClick={addPhone}>
                                        Add phone
                                    </PrimaryButton>
                                ) : null}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                Mark one number as primary for summaries and documents.
                            </p>

                            <div className="mt-4 space-y-3">
                                {data.phone_numbers.map((row, idx) => (
                                    <div
                                        key={`ph-${idx}`}
                                        className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                                    >
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                                            <div className="md:col-span-3">
                                                <InputLabel value="Type" />
                                                <FormSelect
                                                    className="mt-1"
                                                    value={row.phone_type || 'Office'}
                                                    onChange={(v) => updatePhone(idx, { phone_type: v })}
                                                    options={phoneTypeSelectOptions}
                                                    disabled={!canEdit}
                                                />
                                            </div>
                                            <div className="md:col-span-9">
                                                <InputLabel value="Number" />
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
                                                            disabled={!canEdit}
                                                            phoneInputId={`company_phone_numbers_${idx}_number`}
                                                        />
                                                    </div>
                                                    {canEdit ? (
                                                        <SecondaryButton
                                                            type="button"
                                                            className="shrink-0 self-end sm:self-auto"
                                                            onClick={() => removePhone(idx)}
                                                        >
                                                            Remove
                                                        </SecondaryButton>
                                                    ) : null}
                                                </div>
                                                <InputError
                                                    className="mt-2"
                                                    message={errors[`phone_numbers.${idx}.phone_number`]}
                                                />
                                                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-cursor-fg">
                                                    <Checkbox
                                                        checked={!!row.is_primary}
                                                        disabled={!canEdit}
                                                        onChange={() => setPrimaryPhone(idx)}
                                                    />
                                                    Primary
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError className="mt-2" message={errors.phone_numbers} />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Tax Details</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                            Tax identifiers used for statutory records and invoice documents.
                        </p>
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="tin_number" value="TIN" />
                                <TextInput
                                    id="tin_number"
                                    className="mt-1 block w-full"
                                    value={data.tin_number || ''}
                                    onChange={(e) => setData('tin_number', e.target.value)}
                                    disabled={!canEdit}
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
                                    disabled={!canEdit}
                                />
                                <InputError className="mt-2" message={errors.vat_number} />
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Bank Accounts</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                                    Accounts shown on payment instructions and invoices.
                                </p>
                            </div>
                            {canEdit ? (
                                <PrimaryButton type="button" onClick={addBank}>
                                    Add account
                                </PrimaryButton>
                            ) : null}
                        </div>

                        <div className="mt-6 space-y-3">
                            {data.bank_accounts.map((row, idx) => (
                                <div
                                    key={`bk-${idx}`}
                                    className="rounded-md border border-gray-200 bg-white p-4 dark:border-cursor-border dark:bg-cursor-surface"
                                >
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                                        <div className="lg:col-span-3">
                                            <InputLabel value="Bank Name" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={row.bank_name || ''}
                                                onChange={(e) => updateBank(idx, { bank_name: e.target.value })}
                                                disabled={!canEdit}
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors[`bank_accounts.${idx}.bank_name`]}
                                            />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <InputLabel value="Branch" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={row.branch_name || ''}
                                                onChange={(e) => updateBank(idx, { branch_name: e.target.value })}
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <InputLabel value="Account Number" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={row.account_number || ''}
                                                onChange={(e) => updateBank(idx, { account_number: e.target.value })}
                                                disabled={!canEdit}
                                            />
                                            <InputError
                                                className="mt-2"
                                                message={errors[`bank_accounts.${idx}.account_number`]}
                                            />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <InputLabel value="Account Name" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={row.account_name || ''}
                                                onChange={(e) => updateBank(idx, { account_name: e.target.value })}
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 lg:col-span-12 lg:flex-row lg:items-center lg:justify-between">
                                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-cursor-fg">
                                                <Checkbox
                                                    checked={!!row.is_primary}
                                                    disabled={!canEdit}
                                                    onChange={() => setPrimaryBank(idx)}
                                                />
                                                Primary account
                                            </label>
                                            {canEdit ? (
                                                <SecondaryButton type="button" onClick={() => removeBank(idx)}>
                                                    Remove
                                                </SecondaryButton>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <InputError className="mt-2" message={errors.bank_accounts} />
                    </section>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">Localization</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                            Drives how dates and money appear in the interface.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="time_zone" value="Time Zone" />
                                <TimeZoneCombobox
                                    id="time_zone"
                                    className="mt-1"
                                    value={data.time_zone}
                                    onChange={(v) => setData('time_zone', v)}
                                    options={timeZoneOptions}
                                    disabled={!canEdit}
                                    placeholder="Select time zone..."
                                />
                                <InputError className="mt-2" message={errors.time_zone} />
                            </div>
                            <div>
                                <InputLabel htmlFor="currency_code" value="Currency Code (ISO 4217)" />
                                <CurrencyCodeCombobox
                                    className="mt-1"
                                    value={data.currency_code}
                                    onChange={(v) => setData('currency_code', String(v || '').toUpperCase())}
                                    options={currencyCodeOptions}
                                    disabled={!canEdit}
                                    placeholder="Select currency code..."
                                />
                                <InputError className="mt-2" message={errors.currency_code} />
                            </div>
                            <div>
                                <InputLabel htmlFor="currency_symbol" value="Currency Symbol" />
                                <TextInput
                                    id="currency_symbol"
                                    className="mt-1 block w-full"
                                    value={data.currency_symbol}
                                    onChange={(e) => setData('currency_symbol', e.target.value)}
                                    disabled={!canEdit}
                                />
                                <InputError className="mt-2" message={errors.currency_symbol} />
                            </div>
                            <div>
                                <InputLabel value="Currency Display Pattern" />
                                <FormSelect
                                    className="mt-1"
                                    value={data.currency_format || '{symbol} {amount}'}
                                    onChange={(v) => setData('currency_format', v)}
                                    options={currencyFormatSelectOptions}
                                    disabled={!canEdit}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-cursor-muted">
                                    Live preview: <span className="font-medium text-gray-800 dark:text-cursor-bright">{sampleAmountPreview}</span>
                                </p>
                                <InputError className="mt-2" message={errors.currency_format} />
                            </div>
                        </div>
                    </section>

                    {canEdit ? (
                        <div className="flex justify-end">
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save company settings'}
                            </PrimaryButton>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-cursor-muted">
                            You can view these settings but do not have permission to change them.
                        </p>
                    )}
                </form>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
