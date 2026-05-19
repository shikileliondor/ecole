import AppLayout from '@/Layouts/AppLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { DepenseRow, FinanceProps } from './types';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;
const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('fr-FR') : '—');

const emptyDepense = { libelle: '', categorie: '', montant: '', date_depense: new Date().toISOString().slice(0, 10), responsable_id: '', mode_paiement: 'especes', observation: '' };

export default function FinancesDepenses() {
    const { props } = usePage<{ props: FinanceProps }>() as any;
    const data = props as FinanceProps;
    const depenses = data.depenses ?? [];

    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DepenseRow | null>(null);

    const form = useForm({ ...emptyDepense });

    const totalJour = useMemo(() => depenses.filter((d: any) => new Date(d.date).toDateString() === new Date().toDateString() && d.statut !== 'annulee').reduce((s: number, d: any) => s + d.montant, 0), [depenses]);
    const totalMois = useMemo(() => depenses.filter((d: any) => { const dt = new Date(d.date); const n = new Date(); return dt.getMonth() === n.getMonth() && dt.getFullYear() === n.getFullYear() && d.statut !== 'annulee'; }).reduce((s: number, d: any) => s + d.montant, 0), [depenses]);
    const solde = (data.metrics?.totalEncaisse || 0) - (depenses.filter((d: any) => d.statut !== 'annulee').reduce((s: number, d: any) => s + d.montant, 0));

    const openCreate = () => {
        setIsEdit(false);
        setEditingId(null);
        form.reset();
        form.setData({ ...emptyDepense });
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (d: DepenseRow) => {
        setIsEdit(true);
        setEditingId(d.id);
        form.setData({ libelle: d.libelle || '', categorie: d.categorie || '', montant: String(d.montant || ''), date_depense: d.date || new Date().toISOString().slice(0, 10), responsable_id: d.responsable_id ? String(d.responsable_id) : '', mode_paiement: d.mode_paiement || 'especes', observation: d.observation || '' });
        form.clearErrors();
        setOpen(true);
    };

    return <AppLayout title='Dépenses / Caisse'><div className='space-y-4 bg-[#F8FAFC] p-4'>
        <div className='flex items-center justify-between'><div><h1 className='text-2xl font-bold text-[#0F172A]'>Dépenses / Caisse</h1><p className='text-sm text-[#64748B]'>Suivez les sorties d’argent, les justificatifs et le solde de caisse.</p></div><button onClick={openCreate} className='h-10 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700'>Nouvelle dépense</button></div>
        <div className='grid gap-3 md:grid-cols-4'>{[['Dépenses du jour', totalJour], ['Dépenses du mois', totalMois], ['Nombre de dépenses', depenses.length], ['Solde caisse estimé', solde]].map(([l, v]) => <div key={String(l)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm text-slate-500'>{l}</p><p className='text-xl font-semibold'>{typeof v === 'number' ? formatCurrency(v) : String(v)}</p></div>)}</div>
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto'><table className='min-w-full text-sm'><thead className='bg-slate-50'><tr><th className='p-3 text-left'>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th>Mode</th><th>Responsable</th><th>Justificatif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{depenses.map((d: any) => <tr key={d.id} className='border-t'><td className='p-3'>{formatDate(d.date)}</td><td>{d.libelle}</td><td>{d.categorie || 'Non renseigné'}</td><td>{formatCurrency(d.montant)}</td><td>{d.mode_paiement || 'Non renseigné'}</td><td>{d.responsable || 'Non renseigné'}</td><td>{d.justificatif_url ? <a className='text-blue-600' href={d.justificatif_url} target='_blank'>Voir</a> : '—'}</td><td>{d.statut}</td><td><div className='flex gap-2'><button className='text-slate-700 disabled:text-slate-300' disabled={d.statut === 'annulee'} onClick={() => openEdit(d)}>Modifier</button><button className='text-red-600 disabled:text-slate-300' disabled={d.statut === 'annulee'} onClick={() => setDeleteTarget(d)}>Supprimer</button></div></td></tr>)}{depenses.length === 0 && <tr><td colSpan={9} className='p-8 text-center text-slate-500'>Aucune donnée disponible</td></tr>}</tbody></table></div>

        {open && <div className='fixed inset-0 z-50 bg-black/30'><div className='ml-auto h-full w-full border-l border-slate-200 bg-white p-5 shadow-xl md:w-[440px] md:max-w-[480px]'><div className='flex h-full flex-col gap-3'><h3 className='text-lg font-semibold text-slate-900'>{isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}</h3>
            <label className='text-xs text-slate-500'>Libellé</label><input className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.libelle} onChange={e => form.setData('libelle', e.target.value)} />
            <label className='text-xs text-slate-500'>Catégorie</label><input className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.categorie} onChange={e => form.setData('categorie', e.target.value)} />
            <label className='text-xs text-slate-500'>Montant</label><input type='number' className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.montant} onChange={e => form.setData('montant', e.target.value)} />
            <label className='text-xs text-slate-500'>Date</label><input type='date' className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.date_depense} onChange={e => form.setData('date_depense', e.target.value)} />
            <label className='text-xs text-slate-500'>Responsable</label><select className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.responsable_id} onChange={e => form.setData('responsable_id', e.target.value)}><option value=''>Non renseigné</option>{(data.personnel || []).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}</select>
            <label className='text-xs text-slate-500'>Mode de paiement</label><select className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.mode_paiement} onChange={e => form.setData('mode_paiement', e.target.value)}>{data.modesPaiement.map((m) => <option key={m} value={m}>{m}</option>)}</select>
            <label className='text-xs text-slate-500'>Observation</label><textarea className='w-full rounded-lg border border-slate-200 p-3 text-sm' value={form.data.observation} onChange={e => form.setData('observation', e.target.value)} />
            {Object.values(form.errors)[0] && <p className='text-xs text-red-600'>{Object.values(form.errors)[0]}</p>}
            <div className='mt-auto flex gap-2 border-t border-slate-200 pt-3'><button className='h-10 flex-1 rounded-lg border border-slate-200 text-sm' onClick={() => setOpen(false)}>Fermer</button><button className='h-10 flex-1 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:bg-blue-400' disabled={form.processing} onClick={() => { const method = isEdit && editingId ? form.put : form.post; const url = isEdit && editingId ? route('finances.depenses.update', editingId) : route('finances.depenses.store'); method(url, { preserveScroll: true, onSuccess: () => { setOpen(false); setIsEdit(false); setEditingId(null); form.reset(); router.reload({ only: ['depenses', 'metrics'] }); } }); }}>{form.processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}</button></div>
        </div></div></div>}

        {deleteTarget && <div className='fixed inset-0 z-50 grid place-items-center bg-black/30'><div className='w-full max-w-md rounded-2xl bg-white p-5'><p className='font-semibold'>Supprimer la dépense « {deleteTarget.libelle} » ?</p><div className='mt-3 flex gap-2'><button onClick={() => setDeleteTarget(null)} className='rounded-xl border px-3 py-2'>Annuler</button><button className='rounded-xl bg-red-600 px-3 py-2 text-white' onClick={() => router.delete(route('finances.depenses.destroy', deleteTarget.id), { preserveScroll: true, onSuccess: () => { setDeleteTarget(null); router.reload({ only: ['depenses', 'metrics'] }); } })}>Supprimer</button></div></div></div>}
    </div></AppLayout>;
}
