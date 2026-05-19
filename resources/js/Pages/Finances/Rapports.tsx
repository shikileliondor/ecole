import AppLayout from '@/Layouts/AppLayout';

export default function FinancesRapports() {
    return (
        <AppLayout title="Rapports financiers">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Rapports financiers</h1>
                <p className="text-sm text-gray-600">Rapports et analyses des performances financières.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
