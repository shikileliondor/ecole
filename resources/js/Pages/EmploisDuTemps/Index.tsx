import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';

type Option = { id: number; nom?: string; libelle?: string; prenoms?: string };
type Emploi = {
  id: string;
  classe_id: number;
  annee_scolaire_id: number;
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  heure_debut: string;
  heure_fin: string;
  matiere_id: number;
  enseignant_id: number;
  salle?: string | null;
  observation?: string | null;
};

type Props = {
  filters: { classe_id?: number | null; annee_scolaire_id?: number | null };
  classes: Option[];
  anneesScolaires: Option[];
  matieres: Option[];
  enseignants: Option[];
  emplois: Emploi[];
};

const jours: Emploi['jour'][] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EmploisIndex({ filters, classes, anneesScolaires, matieres, enseignants, emplois }: Props) {
  const form = useForm({
    classe_id: String(filters.classe_id ?? classes[0]?.id ?? ''),
    annee_scolaire_id: String(filters.annee_scolaire_id ?? anneesScolaires[0]?.id ?? ''),
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '09:00',
    matiere_id: String(matieres[0]?.id ?? ''),
    enseignant_id: String(enseignants[0]?.id ?? ''),
    salle: '',
    observation: '',
  });

  const onFilterChange = (next: { classe_id?: string; annee_scolaire_id?: string }) => {
    router.get(route('emplois-du-temps.index'), {
      classe_id: (next.classe_id ?? form.data.classe_id) || undefined,
      annee_scolaire_id: (next.annee_scolaire_id ?? form.data.annee_scolaire_id) || undefined,
    }, { preserveState: true, replace: true });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('emplois-du-temps.store'), {
      preserveScroll: true,
      onSuccess: () => form.reset('jour', 'heure_debut', 'heure_fin', 'salle', 'observation'),
    });
  };

  return <AppLayout title="Emploi du temps"><Head title="Emploi du temps" />
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Emploi du temps</h1>
        <p className="mt-1 text-sm text-slate-500">Créez, modifiez et supprimez les créneaux des classes.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">Classe
            <select value={form.data.classe_id} onChange={(e) => { form.setData('classe_id', e.target.value); onFilterChange({ classe_id: e.target.value }); }} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700">Année scolaire
            <select value={form.data.annee_scolaire_id} onChange={(e) => { form.setData('annee_scolaire_id', e.target.value); onFilterChange({ annee_scolaire_id: e.target.value }); }} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              {anneesScolaires.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </label>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Nouveau créneau</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select value={form.data.jour} onChange={(e) => form.setData('jour', e.target.value as Emploi['jour'])} className="rounded-md border border-slate-300 px-3 py-2">{jours.map((j) => <option key={j} value={j}>{j}</option>)}</select>
          <input type="time" value={form.data.heure_debut} onChange={(e) => form.setData('heure_debut', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="time" value={form.data.heure_fin} onChange={(e) => form.setData('heure_fin', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <input placeholder="Salle" value={form.data.salle} onChange={(e) => form.setData('salle', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2" />
          <select value={form.data.matiere_id} onChange={(e) => form.setData('matiere_id', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">{matieres.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}</select>
          <select value={form.data.enseignant_id} onChange={(e) => form.setData('enseignant_id', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2">{enseignants.map((ens) => <option key={ens.id} value={ens.id}>{ens.nom} {ens.prenoms}</option>)}</select>
          <input placeholder="Observation" value={form.data.observation} onChange={(e) => form.setData('observation', e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
        </div>
        {Object.keys(form.errors).length > 0 && <p className="mt-2 text-sm text-red-600">{Object.values(form.errors)[0]}</p>}
        <div className="mt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={form.processing}>Ajouter le créneau</Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {emplois.length === 0 ? <p className="text-sm text-slate-500">Aucun créneau disponible pour les filtres sélectionnés.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">Jour</th><th className="p-2">Heure</th><th className="p-2">Matière</th><th className="p-2">Enseignant</th><th className="p-2">Salle</th><th className="p-2">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{emplois.map((e) => <tr key={e.id}><td className="p-2">{e.jour}</td><td className="p-2">{e.heure_debut} - {e.heure_fin}</td><td className="p-2">{matieres.find((m) => m.id === e.matiere_id)?.libelle ?? '--'}</td><td className="p-2">{(() => { const t = enseignants.find((ens) => ens.id === e.enseignant_id); return t ? `${t.nom} ${t.prenoms ?? ''}` : '--'; })()}</td><td className="p-2">{e.salle || '--'}</td><td className="p-2"><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => {
            const heureDebut = window.prompt('Heure de début (HH:mm)', e.heure_debut) ?? e.heure_debut;
            const heureFin = window.prompt('Heure de fin (HH:mm)', e.heure_fin) ?? e.heure_fin;
            const salle = window.prompt('Salle', e.salle ?? '') ?? (e.salle ?? '');
            const observation = window.prompt('Observation', e.observation ?? '') ?? (e.observation ?? '');
            router.patch(route('emplois-du-temps.update', e.id), {
              classe_id: e.classe_id, annee_scolaire_id: e.annee_scolaire_id, jour: e.jour,
              heure_debut: heureDebut, heure_fin: heureFin, matiere_id: e.matiere_id, enseignant_id: e.enseignant_id, salle, observation,
            }, { preserveScroll: true });
          }}>Modifier</Button><Button type="button" variant="outline" size="sm" className="text-red-600" onClick={() => router.delete(route('emplois-du-temps.destroy', e.id))}>Supprimer</Button></div></td></tr>)}</tbody></table></div>}
      </div>
    </div>
  </AppLayout>;
}
