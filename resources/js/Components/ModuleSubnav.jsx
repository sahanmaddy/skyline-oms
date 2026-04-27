import { Link } from '@inertiajs/react';

/**
 * ERP-style horizontal section navigation: underline active state; tabs wrap on narrow viewports (no nested scroll).
 */
export default function ModuleSubnav({ items, ariaLabel = 'Module sections' }) {
    return (
        <div className="border-b border-gray-200 bg-white dark:border-cursor-border dark:bg-cursor-surface">
            <nav
                className="flex flex-wrap gap-x-0 gap-y-0 px-1 sm:px-2"
                aria-label={ariaLabel}
            >
                {items.map((item) => {
                    const patterns =
                        item.activePatterns ??
                        (item.activePattern ? [item.activePattern] : []);
                    const active = patterns.some((pat) => route().current(pat));
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={
                                'border-b-2 px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-cursor-accent/50 dark:focus-visible:ring-offset-cursor-surface sm:px-4 ' +
                                (active
                                    ? '-mb-px border-indigo-600 text-gray-900 dark:border-cursor-accent dark:text-cursor-bright'
                                    : '-mb-px border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-cursor-muted dark:hover:border-cursor-border-muted dark:hover:text-cursor-fg')
                            }
                        >
                            <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
