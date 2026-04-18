import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { sanitizeMoneyDecimalInput } from '@/lib/companyFormat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const shellClassWithLabel =
    'group mt-1 flex items-stretch rounded-md transition duration-150 ease-in-out focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg';

const shellClassNoLabel =
    'group flex items-stretch rounded-md transition duration-150 ease-in-out focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-cursor-accent-soft dark:focus-within:ring-offset-cursor-bg';

const addonClassDefault =
    'inline-flex w-14 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 transition-colors duration-150 ease-in-out group-focus-within:border-indigo-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted dark:group-focus-within:border-cursor-accent';

const addonClassDense =
    'inline-flex w-10 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-1.5 py-1 text-xs text-gray-500 transition-colors duration-150 ease-in-out group-focus-within:border-indigo-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted dark:group-focus-within:border-cursor-accent';

const inputCoreDefault =
    'block min-h-10 w-full min-w-0 border border-gray-300 bg-white px-3 py-2 text-sm leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised';

const inputCoreDense =
    'block min-h-8 w-full min-w-0 border border-gray-300 bg-white px-2 py-1 text-xs leading-5 text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised';

function defaultFormatOptions(fractionDigits) {
    return {
        locale: 'en-US',
        minimumFractionDigits: Math.min(2, fractionDigits),
    };
}

/**
 * Plain text for the input (no thousands separators) so native undo matches duty-style fields.
 * Applies minimumFractionDigits only when the value is a complete number (not ending with `.`).
 */
function valuePropToPlainDisplay(value, fractionDigits, formatOpts) {
    const cleaned = sanitizeMoneyDecimalInput(String(value ?? '').replace(/,/g, ''), fractionDigits);
    if (!cleaned || cleaned === '.') {
        return '';
    }
    if (cleaned.endsWith('.')) {
        const head = cleaned.slice(0, -1);
        if (head === '') {
            return '';
        }
        const nv = Number(head);
        if (!Number.isFinite(nv)) {
            return cleaned;
        }
        if (nv === 0) {
            return '';
        }
        return cleaned;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n)) {
        return cleaned;
    }
    if (n === 0) {
        return '';
    }
    const minFd = Math.min(Math.max(0, formatOpts.minimumFractionDigits ?? 0), fractionDigits);
    return new Intl.NumberFormat(formatOpts.locale ?? 'en-US', {
        useGrouping: false,
        minimumFractionDigits: minFd,
        maximumFractionDigits: fractionDigits,
    }).format(n);
}

/**
 * Map sanitized field text to the string stored in form state / echoed from the server.
 * Keeps a trailing `.` while the user is still typing the fractional part.
 */
function storedFromSanitized(t, fractionDigits) {
    if (!t || t === '.') {
        return '';
    }
    if (t.endsWith('.')) {
        const head = t.slice(0, -1);
        if (head === '') {
            return '';
        }
        const n = Number(head);
        if (!Number.isFinite(n)) {
            return '';
        }
        return t;
    }
    const n = Number(t);
    if (!Number.isFinite(n)) {
        return '';
    }
    if (n === 0) {
        return '';
    }
    return String(parseFloat(n.toFixed(fractionDigits)));
}

/**
 * Money / rate field with optional leading addon (currency label). Standard decimal typing.
 * The value is always shown without grouping separators so browser undo/redo behaves like plain inputs.
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
    const onChangeRef = useRef(onChange);
    const prevExternalValue = useRef(value);
    const resolvedFormatOptions = useMemo(
        () => formatOptions ?? defaultFormatOptions(fractionDigits),
        [formatOptions, fractionDigits],
    );
    const [text, setText] = useState(() =>
        valuePropToPlainDisplay(value, fractionDigits, formatOptions ?? defaultFormatOptions(fractionDigits)),
    );

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const incoming = value === undefined || value === null ? '' : String(value);
        const prev = prevExternalValue.current === undefined || prevExternalValue.current === null ? '' : String(prevExternalValue.current);
        if (incoming.replace(/,/g, '') !== prev.replace(/,/g, '')) {
            prevExternalValue.current = value;
            setText(valuePropToPlainDisplay(value, fractionDigits, resolvedFormatOptions));
        }
    }, [value, fractionDigits, resolvedFormatOptions]);

    const handleChange = useCallback(
        (e) => {
            const next = sanitizeMoneyDecimalInput(e.target.value, fractionDigits);
            setText(next);
            const stored = storedFromSanitized(next, fractionDigits);
            prevExternalValue.current = stored;
            onChangeRef.current(stored);
        },
        [fractionDigits],
    );

    const handleBlur = useCallback(() => {
        const t = sanitizeMoneyDecimalInput(String(text).replace(/,/g, ''), fractionDigits);
        const n = Number(t.endsWith('.') ? t.slice(0, -1) : t);
        let stored = '';
        if (t && t !== '.' && Number.isFinite(n)) {
            stored = n === 0 ? '' : String(parseFloat(n.toFixed(fractionDigits)));
        }
        prevExternalValue.current = stored;
        onChangeRef.current(stored);
        setText(valuePropToPlainDisplay(stored, fractionDigits, resolvedFormatOptions));
    }, [text, fractionDigits, resolvedFormatOptions]);

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
                    id={id}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    dir="ltr"
                    className={inputClass}
                    value={text}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
            {error ? <InputError className="mt-2" message={error} /> : null}
        </div>
    );
}

/** Use with composite fields so focus ring / borders match AtmMoneyInput (e.g. Freight Exchange Rate). */
export const atmMoneyInputShellWithLabelClass = shellClassWithLabel;
export const atmMoneyInputShellNoLabelClass = shellClassNoLabel;
export const atmMoneyInputAddonLeftDefaultClass = addonClassDefault;
export const atmMoneyInputInputRightOfLeftAddonClass = `${inputCoreDefault} rounded-none rounded-r-md text-right [unicode-bidi:plaintext]`;
export const atmMoneyInputAddonRightDefaultClass =
    'inline-flex w-14 shrink-0 items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 transition-colors duration-150 ease-in-out group-focus-within:border-indigo-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted dark:group-focus-within:border-cursor-accent';
export const atmMoneyInputInputLeftOfRightAddonClass = `${inputCoreDefault} rounded-l-md rounded-none border-r-0 text-right [unicode-bidi:plaintext]`;
