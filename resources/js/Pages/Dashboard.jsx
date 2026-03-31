import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <span className="text-base font-semibold">Dashboard</span>
            }
        >
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Sales (Coming soon)', value: '—' },
                    { label: 'Purchases (Coming soon)', value: '—' },
                    { label: 'Stock Value (Coming soon)', value: '—' },
                    { label: 'Receivables (Coming soon)', value: '—' },
                ].map((card) => (
                    <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {card.label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-gray-900">
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
