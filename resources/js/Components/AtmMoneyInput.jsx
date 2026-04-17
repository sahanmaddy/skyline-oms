import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { formatMoneyInputWithCommas } from '@/lib/companyFormat';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const MAX_MINOR = Number.MAX_SAFE_INTEGER - 1;

const shellClassWithLabel =
    'mt-1 flex items-stretch rounded-md transition duration-150 ease-in-out focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg';

const shellClassNoLabel =
    'flex items-stretch rounded-md transition duration-150 ease-in-out focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg';

const addonClassDefault =
    'inline-flex min-w-14 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted';

const addonClassDense =
    'inline-flex min-w-10 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-1.5 text-xs text-gray-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted';

const inputCoreDefault =
    'block min-h-10 w-full min-w-0 border border-gray-300 bg-white px-3 py-2 text-sm leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised';

const inputCoreDense =
    'block min-h-8 w-full min-w-0 border border-gray-300 bg-white px-2 py-1 text-xs leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised';

function minorFromValue(value, fractionDigits) {
    const s = String(value ?? '')
        .replace(/,/g, '')
        .trim();
    if (!s) {
        return 0;
    }
    const n = Number(s);
    if (!Number.isFinite(n)) {
        return 0;
    }
    return Math.min(Math.round(n * 10 ** fractionDigits), MAX_MINOR);
}

function minorToStored(minor, fractionDigits) {
    if (minor === 0) {
        return '';
    }
    const n = minor / 10 ** fractionDigits;
    return String(parseFloat(n.toFixed(fractionDigits)));
}

function formatMinorDisplay(minor, fractionDigits, formatOptions) {
    const n = minor / 10 ** fractionDigits;
    return formatMoneyInputWithCommas(String(n), fractionDigits, formatOptions);
}

/**
 * ATM-style entry: each digit appends as the least significant digit (right); Backspace/Delete
 * drops the last digit. Thousands separator and decimal padding via en-US Intl.
 * Shell matches Basic Salary / Credit Limit (addon + field).
 */
export default function AtmMoneyInput({
    id,
    label,
    addon,
    value,
    onChange,
    error,
    fractionDigits = 2,
    formatOptions,
    showLabel = true,
    dense = false,
    placeholder = '0.00',
}) {
    const inputRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const minorRef = useRef(0);
    const [minor, setMinor] = useState(() => minorFromValue(value, fractionDigits));
    const prevExternalValue = useRef(value);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        minorRef.current = minor;
    }, [minor]);

    useEffect(() => {
        if (value !== prevExternalValue.current) {
            prevExternalValue.current = value;
            const next = minorFromValue(value, fractionDigits);
            minorRef.current = next;
            setMinor(next);
        }
    }, [value, fractionDigits]);

    const resolvedFormatOptions = formatOptions ?? {
        locale: 'en-US',
        minimumFractionDigits: Math.min(2, fractionDigits),
    };

    const displayValue = formatMinorDisplay(minor, fractionDigits, resolvedFormatOptions);

    useLayoutEffect(() => {
        const el = inputRef.current;
        if (!el || document.activeElement !== el) {
            return;
        }
        const len = el.value.length;
        el.setSelectionRange(len, len);
    }, [minor, displayValue]);

    const applyMinor = useCallback(
        (next) => {
            const clamped = Math.min(Math.max(0, next), MAX_MINOR);
            minorRef.current = clamped;
            setMinor(clamped);
            const stored = minorToStored(clamped, fractionDigits);
            prevExternalValue.current = stored;
            onChangeRef.current(stored);
        },
        [fractionDigits],
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }
            if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') {
                return;
            }

            const el = inputRef.current;
            const len = el?.value.length ?? 0;
            const start = el?.selectionStart ?? 0;
            const end = el?.selectionEnd ?? 0;
            const selectAll = len > 0 && start === 0 && end === len;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
                e.preventDefault();
                queueMicrotask(() => {
                    const input = inputRef.current;
                    if (input) {
                        const l = input.value.length;
                        input.setSelectionRange(l, l);
                    }
                });
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                const digit = e.key.charCodeAt(0) - 48;
                const base = selectAll ? 0 : minorRef.current;
                applyMinor(base * 10 + digit);
                return;
            }

            if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                const base = selectAll ? 0 : minorRef.current;
                applyMinor(Math.floor(base / 10));
                return;
            }

            if (e.key.length === 1 && !e.metaKey) {
                e.preventDefault();
            }
        },
        [applyMinor],
    );

    const handlePaste = useCallback(
        (e) => {
            e.preventDefault();
            const raw = e.clipboardData.getData('text').replace(/,/g, '').trim();
            if (!raw) {
                applyMinor(0);
                return;
            }
            const n = Number(raw);
            if (!Number.isFinite(n)) {
                return;
            }
            const next = Math.min(Math.round(n * 10 ** fractionDigits), MAX_MINOR);
            applyMinor(next);
        },
        [applyMinor, fractionDigits],
    );

    const addonClass = dense ? addonClassDense : addonClassDefault;
    const inputCore = dense ? inputCoreDense : inputCoreDefault;
    const rounding = addon ? 'rounded-none rounded-r-md' : 'rounded-md';
    const inputClass = `${inputCore} ${rounding} text-right [unicode-bidi:plaintext]`;

    const shellClass = showLabel && label ? shellClassWithLabel : shellClassNoLabel;

    return (
        <div>
            {showLabel && label ? <InputLabel htmlFor={id} value={label} /> : null}
            <div className={shellClass}>
                {addon ? <div className={addonClass}>{addon}</div> : null}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    inputMode="numeric"
                    readOnly
                    autoComplete="off"
                    spellCheck={false}
                    dir="ltr"
                    className={inputClass}
                    value={displayValue}
                    placeholder={placeholder}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                />
            </div>
            {error ? <InputError className="mt-2" message={error} /> : null}
        </div>
    );
}
