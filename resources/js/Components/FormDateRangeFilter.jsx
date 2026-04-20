import { FORM_DATE_PICKER_ACCENT, formatYmdInTimeZone, parseYmdToLocalDate } from '@/Components/FormDatePicker';
import { formComboboxInputSurfaceClass } from '@/lib/dropdownMenuStyles';
import {
    buildZonedDateFilterStaticRanges,
    companyTimeZoneOrDefault,
    companyTodayYmd,
} from '@/lib/zonedDateFilterRanges';
import { Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const formDatePickerTriggerOpenRingClass =
    'aria-expanded:border-indigo-500 aria-expanded:ring-2 aria-expanded:ring-indigo-500 aria-expanded:ring-offset-2 aria-expanded:ring-offset-white dark:aria-expanded:ring-cursor-accent-soft dark:aria-expanded:ring-offset-cursor-bg';

function ChevronDownIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
            />
        </svg>
    );
}

function clampDateToMax(date, maxDate) {
    if (!date || !maxDate) {
        return date;
    }
    return date.getTime() > maxDate.getTime() ? maxDate : date;
}

function buildRangesFromFilters(dateFrom, dateTo, maxDate = null) {
    const start = parseYmdToLocalDate(dateFrom);
    const end = parseYmdToLocalDate(dateTo);
    if (start && end) {
        let endClamped = clampDateToMax(end, maxDate) ?? end;
        let startClamped = clampDateToMax(start, maxDate) ?? start;
        if (startClamped.getTime() > endClamped.getTime()) {
            startClamped = endClamped;
        }
        return [{ startDate: startClamped, endDate: endClamped, key: 'selection', color: FORM_DATE_PICKER_ACCENT }];
    }
    if (start && !end) {
        const s = clampDateToMax(start, maxDate) ?? start;
        return [{ startDate: s, endDate: s, key: 'selection', color: FORM_DATE_PICKER_ACCENT }];
    }
    if (!start && end) {
        const e = clampDateToMax(end, maxDate) ?? end;
        return [{ startDate: e, endDate: e, key: 'selection', color: FORM_DATE_PICKER_ACCENT }];
    }
    const now = new Date();
    let startDate = startOfMonth(now);
    let endDate = endOfMonth(now);
    if (maxDate) {
        if (endDate.getTime() > maxDate.getTime()) {
            endDate = maxDate;
        }
        if (startDate.getTime() > endDate.getTime()) {
            startDate = endDate;
        }
    }
    return [
        {
            startDate,
            endDate,
            key: 'selection',
            color: FORM_DATE_PICKER_ACCENT,
        },
    ];
}

function formatRangeLabel(dateFrom, dateTo) {
    const start = parseYmdToLocalDate(dateFrom);
    const end = parseYmdToLocalDate(dateTo);
    if (start && end) {
        return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
    }
    if (start) {
        return `${format(start, 'd MMM yyyy')} – …`;
    }
    if (end) {
        return `… – ${format(end, 'd MMM yyyy')}`;
    }
    return null;
}

function DateRangePanel({ ranges, setRanges, onApply, triggerRef, hasAppliedRange, staticRanges, formatYmdForApply, maxDate }) {
    const close = useClose();

    function closeKeepingTriggerRing() {
        triggerRef?.current?.focus({ preventScroll: true });
        close();
    }

    return (
        <div className="overflow-hidden rounded-md bg-white p-2 dark:bg-cursor-surface">
            <div className="form-date-picker-theme max-w-full overflow-x-auto [&_.rdrCalendarWrapper]:bg-transparent [&_.rdrMonth]:w-full">
                <DateRangePicker
                    ranges={ranges}
                    onChange={(item) => {
                        const sel = item?.selection;
                        if (!sel?.startDate || !sel?.endDate) {
                            return;
                        }
                        let startDate = sel.startDate;
                        let endDate = sel.endDate;
                        if (maxDate) {
                            endDate = clampDateToMax(endDate, maxDate) ?? endDate;
                            startDate = clampDateToMax(startDate, maxDate) ?? startDate;
                            if (startDate.getTime() > endDate.getTime()) {
                                startDate = endDate;
                            }
                        }
                        setRanges([
                            { startDate, endDate, key: 'selection', color: FORM_DATE_PICKER_ACCENT },
                        ]);
                    }}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                    showDateDisplay={false}
                    color={FORM_DATE_PICKER_ACCENT}
                    rangeColors={[FORM_DATE_PICKER_ACCENT]}
                    staticRanges={staticRanges}
                    inputRanges={[]}
                    maxDate={maxDate ?? undefined}
                    className="!flex max-w-full flex-col sm:!flex-row"
                />
            </div>
            <div
                className={[
                    'flex flex-wrap items-center gap-2 border-t border-gray-100 px-2 pt-2 dark:border-cursor-border',
                    hasAppliedRange ? 'justify-between' : 'justify-start',
                ].join(' ')}
            >
                <button
                    type="button"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => {
                        const s = ranges[0]?.startDate;
                        const e = ranges[0]?.endDate;
                        if (!s || !e) {
                            return;
                        }
                        onApply?.({
                            dateFrom: formatYmdForApply(s),
                            dateTo: formatYmdForApply(e),
                        });
                        closeKeepingTriggerRing();
                    }}
                >
                    Apply
                </button>
                {hasAppliedRange ? (
                    <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-cursor-muted dark:hover:text-cursor-fg"
                        onClick={() => {
                            onApply?.({ dateFrom: '', dateTo: '' });
                            closeKeepingTriggerRing();
                        }}
                    >
                        Clear date
                    </button>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Created / updated-style filter: `YYYY-MM-DD` pair via [react-date-range](https://github.com/hypeserver/react-date-range) `DateRangePicker`.
 */
export default function FormDateRangeFilter({
    id,
    label = 'Date range',
    dateFrom = '',
    dateTo = '',
    placeholder = 'All dates',
    /** IANA zone from company settings; presets and Apply use this so filters match the server. */
    timeZone,
    onApply,
    disabled = false,
    disableFutureDates = false,
}) {
    const triggerRef = useRef(null);
    const resolvedTz = companyTimeZoneOrDefault(timeZone);
    const staticRanges = useMemo(() => buildZonedDateFilterStaticRanges(resolvedTz), [resolvedTz]);
    const formatYmdForApply = (d) => formatYmdInTimeZone(d, resolvedTz);
    const maxSelectableDate = useMemo(() => {
        if (!disableFutureDates) {
            return null;
        }
        const ymd = companyTodayYmd(resolvedTz);
        return fromZonedTime(`${ymd} 23:59:59.999`, resolvedTz);
    }, [disableFutureDates, resolvedTz]);
    const [ranges, setRanges] = useState(() =>
        buildRangesFromFilters(dateFrom, dateTo, disableFutureDates ? maxSelectableDate : null),
    );

    useEffect(() => {
        setRanges(buildRangesFromFilters(dateFrom, dateTo, disableFutureDates ? maxSelectableDate : null));
    }, [dateFrom, dateTo, disableFutureDates, maxSelectableDate]);

    const displayLabel = formatRangeLabel(dateFrom, dateTo);
    const hasAppliedRange = Boolean(String(dateFrom ?? '').trim() || String(dateTo ?? '').trim());

    return (
        <div className="w-full min-w-0">
            {label ? (
                <label htmlFor={id} className="text-xs font-medium text-gray-600">
                    {label}
                </label>
            ) : null}
            <Popover className={`relative ${label ? 'mt-1' : ''} w-full min-w-0`}>
                <PopoverButton
                    ref={triggerRef}
                    type="button"
                    id={id}
                    disabled={disabled}
                    className={[
                        formComboboxInputSurfaceClass,
                        formDatePickerTriggerOpenRingClass,
                        'flex w-full min-w-0 items-center justify-between gap-2 text-start',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                    ].join(' ')}
                >
                    <span
                        className={
                            displayLabel
                                ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg'
                                : 'min-w-0 truncate text-gray-400'
                        }
                    >
                        {displayLabel ?? placeholder}
                    </span>
                    <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
                </PopoverButton>

                <PopoverPanel
                    anchor="bottom start"
                    portal
                    className="z-[100] mt-1 max-w-[min(100vw-1rem,44rem)] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-cursor-surface dark:ring-white/10"
                >
                    <DateRangePanel
                        ranges={ranges}
                        setRanges={setRanges}
                        onApply={onApply}
                        triggerRef={triggerRef}
                        hasAppliedRange={hasAppliedRange}
                        staticRanges={staticRanges}
                        formatYmdForApply={formatYmdForApply}
                        maxDate={maxSelectableDate}
                    />
                </PopoverPanel>
            </Popover>
        </div>
    );
}
