import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

type Props = { emplois: Array<unknown> };

export default function EmploisIndex({ emplois }: Props) {
  return <AppLayout title="Emploi du temps"><Head title="Emploi du temps" />
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Emploi du temps</h1>
        <p className="mt-1 text-sm text-slate-500">Créez et organisez les horaires des classes par jour, matière et enseignant.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {emplois.length === 0 ? <p className="text-sm text-slate-500">Aucun créneau disponible pour les filtres sélectionnés.</p> : <p className="text-sm text-slate-600">Gestion des créneaux disponible.</p>}
      </div>
    </div>
  </AppLayout>;
}
