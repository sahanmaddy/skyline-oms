import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    formComboboxInputClass,
} from '@/lib/dropdownMenuStyles';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { useMemo, useState } from 'react';

export default function CountryCallingCodeCombobox({
    value,
    onChange,
    options,
    placeholder = 'Select code...',
    className = '',
}) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => {
            return (
                o.name.toLowerCase().includes(q) ||
                o.iso2.toLowerCase().includes(q) ||
                o.callingCode.toLowerCase().includes(q)
            );
        });
    }, [options, query]);

    const selected = useMemo(() => {
        return options.find((o) => o.callingCode === value) || null;
    }, [options, value]);

    return (
        <Combobox value={selected} onChange={(opt) => onChange(opt?.callingCode || '')}>
            <div className="relative">
                <ComboboxInput
                    className={formComboboxInputClass + ' ' + className}
                    displayValue={(opt) => opt?.callingCode || value || ''}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                />
                <ComboboxOptions
                    className={`absolute z-30 mt-1 max-h-56 w-full overflow-auto ${dropdownMenuPanelRingClass}`}
                >
                    {filtered.slice(0, 200).map((opt) => (
                        <ComboboxOption
                            key={`${opt.iso2}-${opt.callingCode}`}
                            value={opt}
                            className={dropdownMenuItemClass}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="truncate">
                                    {opt.name}{' '}
                                    <span className="text-xs text-gray-500">({opt.iso2})</span>
                                </div>
                                <div className="shrink-0 font-medium tabular-nums text-gray-500">
                                    {opt.callingCode}
                                </div>
                            </div>
                        </ComboboxOption>
                    ))}

                    {filtered.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">No matches.</div>
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
}

