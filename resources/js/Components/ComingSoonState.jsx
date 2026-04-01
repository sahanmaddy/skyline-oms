/**
 * Polished empty state for roadmap sections (no fake data).
 */
export default function ComingSoonState({ title, description, className = '' }) {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white px-6 py-16 text-center shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:px-10 sm:py-20 ${className}`}
        >
            <div
                className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 dark:border-cursor-border-muted dark:bg-cursor-raised dark:text-cursor-fg"
                aria-hidden
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-cursor-muted">{description}</p>
            <p className="mt-8 inline-flex items-center rounded border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:border-cursor-border-muted dark:bg-cursor-raised dark:text-cursor-fg">
                Coming soon
            </p>
        </div>
    );
}
