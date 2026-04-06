import { countryNativeNames } from '@/data/countryNativeNames';

/**
 * Resolve the list option for a stored country_code when several share the same dial code (e.g. +1).
 * Uses country_iso2 when present; for legacy +1 without iso2, prefers United States over Canada.
 */
export function resolveCountryCallingOption(options, countryCode, countryIso2) {
    if (!options?.length) {
        return null;
    }
    const cc = countryCode || '';
    const matches = options.filter((o) => o.callingCode === cc);
    if (matches.length === 0) {
        return options.find((o) => o.callingCode === '+94') || options[0];
    }
    const iso = (countryIso2 && String(countryIso2).trim()) || '';
    if (iso.length === 2) {
        const upper = iso.toUpperCase();
        const byIso = matches.find((o) => o.iso2.toUpperCase() === upper);
        if (byIso) {
            return byIso;
        }
    }
    if (matches.length > 1 && cc === '+1') {
        const us = matches.find((o) => o.iso2 === 'US');
        if (us) {
            return us;
        }
    }
    return matches[0];
}

export function flagEmojiFromIso2(iso2) {
    if (!iso2 || typeof iso2 !== 'string' || iso2.length !== 2) {
        return '';
    }
    const upper = iso2.toUpperCase();
    const codePoints = [...upper].map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function countryListLabel(name, iso2) {
    const native = countryNativeNames[iso2?.toUpperCase?.() ?? ''];
    if (native && native !== name) {
        return `${name} (${native})`;
    }
    return name;
}
