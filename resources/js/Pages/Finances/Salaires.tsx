import AppLayout from '@/Layouts/AppLayout';

export default function FinancesSalaires() {
    return (
        <AppLayout title="Salaires">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Salaires</h1>
                <p className="text-sm text-gray-600">Gestion des paiements de salaires du personnel.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
