import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    formComboboxInputClass,
    listboxPanelFilterInputClass,
} from '@/lib/dropdownMenuStyles';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function optionsByComparator(a, b) {
    return a?.code === b?.code;
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

function CurrencyOptionsPanel({ open, query, setQuery, filtered }) {
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
            className={`z-[100] mt-1 max-h-64 min-w-[var(--button-width)] w-[var(--button-width)] overflow-hidden [--anchor-gap:4px] ${dropdownMenuPanelRingClass}`}
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
                    placeholder="Search currency code..."
                    aria-label="Search currency code"
                    autoComplete="off"
                />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {filtered.map((opt) => (
                    <ListboxOption key={opt.code} value={opt} className={dropdownMenuItemClass}>
                        <div className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate">{opt.name}</span>
                            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
                                {opt.code}
                            </span>
                        </div>
                    </ListboxOption>
                ))}
                {filtered.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-cursor-muted">
                        No matches.
                    </div>
                )}
            </div>
        </ListboxOptions>
    );
}

export default function CurrencyCodeCombobox({
    value,
    onChange,
    options,
    disabled = false,
    placeholder = 'Select currency code...',
    className = '',
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const raw = query.trim().toLowerCase();
        if (!raw) {
            return options;
        }
        return options.filter((o) => {
            return o.code.toLowerCase().includes(raw) || o.name.toLowerCase().includes(raw);
        });
    }, [options, query]);

    const selected = useMemo(() => {
        return options.find((o) => o.code === value) ?? null;
    }, [options, value]);

    return (
        <Listbox value={selected} onChange={(opt) => onChange(opt?.code || '')} by={optionsByComparator} disabled={disabled}>
            {({ open }) => (
                <div className={`relative w-full min-w-0 ${className}`.trim()}>
                    <ListboxButton
                        className={
                            formComboboxInputClass +
                            ' flex w-full min-w-0 items-center justify-between gap-2 text-start ' +
                            (open
                                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-cursor-accent-soft dark:ring-offset-cursor-bg'
                                : '') +
                            (disabled ? ' cursor-not-allowed opacity-60' : '')
                        }
                    >
                        <span
                            className={
                                selected
                                    ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg'
                                    : 'min-w-0 truncate text-gray-400 dark:text-cursor-muted'
                            }
                        >
                            {selected ? `${selected.name} (${selected.code})` : placeholder}
                        </span>
                        <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
                    </ListboxButton>

                    <CurrencyOptionsPanel
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
