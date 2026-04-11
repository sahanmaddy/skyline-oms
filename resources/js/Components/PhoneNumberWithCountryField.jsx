import { countryNativeNames } from '@/data/countryNativeNames';
import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    listboxPanelFilterInputClass,
} from '@/lib/dropdownMenuStyles';
import { countryListLabel, flagEmojiFromIso2, resolveCountryCallingOption } from '@/lib/phoneCountryDisplay';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function optionsByComparator(a, b) {
    return a?.iso2 === b?.iso2 && a?.callingCode === b?.callingCode;
}

function ChevronDownIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function normalizeDialDigits(code) {
    return (code || '').replace(/\D/g, '');
}

function CountryOptionsPanel({ open, query, setQuery, filtered }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open, setQuery]);

    useLayoutEffect(() => {
        if (!open) {
            return;
        }
        const id = window.requestAnimationFrame(() => {
            inputRef.current?.focus({ preventScroll: true });
        });
        return () => window.cancelAnimationFrame(id);
    }, [open]);

    return (
        <ListboxOptions
            modal={false}
            portal
            anchor="bottom start"
            className={`z-[100] mt-1 max-h-64 w-[min(100vw-1.5rem,22rem)] overflow-hidden [--anchor-gap:4px] ${dropdownMenuPanelRingClass}`}
        >
            <div
                className="sticky top-0 z-10 border-b border-gray-100 bg-white px-2 pb-2 pt-1.5 dark:border-cursor-border dark:bg-cursor-surface"
                onPointerDown={(e) => {
                    if (e.target instanceof HTMLInputElement) {
                        return;
                    }
                    e.preventDefault();
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            return;
                        }
                        e.stopPropagation();
                    }}
                    className={listboxPanelFilterInputClass}
                    placeholder="Search countries..."
                    aria-label="Search countries"
                    autoComplete="off"
                />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {filtered.slice(0, 200).map((opt) => (
                    <ListboxOption
                        key={`${opt.iso2}-${opt.callingCode}`}
                        value={opt}
                        className={dropdownMenuItemClass}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg leading-none" aria-hidden="true">
                                {flagEmojiFromIso2(opt.iso2)}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                                {countryListLabel(opt.name, opt.iso2)}
                            </span>
                            <span className="cc-suffix shrink-0 tabular-nums text-gray-500">
                                {opt.callingCode}
                            </span>
                        </div>
                    </ListboxOption>
                ))}
                {filtered.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">No matches.</div>
                )}
            </div>
        </ListboxOptions>
    );
}

export default function PhoneNumberWithCountryField({
    countryCode,
    countryIso2,
    phoneNumber,
    onPhoneCountryChange,
    onPhoneNumberChange,
    options,
    disabled = false,
    phoneInputId,
    phoneInputName,
    phonePlaceholder = 'Phone number',
    className = '',
}) {
    const [query, setQuery] = useState('');

    const selected = useMemo(() => {
        return resolveCountryCallingOption(options, countryCode, countryIso2) ?? options[0];
    }, [options, countryCode, countryIso2]);

    const filtered = useMemo(() => {
        const raw = query.trim();
        if (!raw) {
            return options;
        }
        const q = raw.toLowerCase();
        const qDigits = normalizeDialDigits(raw);

        return options.filter((o) => {
            const native = (countryNativeNames[o.iso2] || '').toLowerCase();
            const label = countryListLabel(o.name, o.iso2).toLowerCase();
            const codeDigits = normalizeDialDigits(o.callingCode);
            const nameMatch =
                o.name.toLowerCase().includes(q) ||
                o.iso2.toLowerCase().includes(q) ||
                o.callingCode.toLowerCase().includes(q) ||
                native.includes(q) ||
                label.includes(q);
            const digitMatch = qDigits.length > 0 && codeDigits.includes(qDigits);
            return nameMatch || digitMatch;
        });
    }, [options, query]);

    const handleSelect = (opt) => {
        onPhoneCountryChange({
            countryCode: opt?.callingCode ?? '',
            iso2: opt?.iso2 ?? '',
        });
    };

    return (
        <div className={'flex items-start gap-2 ' + (disabled ? 'opacity-60 ' : '') + className}>
            <div className="w-36 shrink-0">
                <Listbox
                    value={selected}
                    onChange={handleSelect}
                    by={optionsByComparator}
                    disabled={disabled}
                >
                    {({ open }) => (
                        <div className="relative min-h-10">
                            <ListboxButton
                                className={
                                    'flex min-h-10 w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised ' +
                                    (open
                                        ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-cursor-accent-soft dark:ring-offset-cursor-bg'
                                        : 'data-[focus]:border-indigo-500 data-[focus]:ring-2 data-[focus]:ring-indigo-500 data-[focus]:ring-offset-2 data-[focus]:ring-offset-white dark:data-[focus]:ring-cursor-accent-soft dark:data-[focus]:ring-offset-cursor-bg ') +
                                    'disabled:cursor-not-allowed'
                                }
                            >
                                <span className="text-lg leading-none" aria-hidden="true">
                                    {flagEmojiFromIso2(selected?.iso2)}
                                </span>
                                <span className="min-w-0 flex-1 truncate font-medium tabular-nums">
                                    {selected?.callingCode ?? ''}
                                </span>
                                <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
                            </ListboxButton>

                            <CountryOptionsPanel
                                open={open}
                                query={query}
                                setQuery={setQuery}
                                filtered={filtered}
                            />
                        </div>
                    )}
                </Listbox>
            </div>

            <div className="min-w-0 flex-1">
                <input
                    id={phoneInputId}
                    name={phoneInputName}
                    type="text"
                    inputMode="tel"
                    autoComplete="tel-national"
                    disabled={disabled}
                    placeholder={phonePlaceholder}
                    value={phoneNumber ?? ''}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    className="block min-h-10 w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out placeholder:text-gray-400 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised dark:focus:ring-cursor-accent-soft dark:focus:ring-offset-cursor-bg"
                />
            </div>
        </div>
    );
}
