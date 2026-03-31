import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { useMemo, useState } from 'react';

export default function CountryCallingCodeCombobox({
    value,
    onChange,
    options,
    placeholder = 'Select country code...',
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
                    className={
                        'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                        className
                    }
                    displayValue={(opt) => opt?.callingCode || value || ''}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                />
                <ComboboxOptions className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none">
                    {filtered.slice(0, 200).map((opt) => (
                        <ComboboxOption
                            key={`${opt.iso2}-${opt.callingCode}`}
                            value={opt}
                            className="cursor-pointer px-3 py-2 text-sm ui-active:bg-indigo-50 ui-active:text-indigo-700"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="truncate">
                                    {opt.name}{' '}
                                    <span className="text-xs text-gray-500">({opt.iso2})</span>
                                </div>
                                <div className="shrink-0 font-medium">{opt.callingCode}</div>
                            </div>
                        </ComboboxOption>
                    ))}

                    {filtered.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">No matches.</div>
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
}

