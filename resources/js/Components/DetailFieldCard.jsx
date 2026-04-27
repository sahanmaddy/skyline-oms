/**
 * Label/value cell for module detail (Show) pages.
 * Typography, padding, and borders match Human Resource → Employee detail.
 */
export function DetailFieldCard({ label, value, className = '', valueClassName = '' }) {
    return (
        <div
            className={`rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-bg ${className}`}
        >
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                {label}
            </div>
            <div
                className={`mt-1 text-sm font-medium text-gray-900 dark:text-cursor-bright ${valueClassName}`}
            >
                {value}
            </div>
        </div>
    );
}

/** Yes/No (or similar) status pill inside the same field card shell as {@link DetailFieldCard}. */
export function DetailStatusFieldCard({ label, value, isPositive }) {
    return (
        <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-cursor-border dark:bg-cursor-bg">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-cursor-muted">
                {label}
            </div>
            <div className="mt-2">
                <span
                    className={
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        (isPositive
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-800'
                            : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-cursor-raised dark:text-cursor-muted dark:ring-cursor-border')
                    }
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
