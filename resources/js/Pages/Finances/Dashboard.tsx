import AppLayout from '@/Layouts/AppLayout';

export default function FinancesDashboard() {
    return (
        <AppLayout title="Tableau de bord finance">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord finance</h1>
                <p className="text-sm text-gray-600">Vue synthétique des flux financiers de l'établissement.</p>
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8" />
            </div>
        </AppLayout>
    );
}
