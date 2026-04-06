import { countryNativeNames } from '@/data/countryNativeNames';
import { dropdownMenuItemClass, dropdownMenuPanelRingClass, formComboboxInputClass } from '@/lib/dropdownMenuStyles';
import { countryListLabel, flagEmojiFromIso2 } from '@/lib/phoneCountryDisplay';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function optionsByComparator(a, b) {
    return a?.iso2 === b?.iso2 && a?.name === b?.name;
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
                    className="block w-full cursor-text rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 shadow-sm transition duration-150 ease-in-out placeholder:text-gray-400 selection:bg-gray-100 selection:text-gray-900 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:selection:bg-cursor-raised dark:hover:bg-cursor-raised"
                    placeholder="Search countries..."
                    aria-label="Search countries"
                    autoComplete="off"
                />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {filtered.slice(0, 200).map((opt) => (
                    <ListboxOption key={opt.iso2} value={opt} className={dropdownMenuItemClass}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg leading-none" aria-hidden="true">
                                {flagEmojiFromIso2(opt.iso2)}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                                {countryListLabel(opt.name, opt.iso2)}
                            </span>
                            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
                                {opt.iso2}
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

export default function CountryCombobox({
    value,
    onChange,
    options,
    placeholder = 'Search countries...',
    className = '',
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const raw = query.trim();
        if (!raw) {
            return options;
        }
        const q = raw.toLowerCase();

        return options.filter((o) => {
            const native = (countryNativeNames[o.iso2] || '').toLowerCase();
            const label = countryListLabel(o.name, o.iso2).toLowerCase();
            return o.name.toLowerCase().includes(q) || o.iso2.toLowerCase().includes(q) || native.includes(q) || label.includes(q);
        });
    }, [options, query]);

    const selected = useMemo(() => {
        return options.find((o) => o.name === value) ?? null;
    }, [options, value]);

    return (
        <Listbox value={selected} onChange={(opt) => onChange(opt?.name || '')} by={optionsByComparator}>
            {({ open }) => (
                <div className={`relative ${className}`.trim()}>
                    <ListboxButton
                        className={
                            formComboboxInputClass +
                            ' flex items-center justify-between gap-2 text-start ' +
                            (open
                                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-cursor-accent-soft dark:ring-offset-cursor-bg'
                                : '')
                        }
                    >
                        <span className={selected ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg' : 'min-w-0 truncate text-gray-500 dark:text-cursor-muted'}>
                            {selected ? countryListLabel(selected.name, selected.iso2) : placeholder}
                        </span>
                        <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
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
    );
}

