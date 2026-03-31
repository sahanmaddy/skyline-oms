import { Link } from '@inertiajs/react';

/**
 * ERP-style horizontal section navigation: underline active state; tabs wrap on narrow viewports (no nested scroll).
 */
export default function ModuleSubnav({ items, ariaLabel = 'Module sections' }) {
    return (
        <div className="border-b border-gray-200 bg-white">
            <nav
                className="flex flex-wrap gap-x-0 gap-y-0 px-1 sm:px-2"
                aria-label={ariaLabel}
            >
                {items.map((item) => {
                    const active = route().current(item.activePattern);
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={
                                'border-b-2 px-3 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:px-4 ' +
                                (active
                                    ? '-mb-px border-indigo-600 text-gray-900'
                                    : '-mb-px border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900')
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
