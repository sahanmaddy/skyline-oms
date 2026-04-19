import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { formatMoneyInputWithCommas, sanitizeMoneyDecimalInput } from '@/lib/companyFormat';
import { useCallback, useMemo, useState } from 'react';

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

const addonRightClassDefault =
    'inline-flex w-14 shrink-0 items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 transition-colors duration-150 ease-in-out group-focus-within:border-indigo-500 dark:border-cursor-border dark:bg-cursor-raised dark:text-cursor-muted dark:group-focus-within:border-cursor-accent';

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
 * Money / rate field: same shell and typography as before, controlled like `TextInput`
 * (`value` from parent, `onChange` with stored string). Input is sanitized to digits + one dot.
 * When `useThousandSeparator` is true, shows grouping commas while blurred; raw while focused.
 */
export default function AtmMoneyInput({
    id,
    label,
    addon,
    addonRight,
    value,
    onChange,
    error,
    fractionDigits = 2,
    formatOptions,
    useThousandSeparator = true,
    showLabel = true,
    dense = false,
    placeholder = '0.00',
}) {
    const [isFocused, setIsFocused] = useState(false);

    const rawDisplay = useMemo(
        () => sanitizeMoneyDecimalInput(String(value ?? '').replace(/,/g, ''), fractionDigits),
        [value, fractionDigits],
    );

    const displayValue = useMemo(() => {
        const baseFmt = {
            locale: (formatOptions && formatOptions.locale) || 'en-US',
            minimumFractionDigits:
                formatOptions && typeof formatOptions.minimumFractionDigits === 'number'
                    ? formatOptions.minimumFractionDigits
                    : 0,
        };

        if (!useThousandSeparator) {
            if (isFocused) {
                return rawDisplay;
            }
            if (!rawDisplay || rawDisplay === '.') {
                return '';
            }
            if (rawDisplay.endsWith('.')) {
                const head = rawDisplay.slice(0, -1);
                if (head === '') {
                    return rawDisplay;
                }
                const n = Number(head);
                if (!Number.isFinite(n)) {
                    return rawDisplay;
                }
                const formatted = formatMoneyInputWithCommas(n, fractionDigits, {
                    ...baseFmt,
                    useGrouping: false,
                });
                return `${formatted}.`;
            }
            const n = Number(rawDisplay);
            if (!Number.isFinite(n)) {
                return rawDisplay;
            }
            return formatMoneyInputWithCommas(n, fractionDigits, { ...baseFmt, useGrouping: false });
        }

        if (isFocused) {
            return rawDisplay;
        }
        if (!rawDisplay || rawDisplay === '.') {
            return '';
        }
        const fmtOpts = {
            ...baseFmt,
            useGrouping:
                formatOptions && formatOptions.useGrouping === false ? false : true,
        };
        if (rawDisplay.endsWith('.')) {
            const head = rawDisplay.slice(0, -1);
            if (head === '') {
                return rawDisplay;
            }
            const n = Number(head);
            if (!Number.isFinite(n)) {
                return rawDisplay;
            }
            const formatted = formatMoneyInputWithCommas(n, fractionDigits, fmtOpts);
            return `${formatted}.`;
        }
        const n = Number(rawDisplay);
        if (!Number.isFinite(n)) {
            return rawDisplay;
        }
        return formatMoneyInputWithCommas(n, fractionDigits, fmtOpts);
    }, [rawDisplay, isFocused, useThousandSeparator, fractionDigits, formatOptions]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleChange = useCallback(
        (e) => {
            const next = sanitizeMoneyDecimalInput(e.target.value, fractionDigits);
            onChange(storedFromSanitized(next, fractionDigits));
        },
        [fractionDigits, onChange],
    );

    const handleBlur = useCallback(
        (e) => {
            const t = sanitizeMoneyDecimalInput(String(e.target.value).replace(/,/g, ''), fractionDigits);
            onChange(storedFromSanitized(t, fractionDigits));
            setIsFocused(false);
        },
        [fractionDigits, onChange],
    );

    const addonClass = dense ? addonClassDense : addonClassDefault;
    const inputCore = dense ? inputCoreDense : inputCoreDefault;
    const rounding =
        addon && addonRight
            ? 'rounded-none border-r-0'
            : addon
              ? 'rounded-none rounded-r-md'
              : addonRight
                ? 'rounded-l-md rounded-none border-r-0'
                : 'rounded-md';
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
                    value={displayValue}
                    placeholder={placeholder}
                    onFocus={handleFocus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                {addonRight ? <div className={addonRightClassDefault}>{addonRight}</div> : null}
            </div>
            {error ? <InputError className="mt-2" message={error} /> : null}
        </div>
    );
}

export const atmMoneyInputShellWithLabelClass = shellClassWithLabel;
export const atmMoneyInputShellNoLabelClass = shellClassNoLabel;
export const atmMoneyInputAddonLeftDefaultClass = addonClassDefault;
export const atmMoneyInputInputRightOfLeftAddonClass = `${inputCoreDefault} rounded-none rounded-r-md text-right [unicode-bidi:plaintext]`;
export const atmMoneyInputAddonRightDefaultClass = addonRightClassDefault;
export const atmMoneyInputInputLeftOfRightAddonClass = `${inputCoreDefault} rounded-l-md rounded-none border-r-0 text-right [unicode-bidi:plaintext]`;
