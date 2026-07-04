import AppLayout from '@/Layouts/AppLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { CheckCircle, ChevronDown, Edit2, Plus, Trash2, X, AlertCircle } from 'lucide-react';

const MOIS = [
    { v: 1, l: 'Janvier' }, { v: 2, l: 'Février' }, { v: 3, l: 'Mars' },
    { v: 4, l: 'Avril' }, { v: 5, l: 'Mai' }, { v: 6, l: 'Juin' },
    { v: 7, l: 'Juillet' }, { v: 8, l: 'Août' }, { v: 9, l: 'Septembre' },
    { v: 10, l: 'Octobre' }, { v: 11, l: 'Novembre' }, { v: 12, l: 'Décembre' },
];

const MODES = [
    { v: 'especes', l: 'Espèces' }, { v: 'virement', l: 'Virement' },
    { v: 'orange_money', l: 'Orange Money' }, { v: 'wave', l: 'Wave' },
    { v: 'mtn_momo', l: 'MTN MoMo' },
];

const fc = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)) + ' FCFA';
const moisLabel = (m: number) => MOIS.find((x) => x.v === m)?.l ?? String(m);
const modeLabel = (m: string) => MODES.find((x) => x.v === m)?.l ?? m;

type Personnel = { id: number; nom: string; poste: string; salaire_base: number };
type AnneeScolaire = { id: number; libelle: string };
type Salaire = {
    id: number;
    personnel_id: number;
    employe: string;
    poste: string;
    mois: number;
    salaire_base: number;
    primes: number;
    deductions: number;
    net_a_payer: number;
    mode_paiement: string;
    date_paiement: string | null;
    statut: 'paye' | 'en_attente';
};

type Props = {
    salaires: Salaire[];
    personnel: Personnel[];
    anneesScolaires: AnneeScolaire[];
};

function StatCard({ label, value, color = 'text-slate-800' }: { label: string; value: string; color?: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
                {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const sel = inp;

export default function Salaires({ salaires, personnel, anneesScolaires }: Props) {
    const { props } = usePage<any>();
    const flash = (props as any).flash as { success?: string; error?: string } | undefined;

    const anneeActive = anneesScolaires[0];
    const moisCourant = new Date().getMonth() + 1;

    const [filterMois, setFilterMois] = useState<number>(moisCourant);
    const [filterAnnee, setFilterAnnee] = useState<number>(anneeActive?.id ?? 0);
    const [panel, setPanel] = useState<'none' | 'create' | 'edit' | 'pay' | 'generer'>('none');
    const [target, setTarget] = useState<Salaire | null>(null);

    const createForm = useForm({
        personnel_id: String(personnel[0]?.id ?? ''),
        annee_scolaire_id: String(filterAnnee),
        mois: String(filterMois),
        salaire_base: String(personnel[0]?.salaire_base ?? 0),
        primes: '0',
        deductions: '0',
        mode_paiement: 'especes',
    });

    const editForm = useForm({
        salaire_base: '0',
        primes: '0',
        deductions: '0',
        mode_paiement: 'especes',
    });

    const payForm = useForm({
        date_paiement: new Date().toISOString().slice(0, 10),
        mode_paiement: 'especes',
    });

    const genererForm = useForm({
        annee_scolaire_id: String(filterAnnee),
        mois: String(filterMois),
        mode_paiement: 'especes',
    });

    const filtered = useMemo(
        () => salaires.filter((s) => s.mois === filterMois),
        [salaires, filterMois]
    );

    const masseSalariale = filtered.reduce((sum, s) => sum + s.net_a_payer, 0);
    const payes = filtered.filter((s) => s.statut === 'paye');
    const enAttente = filtered.filter((s) => s.statut === 'en_attente');

    const openEdit = (s: Salaire) => {
        setTarget(s);
        editForm.setData({ salaire_base: String(s.salaire_base), primes: String(s.primes), deductions: String(s.deductions), mode_paiement: s.mode_paiement });
        setPanel('edit');
    };

    const openPay = (s: Salaire) => {
        setTarget(s);
        payForm.setData({ date_paiement: new Date().toISOString().slice(0, 10), mode_paiement: s.mode_paiement });
        setPanel('pay');
    };

    const closePanel = () => { setPanel('none'); setTarget(null); };

    const net = (base: string, primes: string, ded: string) =>
        Math.max(0, (parseInt(base) || 0) + (parseInt(primes) || 0) - (parseInt(ded) || 0));

    const onPersonnelChange = (id: string) => {
        const p = personnel.find((x) => x.id === parseInt(id));
        createForm.setData({ ...createForm.data, personnel_id: id, salaire_base: String(p?.salaire_base ?? 0) });
    };

    return (
        <AppLayout title="Salaires">
            <div className="space-y-5 bg-slate-50 p-4">
                {/* En-tête */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Salaires</h1>
                        <p className="text-sm text-slate-500">Préparez, suivez et validez les salaires du personnel.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { genererForm.setData({ annee_scolaire_id: String(filterAnnee), mois: String(filterMois), mode_paiement: 'especes' }); setPanel('generer'); }}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <ChevronDown size={15} /> Générer le mois
                        </button>
                        <button
                            onClick={() => { createForm.setData({ personnel_id: String(personnel[0]?.id ?? ''), annee_scolaire_id: String(filterAnnee), mois: String(filterMois), salaire_base: String(personnel[0]?.salaire_base ?? 0), primes: '0', deductions: '0', mode_paiement: 'especes' }); setPanel('create'); }}
                            className="flex items-center gap-2 rounded-xl bg-[#1a56a0] px-4 py-2 text-sm font-medium text-white hover:bg-[#1548a0]"
                        >
                            <Plus size={15} /> Ajouter une fiche
                        </button>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        <CheckCircle size={16} /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <AlertCircle size={16} /> {flash.error}
                    </div>
                )}

                {/* Filtres */}
                <div className="flex flex-wrap gap-3">
                    <select value={filterAnnee} onChange={(e) => setFilterAnnee(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        {anneesScolaires.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                    </select>
                    <select value={filterMois} onChange={(e) => setFilterMois(Number(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        {MOIS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                    </select>
                </div>

                {/* KPIs */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label={`Masse salariale — ${moisLabel(filterMois)}`} value={fc(masseSalariale)} color="text-[#1a56a0]" />
                    <StatCard label="Salaires payés" value={String(payes.length)} color="text-green-600" />
                    <StatCard label="En attente" value={String(enAttente.length)} color="text-amber-600" />
                    <StatCard label="Total payé" value={fc(payes.reduce((s, x) => s + x.net_a_payer, 0))} />
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Fiches de salaire — {moisLabel(filterMois)} {anneesScolaires.find((a) => a.id === filterAnnee)?.libelle}
                        </h2>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-400">
                            <p className="font-medium">Aucune fiche pour ce mois.</p>
                            <p className="mt-1 text-xs">Cliquez sur « Générer le mois » pour créer les fiches automatiquement.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="p-3 text-left">Employé</th>
                                        <th className="p-3 text-left">Poste</th>
                                        <th className="p-3 text-right">Salaire base</th>
                                        <th className="p-3 text-right">Primes</th>
                                        <th className="p-3 text-right">Déductions</th>
                                        <th className="p-3 text-right font-bold">Net à payer</th>
                                        <th className="p-3 text-left">Mode</th>
                                        <th className="p-3 text-center">Statut</th>
                                        <th className="p-3 text-left">Date paiement</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-medium text-slate-800">{s.employe}</td>
                                            <td className="p-3 capitalize text-slate-500">{s.poste}</td>
                                            <td className="p-3 text-right text-slate-700">{fc(s.salaire_base)}</td>
                                            <td className="p-3 text-right text-green-600">{s.primes > 0 ? '+' + fc(s.primes) : '—'}</td>
                                            <td className="p-3 text-right text-red-500">{s.deductions > 0 ? '-' + fc(s.deductions) : '—'}</td>
                                            <td className="p-3 text-right font-bold text-slate-900">{fc(s.net_a_payer)}</td>
                                            <td className="p-3 text-slate-500">{modeLabel(s.mode_paiement)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.statut === 'paye' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {s.statut === 'paye' ? 'Payé' : 'En attente'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-500">{s.date_paiement ? new Date(s.date_paiement).toLocaleDateString('fr-FR') : '—'}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {s.statut === 'en_attente' && (
                                                        <>
                                                            <button onClick={() => openPay(s)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-green-50 hover:text-green-600" title="Marquer comme payé">
                                                                <CheckCircle size={15} />
                                                            </button>
                                                            <button onClick={() => openEdit(s)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Modifier">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => router.delete(route('finances.salaires.destroy', s.id), { preserveScroll: true })} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500" title="Supprimer">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Overlay + panels ── */}
            {panel !== 'none' && (
                <div className="fixed inset-0 z-40 bg-black/30" onClick={closePanel} />
            )}

            {/* Panel : Générer le mois */}
            {panel === 'generer' && (
                <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <h2 className="font-semibold text-slate-800">Générer les salaires du mois</h2>
                        <button onClick={closePanel} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
                    </div>
                    <form className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
                        onSubmit={(e) => { e.preventDefault(); genererForm.post(route('finances.salaires.generer'), { preserveScroll: true, onSuccess: closePanel }); }}>
                        <p className="text-sm text-slate-500">Crée automatiquement une fiche de salaire pour chaque membre du personnel actif ayant un salaire de base défini, si elle n'existe pas déjà.</p>
                        <Field label="Année scolaire" required>
                            <select value={genererForm.data.annee_scolaire_id} onChange={(e) => genererForm.setData('annee_scolaire_id', e.target.value)} className={sel}>
                                {anneesScolaires.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                            </select>
                        </Field>
                        <Field label="Mois" required>
                            <select value={genererForm.data.mois} onChange={(e) => genererForm.setData('mois', e.target.value)} className={sel}>
                                {MOIS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </Field>
                        <Field label="Mode de paiement par défaut" required>
                            <select value={genererForm.data.mode_paiement} onChange={(e) => genererForm.setData('mode_paiement', e.target.value)} className={sel}>
                                {MODES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </Field>
                        <div className="mt-auto flex gap-2 border-t pt-4">
                            <button type="button" onClick={closePanel} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm">Annuler</button>
                            <button type="submit" disabled={genererForm.processing} className="flex-1 rounded-xl bg-[#1a56a0] py-2 text-sm font-medium text-white hover:bg-[#1548a0] disabled:opacity-60">
                                {genererForm.processing ? 'Génération…' : 'Générer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Panel : Ajouter une fiche */}
            {panel === 'create' && (
                <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <h2 className="font-semibold text-slate-800">Nouvelle fiche de salaire</h2>
                        <button onClick={closePanel} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
                    </div>
                    <form className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
                        onSubmit={(e) => { e.preventDefault(); createForm.post(route('finances.salaires.store'), { preserveScroll: true, onSuccess: closePanel }); }}>
                        <Field label="Employé" required>
                            <select value={createForm.data.personnel_id} onChange={(e) => onPersonnelChange(e.target.value)} className={sel}>
                                {personnel.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Année scolaire" required>
                                <select value={createForm.data.annee_scolaire_id} onChange={(e) => createForm.setData('annee_scolaire_id', e.target.value)} className={sel}>
                                    {anneesScolaires.map((a) => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                                </select>
                            </Field>
                            <Field label="Mois" required>
                                <select value={createForm.data.mois} onChange={(e) => createForm.setData('mois', e.target.value)} className={sel}>
                                    {MOIS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Salaire de base (FCFA)" required>
                            <input type="number" min="0" value={createForm.data.salaire_base} onChange={(e) => createForm.setData('salaire_base', e.target.value)} className={inp} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Primes (FCFA)">
                                <input type="number" min="0" value={createForm.data.primes} onChange={(e) => createForm.setData('primes', e.target.value)} className={inp} />
                            </Field>
                            <Field label="Déductions (FCFA)">
                                <input type="number" min="0" value={createForm.data.deductions} onChange={(e) => createForm.setData('deductions', e.target.value)} className={inp} />
                            </Field>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                            <span className="text-slate-500">Net à payer : </span>
                            <span className="font-bold text-slate-900">{fc(net(createForm.data.salaire_base, createForm.data.primes, createForm.data.deductions))}</span>
                        </div>
                        <Field label="Mode de paiement" required>
                            <select value={createForm.data.mode_paiement} onChange={(e) => createForm.setData('mode_paiement', e.target.value)} className={sel}>
                                {MODES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </Field>
                        {createForm.errors.personnel_id && <p className="text-xs text-red-500">{createForm.errors.personnel_id}</p>}
                        <div className="mt-auto flex gap-2 border-t pt-4">
                            <button type="button" onClick={closePanel} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm">Annuler</button>
                            <button type="submit" disabled={createForm.processing} className="flex-1 rounded-xl bg-[#1a56a0] py-2 text-sm font-medium text-white hover:bg-[#1548a0] disabled:opacity-60">
                                {createForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Panel : Modifier */}
            {panel === 'edit' && target && (
                <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-800">Modifier la fiche</h2>
                            <p className="text-xs text-slate-500">{target.employe} — {moisLabel(target.mois)}</p>
                        </div>
                        <button onClick={closePanel} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
                    </div>
                    <form className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
                        onSubmit={(e) => { e.preventDefault(); editForm.put(route('finances.salaires.update', target.id), { preserveScroll: true, onSuccess: closePanel }); }}>
                        <Field label="Salaire de base (FCFA)" required>
                            <input type="number" min="0" value={editForm.data.salaire_base} onChange={(e) => editForm.setData('salaire_base', e.target.value)} className={inp} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Primes (FCFA)">
                                <input type="number" min="0" value={editForm.data.primes} onChange={(e) => editForm.setData('primes', e.target.value)} className={inp} />
                            </Field>
                            <Field label="Déductions (FCFA)">
                                <input type="number" min="0" value={editForm.data.deductions} onChange={(e) => editForm.setData('deductions', e.target.value)} className={inp} />
                            </Field>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                            <span className="text-slate-500">Net à payer : </span>
                            <span className="font-bold text-slate-900">{fc(net(editForm.data.salaire_base, editForm.data.primes, editForm.data.deductions))}</span>
                        </div>
                        <Field label="Mode de paiement" required>
                            <select value={editForm.data.mode_paiement} onChange={(e) => editForm.setData('mode_paiement', e.target.value)} className={sel}>
                                {MODES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </Field>
                        <div className="mt-auto flex gap-2 border-t pt-4">
                            <button type="button" onClick={closePanel} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm">Annuler</button>
                            <button type="submit" disabled={editForm.processing} className="flex-1 rounded-xl bg-[#1a56a0] py-2 text-sm font-medium text-white hover:bg-[#1548a0] disabled:opacity-60">
                                {editForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Panel : Marquer comme payé */}
            {panel === 'pay' && target && (
                <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-800">Confirmer le paiement</h2>
                            <p className="text-xs text-slate-500">{target.employe} — {moisLabel(target.mois)}</p>
                        </div>
                        <button onClick={closePanel} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
                    </div>
                    <form className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
                        onSubmit={(e) => { e.preventDefault(); payForm.post(route('finances.salaires.payer', target.id), { preserveScroll: true, onSuccess: closePanel }); }}>
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                            <p className="text-xs text-green-700">Montant net à verser</p>
                            <p className="mt-1 text-2xl font-bold text-green-800">{fc(target.net_a_payer)}</p>
                        </div>
                        <Field label="Date de paiement" required>
                            <input type="date" value={payForm.data.date_paiement} onChange={(e) => payForm.setData('date_paiement', e.target.value)} className={inp} />
                        </Field>
                        <Field label="Mode de paiement" required>
                            <select value={payForm.data.mode_paiement} onChange={(e) => payForm.setData('mode_paiement', e.target.value)} className={sel}>
                                {MODES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </Field>
                        <div className="mt-auto flex gap-2 border-t pt-4">
                            <button type="button" onClick={closePanel} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm">Annuler</button>
                            <button type="submit" disabled={payForm.processing} className="flex-1 rounded-xl bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                                {payForm.processing ? 'Validation…' : 'Valider le paiement'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AppLayout>
    );
}
