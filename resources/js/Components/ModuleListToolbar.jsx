/**
 * Filter/search row + primary actions for module list pages (employees, customers, etc.).
 * @param {{ filters: React.ReactNode, actions?: React.ReactNode, heading?: React.ReactNode, filtersWrapClassName?: string, actionsAbove?: boolean }} props
 */
export default function ModuleListToolbar({ filters, actions, heading, filtersWrapClassName, actionsAbove = false }) {
    const filtersWrap =
        filtersWrapClassName ??
        'md:max-w-2xl md:grid-cols-2 md:items-end lg:max-w-3xl';

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-cursor-border dark:bg-cursor-surface">
            {actionsAbove ? (
                <>
                    {heading || actions ? (
                        <div
                            className={
                                'mb-4 flex flex-col gap-3 sm:flex-row sm:items-center ' +
                                (heading ? 'sm:justify-between' : 'sm:justify-end')
                            }
                        >
                            {heading ? (
                                <div className="min-w-0 text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                    {heading}
                                </div>
                            ) : null}
                            {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
                        </div>
                    ) : null}
                    <div className={`grid min-w-0 w-full grid-cols-1 gap-4 ${filtersWrap}`}>{filters}</div>
                </>
            ) : (
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                    <div className={`grid min-w-0 flex-1 grid-cols-1 gap-4 ${filtersWrap}`}>
                        {filters}
                    </div>
                    {actions ? (
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                            {actions}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
