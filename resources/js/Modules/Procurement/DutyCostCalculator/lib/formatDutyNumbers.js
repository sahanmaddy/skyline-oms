/**
 * Read-only display helpers for duty calculator numeric fields.
 */

/**
 * @param {string|number|null|undefined} value
 * @returns {string|null} null when empty / not applicable
 */
export function formatAnnualPercentRateDisplay(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const n = Number(String(value).replace(/,/g, ''));
    if (!Number.isFinite(n)) {
        return `${value}%`;
    }
    return `${n.toFixed(2)}%`;
}

/**
 * Quantity / weight style: no decimal part when the value is a whole number;
 * otherwise show up to `maxFractionDigits` (trailing zeros dropped).
 *
 * @param {string|number|null|undefined} value
 * @param {number} maxFractionDigits
 * @returns {string|null} null when empty
 */
export function formatMeasuredNumberForDisplay(value, maxFractionDigits) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const n = Number(String(value).replace(/,/g, ''));
    if (!Number.isFinite(n)) {
        return String(value);
    }
    const rounded = Number(n.toFixed(maxFractionDigits));
    if (!Number.isFinite(rounded)) {
        return String(value);
    }
    return String(rounded);
}
