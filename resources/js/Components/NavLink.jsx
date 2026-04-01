import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-600 text-gray-900 focus:border-indigo-800 dark:border-cursor-accent dark:text-cursor-bright dark:focus:border-cursor-accent'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-cursor-muted dark:hover:text-cursor-fg dark:hover:border-cursor-border-muted') +
                className
            }
        >
            {children}
        </Link>
    );
}
