/**
 * Filter/search row + primary actions for module list pages (employees, customers, etc.).
 */
export default function ModuleListToolbar({ filters, actions }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:max-w-2xl md:grid-cols-2 md:items-end lg:max-w-3xl">
                    {filters}
                </div>
                {actions ? (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        {actions}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
