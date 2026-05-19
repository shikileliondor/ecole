import AppLayout from '@/Layouts/AppLayout';

export default function FinancesDepenses() {
    return (
        <AppLayout title="Dépenses / Caisse">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Dépenses / Caisse</h1>
                <p className="text-sm text-gray-600">Suivi des sorties de caisse et dépenses quotidiennes.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
