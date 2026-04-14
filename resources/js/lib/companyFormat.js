/**
 * Currency and date helpers driven by shared Inertia `company` props.
 * Do not hardcode currency symbols in modules — use these helpers.
 */

/**
 * @param {number|string|null|undefined} amount
 * @param {Record<string, unknown>|null|undefined} company — `usePage().props.company`
 */
export function formatCompanyCurrency(amount, company) {
    const n = Number(amount);
    if (Number.isNaN(n)) {
        return '';
    }
    const symbol = (company && company.currency_symbol) || '';
    const code = (company && company.currency_code) || '';
    const pattern = (company && company.currency_format) || '{symbol} {amount}';
    const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
    return pattern
        .replaceAll('{symbol}', String(symbol))
        .replaceAll('{code}', String(code))
        .replaceAll('{amount}', formatted)
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * @param {string|Date|null|undefined} value
 * @param {Record<string, unknown>|null|undefined} company
 * @param {Intl.DateTimeFormatOptions} options
 */
export function formatCompanyDateTime(value, company, options = {}) {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    const tz = (company && company.time_zone) || undefined;
    return new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    }).format(d);
}

/**
 * Date-only display (no time-of-day shift issues for YYYY-MM-DD strings).
 * @param {string|null|undefined} value — ISO date string
 * @param {Record<string, unknown>|null|undefined} company
 */
export function formatCompanyDate(value, company) {
    if (!value) {
        return '';
    }
    const tz = (company && company.time_zone) || undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [y, m, d] = String(value).split('-').map(Number);
        const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
        return new Intl.DateTimeFormat(undefined, {
            timeZone: tz,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(utc);
    }
    return formatCompanyDateTime(value, company, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
