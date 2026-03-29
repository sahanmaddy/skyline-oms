/**
 * Top app bar label: module badge + current section (sticky header stays contextual when module chrome scrolls).
 */
export default function ModuleStickyTitle({ module, section }) {
    return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                {module}
            </span>
            <span className="text-base font-semibold leading-tight text-gray-900">{section}</span>
        </span>
    );
}
