/**
 * Constrains module content width and vertical rhythm for HR, Sales, Settings, and future modules.
 */
export default function ModulePageShell({ children, className = '' }) {
    return <div className={`mx-auto w-full max-w-7xl space-y-5 ${className}`}>{children}</div>;
}
