/**
 * Primary title and optional supporting copy for a parent ERP module.
 */
export default function ModuleHeader({ title, description, className = '' }) {
    return (
        <header className={`border-b border-gray-200 bg-white px-5 py-5 dark:border-cursor-border dark:bg-cursor-surface sm:px-6 sm:py-6 ${className}`}>
            <div className="max-w-7xl">
                <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-cursor-bright sm:text-xl">{title}</h1>
                {description ? (
                    <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-cursor-muted">{description}</p>
                ) : null}
            </div>
        </header>
    );
}
