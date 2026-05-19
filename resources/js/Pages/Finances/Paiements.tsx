import AppLayout from '@/Layouts/AppLayout';

export default function FinancesPaiements() {
    return (
        <AppLayout title="Paiements / Encaissements">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Paiements / Encaissements</h1>
                <p className="text-sm text-gray-600">Suivi des paiements et des encaissements.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
