const fallbackCodes = [
    'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'SGD', 'HKD', 'CNY', 'INR', 'LKR',
    'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'ZAR', 'NGN', 'KES', 'GHS', 'PKR', 'BDT',
    'NPR', 'MVR', 'MYR', 'THB', 'IDR', 'PHP', 'VND', 'KRW', 'TWD', 'MOP', 'BRL', 'MXN', 'ARS',
    'CLP', 'COP', 'PEN', 'UYU', 'BOB', 'PYG', 'CRC', 'DOP', 'JMD', 'TTD', 'RUB', 'UAH', 'TRY',
    'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'DKK', 'SEK', 'NOK', 'ISK'
];

const currencyDisplayNames =
    typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
        ? new Intl.DisplayNames(['en'], { type: 'currency' })
        : null;

function resolveCodes() {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
        return Intl.supportedValuesOf('currency');
    }
    return fallbackCodes;
}

export const currencyCodes = resolveCodes()
    .map((code) => ({
        code,
        name: currencyDisplayNames?.of(code) || code,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
