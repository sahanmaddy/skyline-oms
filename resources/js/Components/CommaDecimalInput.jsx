import {
    formatMoneyInputWithCommas,
    sanitizeDecimalNumericInputMaxFractionDigits,
} from '@/lib/companyFormat';
import { useCallback, useMemo, useState } from 'react';

/**
 * Right-aligned decimal text input: raw while focused, grouped with commas when blurred.
 */
export default function CommaDecimalInput({
    id,
    className = '',
    value,
    onChange,
    maxFractionDigits = 4,
    ...rest
}) {
    const [isFocused, setIsFocused] = useState(false);

    const raw = useMemo(
        () =>
            sanitizeDecimalNumericInputMaxFractionDigits(
                String(value ?? '').replace(/,/g, ''),
                maxFractionDigits,
            ),
        [value, maxFractionDigits],
    );

    const display = useMemo(() => {
        if (isFocused) {
            return raw;
        }
        if (!raw || raw === '.') {
            return '';
        }
        const fmt = { minimumFractionDigits: 0, useGrouping: true, locale: 'en-US' };
        if (raw.endsWith('.')) {
            const head = raw.slice(0, -1);
            if (head === '') {
                return raw;
            }
            const n = Number(head);
            if (!Number.isFinite(n)) {
                return raw;
            }
            return `${formatMoneyInputWithCommas(n, maxFractionDigits, fmt)}.`;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
            return raw;
        }
        return formatMoneyInputWithCommas(n, maxFractionDigits, fmt);
    }, [raw, isFocused, maxFractionDigits]);

    const commit = useCallback(
        (rawInput) => {
            onChange(sanitizeDecimalNumericInputMaxFractionDigits(rawInput, maxFractionDigits));
        },
        [onChange, maxFractionDigits],
    );

    return (
        <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            className={className}
            value={display}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => commit(e.target.value)}
            onBlur={(e) => {
                commit(e.target.value);
                setIsFocused(false);
            }}
            {...rest}
        />
    );
}
