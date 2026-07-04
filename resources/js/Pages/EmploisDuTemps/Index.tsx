import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useState } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

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

const JOURS_COLORS: Record<string, string> = {
    Lundi: 'bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:border-blue-900',
    Mardi: 'bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:border-purple-900',
    Mercredi: 'bg-green-50 border-green-200 dark:bg-green-950/60 dark:border-green-900',
    Jeudi: 'bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-900',
    Vendredi: 'bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900',
    Samedi: 'bg-slate-50 border-slate-200 dark:bg-slate-800/70 dark:border-slate-700',
};

const inp = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500';

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function EmploisIndex({ filters, classes, anneesScolaires, matieres, enseignants, emplois }: Props) {
    const form = useForm({
        classe_id: String(filters.classe_id ?? classes[0]?.id ?? ''),
        annee_scolaire_id: String(filters.annee_scolaire_id ?? anneesScolaires[0]?.id ?? ''),
        jour: 'Lundi' as Emploi['jour'],
        heure_debut: '08:00',
        heure_fin: '09:00',
        matiere_id: String(matieres[0]?.id ?? ''),
        enseignant_id: String(enseignants[0]?.id ?? ''),
        salle: '',
        observation: '',
    });

    const editForm = useForm({
        classe_id: '',
        annee_scolaire_id: '',
        jour: 'Lundi' as Emploi['jour'],
        heure_debut: '',
        heure_fin: '',
        matiere_id: '',
        enseignant_id: '',
        salle: '',
        observation: '',
    });

    const [editTarget, setEditTarget] = useState<Emploi | null>(null);

    const openEdit = (e: Emploi) => {
        setEditTarget(e);
        editForm.setData({
            classe_id: String(e.classe_id),
            annee_scolaire_id: String(e.annee_scolaire_id),
            jour: e.jour,
            heure_debut: e.heure_debut,
            heure_fin: e.heure_fin,
            matiere_id: String(e.matiere_id),
            enseignant_id: String(e.enseignant_id),
            salle: e.salle ?? '',
            observation: e.observation ?? '',
        });
    };

    const closeEdit = () => { setEditTarget(null); editForm.reset(); };

    const submitEdit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!editTarget) return;
        editForm.patch(route('emplois-du-temps.update', editTarget.id), {
            preserveScroll: true,
            onSuccess: closeEdit,
        });
    };

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

    const nomEnseignant = (id: number) => {
        const t = enseignants.find((e) => e.id === id);
        return t ? `${t.nom ?? ''} ${t.prenoms ?? ''}`.trim() : '—';
    };

    const nomMatiere = (id: number) => matieres.find((m) => m.id === id)?.libelle ?? '—';

    const emploisParJour = jours.map((jour) => ({
        jour,
        creneaux: emplois.filter((e) => e.jour === jour).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)),
    }));

    return (
        <AppLayout title="Emploi du temps">
            <Head title="Emploi du temps" />
            <div className="min-h-screen space-y-5 bg-slate-50 p-4 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Emploi du temps</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Créez, modifiez et supprimez les créneaux des classes.</p>
                </div>

                {/* Filtres */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Classe
                            <Select value={form.data.classe_id} onValueChange={(v) => { form.setData('classe_id', v); onFilterChange({ classe_id: v }); }}>
                                <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Classe" /></SelectTrigger>
                                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent>
                            </Select>
                        </label>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Année scolaire
                            <Select value={form.data.annee_scolaire_id} onValueChange={(v) => { form.setData('annee_scolaire_id', v); onFilterChange({ annee_scolaire_id: v }); }}>
                                <SelectTrigger className="mt-1 w-full"><SelectValue placeholder="Année scolaire" /></SelectTrigger>
                                <SelectContent>{anneesScolaires.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}</SelectContent>
                            </Select>
                        </label>
                    </div>
                </div>

                {/* Formulaire ajout */}
                <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Nouveau créneau</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <select value={form.data.jour} onChange={(e) => form.setData('jour', e.target.value as Emploi['jour'])} className={inp}>
                            {jours.map((j) => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input type="time" value={form.data.heure_debut} onChange={(e) => form.setData('heure_debut', e.target.value)} className={inp} />
                            <input type="time" value={form.data.heure_fin} onChange={(e) => form.setData('heure_fin', e.target.value)} className={inp} />
                        </div>
                        <select value={form.data.matiere_id} onChange={(e) => form.setData('matiere_id', e.target.value)} className={inp}>
                            {matieres.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                        </select>
                        <select value={form.data.enseignant_id} onChange={(e) => form.setData('enseignant_id', e.target.value)} className={inp}>
                            {enseignants.map((ens) => <option key={ens.id} value={ens.id}>{ens.nom} {ens.prenoms}</option>)}
                        </select>
                        <input placeholder="Salle (optionnel)" value={form.data.salle} onChange={(e) => form.setData('salle', e.target.value)} className={inp} />
                        <input placeholder="Observation (optionnel)" value={form.data.observation} onChange={(e) => form.setData('observation', e.target.value)} className={`${inp} lg:col-span-2`} />
                    </div>
                    {Object.keys(form.errors).length > 0 && (
                        <p className="mt-2 text-xs text-red-600">{Object.values(form.errors)[0]}</p>
                    )}
                    <div className="mt-4">
                        <Button type="submit" disabled={form.processing} className="bg-[#1a56a0] hover:bg-[#1548a0]">
                            Ajouter le créneau
                        </Button>
                    </div>
                </form>

                {/* Grille par jour */}
                {emplois.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                        Aucun créneau pour cette classe et cette année. Commencez par en ajouter un.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {emploisParJour.filter((d) => d.creneaux.length > 0).map(({ jour, creneaux }) => (
                            <div key={jour} className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${JOURS_COLORS[jour] ?? ''}`}>
                                <div className={`border-b px-4 py-2.5 ${JOURS_COLORS[jour] ?? ''}`}>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{jour}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{creneaux.length} créneau(x)</p>
                                </div>
                                <div className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                                    {creneaux.map((e) => (
                                        <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                                            <div className="w-20 shrink-0 text-xs font-mono text-slate-500 pt-0.5">
                                                {e.heure_debut}<br />{e.heure_fin}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{nomMatiere(e.matiere_id)}</p>
                                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{nomEnseignant(e.enseignant_id)}</p>
                                                {e.salle && <p className="text-xs text-slate-400">Salle : {e.salle}</p>}
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <button onClick={() => openEdit(e)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400" title="Modifier">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => router.delete(route('emplois-du-temps.destroy', e.id), { preserveScroll: true })} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400" title="Supprimer">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal modification ── */}
            {editTarget && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30" onClick={closeEdit} />
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white text-slate-700 shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                            <div>
                                <h2 className="font-semibold text-slate-800 dark:text-slate-100">Modifier le créneau</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{editTarget.jour} · {editTarget.heure_debut} – {editTarget.heure_fin}</p>
                            </div>
                            <button onClick={closeEdit} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
                        </div>
                        <form onSubmit={submitEdit} className="space-y-4 p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Jour" required>
                                    <select value={editForm.data.jour} onChange={(e) => editForm.setData('jour', e.target.value as Emploi['jour'])} className={inp}>
                                        {jours.map((j) => <option key={j} value={j}>{j}</option>)}
                                    </select>
                                </Field>
                                <Field label="Salle">
                                    <input value={editForm.data.salle} onChange={(e) => editForm.setData('salle', e.target.value)} className={inp} placeholder="Ex : Salle 12" />
                                </Field>
                                <Field label="Heure de début" required>
                                    <input type="time" value={editForm.data.heure_debut} onChange={(e) => editForm.setData('heure_debut', e.target.value)} className={inp} />
                                </Field>
                                <Field label="Heure de fin" required>
                                    <input type="time" value={editForm.data.heure_fin} onChange={(e) => editForm.setData('heure_fin', e.target.value)} className={inp} />
                                </Field>
                                <Field label="Matière" required>
                                    <select value={editForm.data.matiere_id} onChange={(e) => editForm.setData('matiere_id', e.target.value)} className={inp}>
                                        {matieres.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                                    </select>
                                </Field>
                                <Field label="Enseignant" required>
                                    <select value={editForm.data.enseignant_id} onChange={(e) => editForm.setData('enseignant_id', e.target.value)} className={inp}>
                                        {enseignants.map((ens) => <option key={ens.id} value={ens.id}>{ens.nom} {ens.prenoms}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Observation">
                                <input value={editForm.data.observation} onChange={(e) => editForm.setData('observation', e.target.value)} className={inp} placeholder="Optionnel" />
                            </Field>
                            {Object.keys(editForm.errors).length > 0 && (
                                <p className="text-xs text-red-600">{Object.values(editForm.errors)[0]}</p>
                            )}
                            <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                <button type="button" onClick={closeEdit} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Annuler</button>
                                <button type="submit" disabled={editForm.processing} className="flex-1 rounded-xl bg-[#1a56a0] py-2 text-sm font-medium text-white hover:bg-[#1548a0] disabled:opacity-60">
                                    {editForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
