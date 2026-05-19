import AppLayout from '@/Layouts/AppLayout';

export default function FinancesImpayes() {
    return (
        <AppLayout title="Impayés">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Impayés</h1>
                <p className="text-sm text-gray-600">Liste des impayés et montants en retard.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
