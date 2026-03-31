import { Link } from '@inertiajs/react';

/**
 * Top bar for record show/edit/create pages. Reserves a stable row height so the back
 * link stays aligned when trailing actions (e.g. Edit) are present or omitted.
 */
export default function ModuleDetailToolbar({ backHref, backLabel, actions = null }) {
    return (
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Link
                href={backHref}
                className="inline-flex min-h-10 shrink-0 items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
                {backLabel}
            </Link>
            <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
        </div>
    );
}
