export default function PermissionGroupSelector({
    groups = {},
    selectedIds = [],
    onChange,
    error,
}) {
    const selectedSet = new Set(selectedIds || []);
    const modules = Object.keys(groups || {});

    const toggleOne = (id, checked) => {
        const next = new Set(selectedSet);
        if (checked) next.add(id);
        else next.delete(id);
        onChange(Array.from(next));
    };

    const toggleModule = (moduleName, checked) => {
        const next = new Set(selectedSet);
        (groups[moduleName] || []).forEach((permission) => {
            if (checked) next.add(permission.id);
            else next.delete(permission.id);
        });
        onChange(Array.from(next));
    };

    const toggleAll = (checked) => {
        if (!checked) {
            onChange([]);
            return;
        }

        const allIds = [];
        modules.forEach((moduleName) => {
            (groups[moduleName] || []).forEach((permission) => allIds.push(permission.id));
        });
        onChange(allIds);
    };

    const allCount = modules.reduce((sum, moduleName) => sum + (groups[moduleName] || []).length, 0);
    const allChecked = allCount > 0 && selectedSet.size === allCount;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="text-sm font-medium text-gray-800">Permissions</div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                    />
                    Select all
                </label>
            </div>

            {modules.map((moduleName) => {
                const items = groups[moduleName] || [];
                const selectedInModule = items.filter((item) => selectedSet.has(item.id)).length;
                const moduleChecked = items.length > 0 && selectedInModule === items.length;

                return (
                    <section key={moduleName} className="rounded-md border border-gray-200 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">{moduleName}</div>
                            <label className="flex items-center gap-2 text-xs text-gray-600">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={moduleChecked}
                                    onChange={(e) => toggleModule(moduleName, e.target.checked)}
                                />
                                Select module
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {items.map((permission) => (
                                <label
                                    key={permission.id}
                                    className="flex items-start gap-2 rounded-md border border-gray-100 px-2 py-1.5 hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedSet.has(permission.id)}
                                        onChange={(e) => toggleOne(permission.id, e.target.checked)}
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {permission.display_name || permission.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{permission.name}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                );
            })}

            {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>
    );
}
