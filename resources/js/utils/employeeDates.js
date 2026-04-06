/**
 * Convert API / serialized dates to Y-m-d for date fields (e.g. FormDatePicker / legacy inputs).
 * Uses Asia/Colombo so calendar dates match Laravel (avoids UTC off-by-one).
 */
export function normalizeDateInputForForm(value) {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        if (value.includes('T')) {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                return new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Colombo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).format(parsed);
            }
        }

        return value;
    }

    if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Colombo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(value);
        }

        return '';
    }

    return '';
}
