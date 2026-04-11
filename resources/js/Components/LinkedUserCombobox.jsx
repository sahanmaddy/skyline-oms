import {
    dropdownMenuItemClass,
    dropdownMenuPanelRingClass,
    formComboboxInputClass,
    listboxPanelFilterInputClass,
} from '@/lib/dropdownMenuStyles';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const NOT_LINKED = { _kind: 'none' };

function optionsByComparator(a, b) {
    if (a?._kind === 'none' && b?._kind === 'none') {
        return true;
    }
    if (a?._kind !== 'user' || b?._kind !== 'user') {
        return false;
    }
    return Number(a.id) === Number(b.id);
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

function formatRow(u) {
    const name = (u.name || '').trim();
    const email = (u.email || '').trim();
    if (!name && !email) {
        return '—';
    }
    if (!email) {
        return name;
    }
    if (!name) {
        return email;
    }
    return `${name} (${email})`;
}

function UserOptionsPanel({ open, query, setQuery, filtered, notLinkedLabel }) {
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
                    placeholder="Search by name or email…"
                    aria-label="Search users"
                    autoComplete="off"
                />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
                {filtered.map((opt) =>
                    opt._kind === 'none' ? (
                        <ListboxOption
                            key="__none__"
                            value={opt}
                            className={dropdownMenuItemClass}
                        >
                            {notLinkedLabel}
                        </ListboxOption>
                    ) : (
                        <ListboxOption
                            key={opt.id}
                            value={opt}
                            className={dropdownMenuItemClass}
                        >
                            <span className="min-w-0 truncate">{formatRow(opt)}</span>
                        </ListboxOption>
                    ),
                )}
                {filtered.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-cursor-muted">
                        No matches.
                    </div>
                )}
            </div>
        </ListboxOptions>
    );
}

/**
 * Searchable linked-user picker (same panel pattern as {@link CountryCombobox} / LinkedEmployeeCombobox).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {number|string|''|null|undefined} props.value — user id or empty
 * @param {Array<{ id: number, name?: string, email?: string, branch_id?: number }>} props.users
 * @param {(user: object | null) => void} props.onChange — `null` when cleared
 * @param {string} [props.notLinkedLabel]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 */
export default function LinkedUserCombobox({
    id,
    value,
    users,
    onChange,
    notLinkedLabel = '— Not linked —',
    placeholder = '— Not linked —',
    className = '',
}) {
    const [query, setQuery] = useState('');

    const optionItems = useMemo(
        () => [NOT_LINKED, ...users.map((u) => ({ _kind: 'user', ...u }))],
        [users],
    );

    const filtered = useMemo(() => {
        const raw = query.trim();
        if (!raw) {
            return optionItems;
        }
        const q = raw.toLowerCase().replace(/\s+/g, ' ');
        const qCompact = q.replace(/\s/g, '');

        return optionItems.filter((o) => {
            if (o._kind === 'none') {
                const label = notLinkedLabel.toLowerCase();
                return (
                    label.includes(q) ||
                    'not linked'.replace(/\s/g, '').includes(qCompact) ||
                    'unlinked'.includes(q) ||
                    q === '—'
                );
            }
            const name = (o.name || '').toLowerCase();
            const email = (o.email || '').toLowerCase();
            const row = formatRow(o).toLowerCase();
            return (
                name.includes(q) ||
                email.includes(q) ||
                row.includes(q) ||
                String(o.id).includes(qCompact)
            );
        });
    }, [optionItems, query, notLinkedLabel]);

    const selected = useMemo(() => {
        if (value === '' || value == null) {
            return NOT_LINKED;
        }
        const idNum = Number(value);
        const found = users.find((u) => Number(u.id) === idNum);
        if (!found) {
            return NOT_LINKED;
        }
        return { _kind: 'user', ...found };
    }, [value, users]);

    const displayLabel = selected._kind === 'user' ? formatRow(selected) : null;

    return (
        <Listbox
            value={selected}
            by={optionsByComparator}
            onChange={(opt) => {
                if (!opt || opt._kind === 'none') {
                    onChange(null);
                    return;
                }
                onChange(opt);
            }}
        >
            {({ open }) => (
                <div className={`relative w-full min-w-0 ${className}`.trim()}>
                    <ListboxButton
                        id={id}
                        className={
                            formComboboxInputClass +
                            ' flex w-full min-w-0 items-center justify-between gap-2 text-start ' +
                            (open
                                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-cursor-accent-soft dark:ring-offset-cursor-bg'
                                : '')
                        }
                    >
                        <span
                            className={
                                displayLabel
                                    ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg'
                                    : 'min-w-0 truncate text-gray-500 dark:text-cursor-muted'
                            }
                        >
                            {displayLabel ?? placeholder}
                        </span>
                        <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
                    </ListboxButton>

                    <UserOptionsPanel
                        open={open}
                        query={query}
                        setQuery={setQuery}
                        filtered={filtered}
                        notLinkedLabel={notLinkedLabel}
                    />
                </div>
            )}
        </Listbox>
    );
}
