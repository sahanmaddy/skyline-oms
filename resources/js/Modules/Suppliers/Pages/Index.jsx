import Dropdown from '@/Components/Dropdown';
import FormSelect from '@/Components/FormSelect';
import ModuleListToolbar from '@/Components/ModuleListToolbar';
import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import PrimaryButton from '@/Components/PrimaryButton';
import useConfirm from '@/feedback/useConfirm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProcurementModuleLayout from '@/Layouts/ProcurementModuleLayout';
import { moduleListSearchInputClass } from '@/lib/dropdownMenuStyles';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ suppliers, filters, statusOptions, canCreate }) {
    const { confirm } = useConfirm();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Procurement" section="Suppliers" />}>
            <Head title="Suppliers · Procurement" />
            <ProcurementModuleLayout breadcrumbs={[{ label: 'Suppliers' }]}>
                <ModuleListToolbar
                    actionsAbove
                    filtersWrapClassName="w-full max-w-none md:grid-cols-2 md:items-end"
                    filters={
                        <>
                            <div>
                                <label htmlFor="supplier-search" className="text-xs font-medium text-gray-600">Search</label>
                                <input id="supplier-search" className={`mt-1 ${moduleListSearchInputClass}`} value={filters?.q || ''} onChange={(e) => router.get(route('procurement.suppliers.index'), { ...filters, q: e.target.value }, { preserveState: true, replace: true })} placeholder="Search code, display name, company, contact, phone..." />
                            </div>
                            <div>
                                <label htmlFor="supplier-status" className="text-xs font-medium text-gray-600">Status</label>
                                <FormSelect id="supplier-status" className="mt-1" value={filters?.status || ''} onChange={(status) => router.get(route('procurement.suppliers.index'), { ...filters, status }, { preserveState: true, replace: true })} options={[{ value: '', label: 'All' }, ...(statusOptions || []).map((s) => ({ value: s, label: s === 'active' ? 'Active' : 'Inactive' }))]} placeholder="All" />
                            </div>
                        </>
                    }
                    actions={canCreate ? <Link href={route('procurement.suppliers.create')}><PrimaryButton type="button">New supplier</PrimaryButton></Link> : null}
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Supplier Code', 'Display Name', 'Company Name', 'Contact Person', 'Phone', 'Country', 'Currency', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {(suppliers?.data || []).map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.supplier_code || '—'}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.display_name || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.company_name || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.contact_person || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{[s.primary_phone_country_code, s.primary_phone_number].filter(Boolean).join(' ') || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.country || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{s.currency || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ' + (s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700')}>{s.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        {s.can_view || s.can_edit || s.can_delete ? (
                                            <div className="relative z-50 flex justify-end">
                                                <Dropdown>
                                                    <Dropdown.Trigger><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">⋯</button></Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        {s.can_view ? <Link href={route('procurement.suppliers.show', s.id)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">View</Link> : null}
                                                        {s.can_edit ? <Link href={route('procurement.suppliers.edit', s.id)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">Edit</Link> : null}
                                                        {s.can_delete ? <button type="button" className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={async () => {
                                                            const ok = await confirm({ title: 'Delete supplier', message: 'Are you sure you want to delete this supplier? This action cannot be undone.', confirmText: 'Delete', variant: 'destructive' });
                                                            if (!ok) return;
                                                            router.delete(route('procurement.suppliers.destroy', s.id));
                                                        }}>Delete</button> : null}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        ) : <span className="text-xs text-gray-400">—</span>}
                                    </td>
                                </tr>
                            ))}
                            {(suppliers?.data || []).length === 0 ? <tr><td colSpan={9} className="px-4 py-10 text-center"><div className="text-sm font-medium text-gray-900">No suppliers found</div><div className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</div></td></tr> : null}
                        </tbody>
                    </table>
                </div>

                {suppliers?.links?.length > 3 ? <div className="flex flex-wrap gap-2">{suppliers.links.map((l) => <Link key={l.label} href={l.url || '#'} preserveScroll className={'rounded-md border px-3 py-1 text-sm ' + (l.active ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50') + (l.url ? '' : ' pointer-events-none opacity-50')} dangerouslySetInnerHTML={{ __html: l.label }} />)}</div> : null}
            </ProcurementModuleLayout>
        </AuthenticatedLayout>
    );
}
