import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    formNativeSelectClass,
} from '@/lib/dropdownMenuStyles';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

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

const formSelectOptionClass = `${dropdownMenuItemClass} data-[selected]:font-medium`;

/**
 * Custom select: closed trigger matches form fields; open list matches action menu panels.
 *
 * @param {Array<{ value: string | number | boolean, label: React.ReactNode, disabled?: boolean }>} options
 */
export default function FormSelect({
    id,
    name,
    form,
    value,
    onChange,
    options,
    disabled = false,
    className = '',
    triggerClassName = formNativeSelectClass,
    buttonClassName = '',
    placeholder = 'Select…',
    'aria-label': ariaLabel,
}) {
    const selected = options.find((o) => Object.is(o.value, value));
    const displayLabel = selected?.label ?? placeholder;

    const openRingClass =
        'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:border-cursor-accent dark:ring-cursor-accent-soft dark:ring-offset-cursor-bg';

    return (
        <div className={`relative ${className}`.trim()}>
            <Listbox value={value} onChange={onChange} disabled={disabled} name={name} form={form}>
                {({ open }) => (
                    <>
                        <ListboxButton
                            id={id}
                            aria-label={ariaLabel}
                            className={[
                                triggerClassName,
                                'flex w-full min-w-0 items-center justify-between gap-2 text-start',
                                'disabled:cursor-not-allowed disabled:opacity-60',
                                open ? openRingClass : '',
                                buttonClassName,
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <span
                                className={
                                    selected
                                        ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg'
                                        : 'min-w-0 truncate text-gray-500 dark:text-cursor-muted'
                                }
                            >
                                {displayLabel}
                            </span>
                            <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions
                            modal={false}
                            portal
                            transition
                            anchor="bottom start"
                            className={
                                'z-[100] mt-1 max-h-60 min-w-[var(--button-width)] w-[var(--button-width)] overflow-auto [--anchor-gap:4px] data-[closed]:opacity-0 data-[enter]:transition data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:transition data-[leave]:duration-75 data-[leave]:ease-in ' +
                                dropdownMenuPanelRingClass
                            }
                        >
                            {options.map((opt, index) => (
                                <ListboxOption
                                    key={`${String(opt.value)}-${index}`}
                                    value={opt.value}
                                    disabled={opt.disabled}
                                    className={formSelectOptionClass}
                                >
                                    {opt.label}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </>
                )}
            </Listbox>
        </div>
    );
}
