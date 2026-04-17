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

/**
 * Leading addon for currency amount inputs (e.g. basic salary, exchange rate in local units).
 * When ISO matches the company base currency, uses `company.currency_symbol` (e.g. Rs.) so
 * behaviour matches company settings; otherwise uses Intl narrow symbol for the ISO code.
 *
 * @param {string|null|undefined} isoCode — ISO 4217
 * @param {Record<string, unknown>|null|undefined} company
 */
export function currencyAddonLabelForIso(isoCode, company) {
    const c = String(isoCode || '').trim().toUpperCase();
    if (!c) {
        return '—';
    }
    const companyCode = String(company?.currency_code || '').trim().toUpperCase();
    if (companyCode && c === companyCode) {
        const sym = String(company?.currency_symbol || '').trim();
        return sym || companyCode || c;
    }
    const locales = ['en-LK', 'en-GB', 'en-US', undefined];
    for (const loc of locales) {
        try {
            const parts = new Intl.NumberFormat(loc, {
                style: 'currency',
                currency: c,
                currencyDisplay: 'narrowSymbol',
            }).formatToParts(1);
            const sym = parts.find((p) => p.type === 'currency')?.value;
            if (sym) {
                return sym;
            }
        } catch {
            // Invalid ISO for Intl
        }
    }
    return c;
}

/**
 * @param {string|number|null|undefined} value
 * @param {number} maxFractionDigits
 * @param {{ locale?: string, minimumFractionDigits?: number, useGrouping?: boolean }} [options]
 */
export function formatMoneyInputWithCommas(value, maxFractionDigits = 2, options = {}) {
    const {
        locale = 'en-US',
        minimumFractionDigits = 0,
        useGrouping = true,
    } = options;
    const trimmed = (value ?? '').toString().trim();
    if (!trimmed) {
        return '';
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
        return trimmed;
    }
    const minFd = Math.min(Math.max(0, minimumFractionDigits), maxFractionDigits);
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: minFd,
        maximumFractionDigits: maxFractionDigits,
        useGrouping,
    }).format(num);
}

/** Strip non-numeric except one dot; same rules as employee basic salary input. */
export function normalizeMoneyInputValue(raw) {
    const v = (raw ?? '').toString();
    const cleaned = v.replace(/[^0-9.]/g, '');
    if (!cleaned) {
        return '';
    }
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
        return parts[1] !== undefined ? `${parts[0]}.${parts[1]}` : parts[0];
    }
    return `${parts[0]}.${parts.slice(1).join('')}`;
}

/**
 * Read-only amount: leading currency addon + comma-separated amount to 2 decimals.
 *
 * @param {number|string|null|undefined} amount
 * @param {string|null|undefined} isoCode
 * @param {Record<string, unknown>|null|undefined} company
 */
export function formatLocalMoneyDisplay(amount, isoCode, company) {
    const addon = currencyAddonLabelForIso(isoCode, company);
    const n = Number(amount);
    if (!Number.isFinite(n)) {
        return addon === '—' ? '—' : `${addon} —`;
    }
    const nums = formatMoneyInputWithCommas(n, 2, { minimumFractionDigits: 2 });
    return nums ? `${addon} ${nums}`.trim() : `${addon}`.trim();
}
