import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    formComboboxInputClass,
    listboxPanelFilterInputClass,
} from '@/lib/dropdownMenuStyles';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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

function SupplierOptionsPanel({ open, query, setQuery, filtered }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) setQuery('');
    }, [open, setQuery]);

    useLayoutEffect(() => {
        if (!open) return;
        const id = window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        return () => window.cancelAnimationFrame(id);
    }, [open]);

    return (
        <ListboxOptions modal={false} portal anchor="bottom start" className={`z-[100] mt-1 max-h-64 min-w-[var(--button-width)] w-[var(--button-width)] overflow-hidden [--anchor-gap:4px] ${dropdownMenuPanelRingClass}`}>
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-2 pb-2 pt-1.5 dark:border-cursor-border dark:bg-cursor-surface">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className={listboxPanelFilterInputClass}
                    placeholder="Search suppliers..."
                    aria-label="Search suppliers"
                    autoComplete="off"
                />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {filtered.map((opt) => (
                    <ListboxOption key={opt.id} value={opt} className={dropdownMenuItemClass}>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{opt.display_name}</div>
                            {opt.company_name ? <div className="truncate text-xs text-gray-500">{opt.company_name}</div> : null}
                        </div>
                    </ListboxOption>
                ))}
                {filtered.length === 0 ? <div className="px-4 py-2 text-sm text-gray-500">No matches.</div> : null}
            </div>
        </ListboxOptions>
    );
}

export default function SupplierCombobox({ value, onChange, options = [], placeholder = 'Select supplier...', className = '' }) {
    const [query, setQuery] = useState('');

    const selected = useMemo(() => options.find((o) => Number(o.id) === Number(value)) ?? null, [options, value]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => [o.display_name, o.company_name].filter(Boolean).join(' ').toLowerCase().includes(q));
    }, [options, query]);

    return (
        <Listbox value={selected} onChange={(opt) => onChange(opt?.id ?? '')} by={(a, b) => a?.id === b?.id}>
            {({ open }) => (
                <div className={`relative w-full min-w-0 ${className}`.trim()}>
                    <ListboxButton className={formComboboxInputClass + ' flex w-full items-center justify-between gap-2 text-start'}>
                        <span className={selected ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg' : 'min-w-0 truncate text-gray-400 dark:text-cursor-muted'}>
                            {selected ? `${selected.display_name}${selected.company_name ? ` (${selected.company_name})` : ''}` : placeholder}
                        </span>
                        <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
                    </ListboxButton>

                    <SupplierOptionsPanel open={open} query={query} setQuery={setQuery} filtered={filtered} />
                </div>
            )}
        </Listbox>
    );
}
