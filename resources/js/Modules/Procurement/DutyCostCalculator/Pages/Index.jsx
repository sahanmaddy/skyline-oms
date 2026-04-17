import Dropdown from '@/Components/Dropdown';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCompanyCurrency } from '@/lib/companyFormat';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ calculations, filters, statusOptions, canCreate }) {
    const company = usePage().props.company ?? {};
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Duty & Cost Calculator" />}>
            <Head title="Duty & Cost Calculator · Procurement" />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Duty & Cost Calculator' }]}>
                <ModuleListToolbar
                    filters={
                        <>
                            <div>
                                <label htmlFor="dcc-search" className="text-xs font-medium text-gray-600">
                                    Search
                                </label>
                                <input
                                    id="dcc-search"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.q || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, q: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    placeholder="Search code, title, supplier..."
                                />
                            </div>
                            <div>
                                <label htmlFor="dcc-status" className="text-xs font-medium text-gray-600">
                                    Status
                                </label>
                                <FormSelect
                                    id="dcc-status"
                                    className="mt-1"
                                    value={filters?.status || ''}
                                    onChange={(status) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, status },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                    options={[
                                        { value: '', label: 'All' },
                                        ...statusOptions.map((s) => ({ value: s, label: s })),
                                    ]}
                                />
                            </div>
                            <div>
                                <label htmlFor="dcc-date-from" className="text-xs font-medium text-gray-600">
                                    Date From
                                </label>
                                <input
                                    id="dcc-date-from"
                                    type="date"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.date_from || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, date_from: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label htmlFor="dcc-date-to" className="text-xs font-medium text-gray-600">
                                    Date To
                                </label>
                                <input
                                    id="dcc-date-to"
                                    type="date"
                                    className={`mt-1 ${moduleListSearchInputClass}`}
                                    value={filters?.date_to || ''}
                                    onChange={(e) =>
                                        router.get(
                                            route('procurement.duty-cost-calculations.index'),
                                            { ...filters, date_to: e.target.value },
                                            { preserveState: true, replace: true },
                                        )
                                    }
                                />
                            </div>
                        </>
                    }
                    actions={
                        canCreate ? (
                            <Link href={route('procurement.duty-cost-calculations.create')}>
                                <PrimaryButton type="button">New Calculation</PrimaryButton>
                            </Link>
                        ) : null
                    }
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'Calculation Code',
                                    'Title',
                                    'No. of Items',
                                    'Total Weight',
                                    'Total CBM',
                                    'Total Duty',
                                    'Grand Total Landed Cost',
                                    'Status',
                                    'Created By',
                                    'Updated',
                                    'Actions',
                                ].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {calculations.data.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{row.calculation_code}</td>
                                    <td className="px-4 py-3">{row.title}</td>
                                    <td className="px-4 py-3">{row.item_count}</td>
                                    <td className="px-4 py-3">{row.total_weight_kg}</td>
                                    <td className="px-4 py-3">{row.total_cbm}</td>
                                    <td className="px-4 py-3">{formatCompanyCurrency(row.total_duty_lkr, company)}</td>
                                    <td className="px-4 py-3">{formatCompanyCurrency(row.grand_total_landed_cost_lkr, company)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.calculation_status === 'finalized' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {row.calculation_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{row.created_by_name || '—'}</td>
                                    <td className="px-4 py-3">{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200">
                                                    •••
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                {row.can_view && (
                                                    <Link href={route('procurement.duty-cost-calculations.show', row.id)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                                                        View
                                                    </Link>
                                                )}
                                                {row.can_edit && (
                                                    <Link href={route('procurement.duty-cost-calculations.edit', row.id)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                                                        Edit
                                                    </Link>
                                                )}
                                                {canCreate && (
                                                    <button
                                                        type="button"
                                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                                        onClick={() =>
                                                            router.post(route('procurement.duty-cost-calculations.duplicate', row.id))
                                                        }
                                                    >
                                                        Duplicate
                                                    </button>
                                                )}
                                                {row.can_delete && (
                                                    <button
                                                        type="button"
                                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                                        onClick={async () => {
                                                            const ok = await confirm({
                                                                title: 'Delete calculation',
                                                                message: 'This will permanently remove this saved estimate.',
                                                                confirmText: 'Delete',
                                                                variant: 'destructive',
                                                            });
                                                            if (!ok) return;
                                                            router.delete(route('procurement.duty-cost-calculations.destroy', row.id));
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}

