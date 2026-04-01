import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-[3px] py-2 pe-4 ps-[calc(0.75rem-3px)] ${
                active
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800 dark:border-cursor-accent dark:bg-cursor-raised dark:text-cursor-bright dark:focus:border-cursor-accent dark:focus:bg-cursor-raised dark:focus:text-cursor-bright'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 dark:text-cursor-muted dark:hover:border-cursor-border-muted dark:hover:bg-cursor-raised dark:hover:text-cursor-fg dark:focus:border-cursor-border-muted dark:focus:bg-cursor-raised'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
