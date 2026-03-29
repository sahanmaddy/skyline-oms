import { Link } from '@inertiajs/react';

function Chevron() {
    return (
        <svg
            className="mx-1 h-3.5 w-3.5 shrink-0 text-gray-300"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
        >
            <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

/**
 * Compact trail for nested module sections; complements ModuleHeader (parent module name).
 */
export default function ModuleBreadcrumbs({ items }) {
    if (!items?.length) {
        return null;
    }

    return (
        <nav className="text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-y-1">
                {items.map((item, i) => (
                    <li key={i} className="flex items-center">
                        {i > 0 ? <Chevron /> : null}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="font-medium text-gray-600 underline-offset-2 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className="font-semibold text-gray-900"
                                aria-current={i === items.length - 1 ? 'page' : undefined}
                            >
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
