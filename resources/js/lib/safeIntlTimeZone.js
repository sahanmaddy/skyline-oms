/**
 * Returns `timeZone` if it is valid for `Intl`, otherwise `undefined` (runtime default).
 */
export function normalizeIntlTimeZone(timeZone) {
    const t = typeof timeZone === 'string' ? timeZone.trim() : '';
    if (!t) {
        return undefined;
    }
    try {
        new Intl.DateTimeFormat(undefined, { timeZone: t }).format(new Date());
        return t;
    } catch {
        return undefined;
    }
}

/** Valid IANA zone, or the host default (never throws). */
export function resolveIntlTimeZoneOrDefault(timeZone) {
    return normalizeIntlTimeZone(timeZone) ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}
