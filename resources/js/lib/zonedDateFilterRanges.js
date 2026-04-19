import { formatYmdInTimeZone } from '@/Components/FormDatePicker';
import { resolveIntlTimeZoneOrDefault } from '@/lib/safeIntlTimeZone';
import { subDays } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { createStaticRanges } from 'react-date-range';

export function companyTimeZoneOrDefault(timeZone) {
    return resolveIntlTimeZoneOrDefault(timeZone);
}

export function companyTodayYmd(timeZone) {
    return formatYmdInTimeZone(new Date(), companyTimeZoneOrDefault(timeZone));
}

function zonedSpan(timeZone, startYmd, endYmd) {
    const tz = companyTimeZoneOrDefault(timeZone);
    return {
        startDate: fromZonedTime(`${startYmd} 00:00:00`, tz),
        endDate: fromZonedTime(`${endYmd} 23:59:59.999`, tz),
    };
}

function ymdShiftDays(ymd, deltaDays, timeZone) {
    const tz = companyTimeZoneOrDefault(timeZone);
    const noon = fromZonedTime(`${ymd} 12:00:00`, tz);
    return formatYmdInTimeZone(subDays(noon, -deltaDays), tz);
}

function zonedMonthBoundsFromParts(y, mo, timeZone) {
    const startYmd = `${y}-${String(mo).padStart(2, '0')}-01`;
    const lastDay = new Date(y, mo, 0).getDate();
    const endYmd = `${y}-${String(mo).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return zonedSpan(timeZone, startYmd, endYmd);
}

function currentZonedYearMonth(timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: companyTimeZoneOrDefault(timeZone),
        year: 'numeric',
        month: '2-digit',
    }).formatToParts(new Date());
    const yPart = parts.find((p) => p.type === 'year');
    const mPart = parts.find((p) => p.type === 'month');
    const y = Number(yPart?.value);
    const mo = Number(mPart?.value);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 1 || mo > 12) {
        const d = new Date();
        return { y: d.getFullYear(), mo: d.getMonth() + 1 };
    }
    return { y, mo };
}

/**
 * Preset sidebar ranges for `FormDateRangeFilter`, aligned to company (or app) IANA time zone.
 */
export function buildZonedDateFilterStaticRanges(timeZone) {
    return createStaticRanges([
        {
            label: 'Today',
            range: () => {
                const ymd = companyTodayYmd(timeZone);
                return zonedSpan(timeZone, ymd, ymd);
            },
        },
        {
            label: 'Yesterday',
            range: () => {
                const t = companyTodayYmd(timeZone);
                const y = ymdShiftDays(t, -1, timeZone);
                return zonedSpan(timeZone, y, y);
            },
        },
        {
            label: 'Last 7 days',
            range: () => {
                const end = companyTodayYmd(timeZone);
                const start = ymdShiftDays(end, -6, timeZone);
                return zonedSpan(timeZone, start, end);
            },
        },
        {
            label: 'Last 30 days',
            range: () => {
                const end = companyTodayYmd(timeZone);
                const start = ymdShiftDays(end, -29, timeZone);
                return zonedSpan(timeZone, start, end);
            },
        },
        {
            label: 'This month',
            range: () => {
                const { y, mo } = currentZonedYearMonth(timeZone);
                return zonedMonthBoundsFromParts(y, mo, timeZone);
            },
        },
        {
            label: 'Last month',
            range: () => {
                let { y, mo } = currentZonedYearMonth(timeZone);
                if (mo === 1) {
                    y -= 1;
                    mo = 12;
                } else {
                    mo -= 1;
                }
                return zonedMonthBoundsFromParts(y, mo, timeZone);
            },
        },
    ]);
}
