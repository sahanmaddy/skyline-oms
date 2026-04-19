import { normalizeIntlTimeZone } from '@/lib/safeIntlTimeZone';
import { formComboboxInputSurfaceClass } from '@/lib/dropdownMenuStyles';
import { Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { useRef } from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

/** React-date-range selection / today indicator; matches Tailwind `indigo-600` and form focus rings. */
export const FORM_DATE_PICKER_ACCENT = '#4f46e5';

/** Parse `YYYY-MM-DD` to a local calendar Date (no UTC shift). */
export function parseYmdToLocalDate(value) {
    if (!value || typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a local Date as `YYYY-MM-DD` for forms / Laravel. */
export function localDateToYmd(date) {
    if (!date || Number.isNaN(date.getTime())) {
        return '';
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Format an instant as `YYYY-MM-DD` in an IANA time zone (e.g. company `time_zone`).
 * Used so list date filters match server-side "calendar day" semantics.
 */
export function formatYmdInTimeZone(date, timeZone) {
    if (!date || Number.isNaN(date.getTime())) {
        return '';
    }
    const tz = normalizeIntlTimeZone(timeZone);
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);
        const y = parts.find((p) => p.type === 'year')?.value;
        const m = parts.find((p) => p.type === 'month')?.value;
        const d = parts.find((p) => p.type === 'day')?.value;
        if (!y || !m || !d) {
            return localDateToYmd(date);
        }
        return `${y}-${m}-${d}`;
    } catch {
        return localDateToYmd(date);
    }
}

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

function isTodaySelectable(minDate, maxDate) {
    const today = startOfDay(new Date());
    if (minDate && isBefore(today, startOfDay(minDate))) {
        return false;
    }
    if (maxDate && isAfter(today, startOfDay(maxDate))) {
        return false;
    }
    return true;
}

/** Same ring as `formComboboxInputClass` `focus:` styles, for `aria-expanded` while the panel is open. */
const formDatePickerTriggerOpenRingClass =
    'aria-expanded:border-indigo-500 aria-expanded:ring-2 aria-expanded:ring-indigo-500 aria-expanded:ring-offset-2 aria-expanded:ring-offset-white dark:aria-expanded:ring-cursor-accent-soft dark:aria-expanded:ring-offset-cursor-bg';

function CalendarPanel({ value, onChange, minDate, maxDate, allowEmpty, triggerRef }) {
    const close = useClose();
    const selected = parseYmdToLocalDate(value);
    const calendarDate = selected ?? new Date();
    const todayOk = isTodaySelectable(minDate, maxDate);
    const showClear = allowEmpty && value;
    const showFooter = todayOk || showClear;
    const footerJustify =
        todayOk && showClear ? 'justify-between' : showClear ? 'justify-end' : 'justify-start';

    /** Footer actions: focus trigger then close in the same turn. */
    function closeKeepingTriggerRing() {
        triggerRef?.current?.focus({ preventScroll: true });
        close();
    }

    /**
     * Day cells fire `onChange` from `mousedown` while focus is still inside the calendar.
     * Defer focus + close to the next frame so pointer handling finishes first — same stable ring as Today/Clear.
     */
    function closeKeepingTriggerRingAfterDayPick() {
        requestAnimationFrame(() => {
            triggerRef?.current?.focus({ preventScroll: true });
            close();
        });
    }

    return (
        <div className="overflow-hidden rounded-md bg-white p-2 dark:bg-cursor-surface">
            <div className="form-date-picker-theme [&_.rdrCalendarWrapper]:bg-transparent [&_.rdrMonth]:w-full">
                <Calendar
                    date={calendarDate}
                    onChange={(d) => {
                        onChange(localDateToYmd(d));
                        closeKeepingTriggerRingAfterDayPick();
                    }}
                    minDate={minDate}
                    maxDate={maxDate}
                    showDateDisplay={false}
                    dragSelectionEnabled={false}
                    color={FORM_DATE_PICKER_ACCENT}
                />
            </div>
            {showFooter ? (
                <div
                    className={`flex flex-wrap items-center gap-2 border-t border-gray-100 px-2 pt-2 dark:border-cursor-border ${footerJustify}`}
                >
                    {todayOk ? (
                        <button
                            type="button"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            onClick={() => {
                                onChange(localDateToYmd(new Date()));
                                closeKeepingTriggerRing();
                            }}
                        >
                            Today
                        </button>
                    ) : null}
                    {showClear ? (
                        <button
                            type="button"
                            className="text-sm text-gray-600 hover:text-gray-900 dark:text-cursor-muted dark:hover:text-cursor-fg"
                            onClick={() => {
                                onChange('');
                                closeKeepingTriggerRing();
                            }}
                        >
                            Clear date
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

/**
 * Single-date picker using [react-date-range](https://hypeserver.github.io/react-date-range/) Calendar.
 * Value / onChange use `YYYY-MM-DD` strings (same as native date inputs).
 */
export default function FormDatePicker({
    id,
    value,
    onChange,
    className = '',
    disabled = false,
    placeholder = 'Select date',
    minDate,
    maxDate,
    allowEmpty = true,
}) {
    const triggerRef = useRef(null);
    const selected = parseYmdToLocalDate(value);
    const displayLabel = selected ? format(selected, 'd MMM yyyy') : placeholder;

    return (
        <Popover className={`relative w-full min-w-0 ${className}`.trim()}>
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
                        selected
                            ? 'min-w-0 truncate text-gray-900 dark:text-cursor-fg'
                            : 'min-w-0 truncate text-gray-400'
                    }
                >
                    {displayLabel}
                </span>
                <ChevronDownIcon className="pointer-events-none h-4 w-4 shrink-0 text-gray-400" />
            </PopoverButton>

            <PopoverPanel
                anchor="bottom start"
                portal
                className="z-[100] mt-1 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-cursor-surface dark:ring-white/10"
            >
                <CalendarPanel
                    value={value}
                    onChange={onChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    allowEmpty={allowEmpty}
                    triggerRef={triggerRef}
                />
            </PopoverPanel>
        </Popover>
    );
}
