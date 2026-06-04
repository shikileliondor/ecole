import AppLayout from '@/Layouts/AppLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Paperclip } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DepenseRow, FinanceProps } from './types';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;
const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('fr-FR') : '—');

const emptyDepense = {
    libelle: '',
    categorie: '',
    montant: '',
    date_depense: new Date().toISOString().slice(0, 10),
    responsable_id: '',
    mode_paiement: 'especes',
    observation: '',
    justificatif: null as File | null,
};

export default function FinancesDepenses() {
    const { props } = usePage<{ props: FinanceProps }>() as any;
    const data = props as FinanceProps;
    const depenses = data.depenses ?? [];

    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DepenseRow | null>(null);

    const form = useForm({ ...emptyDepense });
    const editingDepense = depenses.find((depense) => depense.id === editingId);

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
        form.setData({
            libelle: d.libelle || '',
            categorie: d.categorie || '',
            montant: String(d.montant || ''),
            date_depense: d.date || new Date().toISOString().slice(0, 10),
            responsable_id: d.responsable_id ? String(d.responsable_id) : '',
            mode_paiement: d.mode_paiement || 'especes',
            observation: d.observation || '',
            justificatif: null,
        });
        form.clearErrors();
        setOpen(true);
    };

    const closeForm = () => {
        setOpen(false);
        setIsEdit(false);
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const handleSaveDepense = () => {
        const url = isEdit && editingId ? route('finances.depenses.update', editingId) : route('finances.depenses.store');

        form.transform((payload) => (isEdit && editingId ? { ...payload, _method: 'put' } : payload));
        form.post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                closeForm();
                router.reload({ only: ['depenses', 'metrics'] });
            },
        });
    };

    return <AppLayout title='Dépenses / Caisse'><div className='space-y-4 bg-[#F8FAFC] p-4'>
        <div className='flex items-center justify-between'><div><h1 className='text-2xl font-bold text-[#0F172A]'>Dépenses / Caisse</h1><p className='text-sm text-[#64748B]'>Suivez les sorties d’argent, les justificatifs et le solde de caisse.</p></div><button onClick={openCreate} className='h-10 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700'>Nouvelle dépense</button></div>
        <div className='grid gap-3 md:grid-cols-4'>{[['Dépenses du jour', totalJour], ['Dépenses du mois', totalMois], ['Nombre de dépenses', depenses.length], ['Solde caisse estimé', solde]].map(([l, v]) => <div key={String(l)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm text-slate-500'>{l}</p><p className='text-xl font-semibold'>{typeof v === 'number' ? formatCurrency(v) : String(v)}</p></div>)}</div>
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto'><table className='min-w-full text-sm'><thead className='bg-slate-50'><tr><th className='p-3 text-left'>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th>Mode</th><th>Responsable</th><th>Justificatif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{depenses.map((d: any) => <tr key={d.id} className='border-t'><td className='p-3'>{formatDate(d.date)}</td><td>{d.libelle}</td><td>{d.categorie || 'Non renseigné'}</td><td>{formatCurrency(d.montant)}</td><td>{d.mode_paiement || 'Non renseigné'}</td><td>{d.responsable || 'Non renseigné'}</td><td>{d.justificatif_url ? <a className='text-blue-600 hover:underline' href={d.justificatif_url} target='_blank' rel='noreferrer'>Voir</a> : '—'}</td><td>{d.statut}</td><td><div className='flex gap-2'><button className='text-slate-700 disabled:text-slate-300' disabled={d.statut === 'annulee'} onClick={() => openEdit(d)}>Modifier</button><button className='text-red-600 disabled:text-slate-300' disabled={d.statut === 'annulee'} onClick={() => setDeleteTarget(d)}>Supprimer</button></div></td></tr>)}{depenses.length === 0 && <tr><td colSpan={9} className='p-8 text-center text-slate-500'>Aucune donnée disponible</td></tr>}</tbody></table></div>

        {open && <div className='fixed inset-0 z-50 bg-black/30'><div className='ml-auto h-full w-full border-l border-slate-200 bg-white p-5 shadow-xl md:w-[520px] md:max-w-[520px]'><div className='flex h-full flex-col gap-3'><div className='min-h-0 flex-1 space-y-3 overflow-y-auto pr-1'><h3 className='text-xl font-semibold text-slate-900'>{isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}</h3>
            <label className='text-xs text-slate-500'>Libellé</label><input className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.libelle} onChange={e => form.setData('libelle', e.target.value)} />{form.errors.libelle && <p className='text-xs text-red-600'>{form.errors.libelle}</p>}
            <label className='text-xs text-slate-500'>Catégorie</label><input className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.categorie} onChange={e => form.setData('categorie', e.target.value)} />{form.errors.categorie && <p className='text-xs text-red-600'>{form.errors.categorie}</p>}
            <label className='text-xs text-slate-500'>Montant</label><input type='number' className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.montant} onChange={e => form.setData('montant', e.target.value)} />{form.errors.montant && <p className='text-xs text-red-600'>{form.errors.montant}</p>}
            <label className='text-xs text-slate-500'>Date</label><input type='date' className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.date_depense} onChange={e => form.setData('date_depense', e.target.value)} />{form.errors.date_depense && <p className='text-xs text-red-600'>{form.errors.date_depense}</p>}
            <label className='text-xs text-slate-500'>Responsable</label><select className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.responsable_id} onChange={e => form.setData('responsable_id', e.target.value)}><option value=''>Non renseigné</option>{(data.personnel || []).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}</select>{form.errors.responsable_id && <p className='text-xs text-red-600'>{form.errors.responsable_id}</p>}
            <label className='text-xs text-slate-500'>Mode de paiement</label><select className='h-11 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.mode_paiement} onChange={e => form.setData('mode_paiement', e.target.value)}>{data.modesPaiement.map((m) => <option key={m} value={m}>{m}</option>)}</select>{form.errors.mode_paiement && <p className='text-xs text-red-600'>{form.errors.mode_paiement}</p>}
            <label className='text-xs text-slate-500'>Observation</label><textarea className='min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm' value={form.data.observation} onChange={e => form.setData('observation', e.target.value)} />{form.errors.observation && <p className='text-xs text-red-600'>{form.errors.observation}</p>}
            <label className='text-xs text-slate-500'>Document justificatif</label><label className='flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50'><Paperclip className='h-4 w-4 text-blue-600' /><span className='flex-1 truncate'>{form.data.justificatif?.name || (editingDepense?.justificatif_url ? 'Remplacer le justificatif existant' : 'Ajouter un document PDF ou image')}</span><input type='file' className='hidden' accept='.pdf,.jpg,.jpeg,.png,.webp' onChange={e => form.setData('justificatif', e.target.files?.[0] || null)} /></label><p className='text-[11px] text-slate-500'>Formats acceptés : PDF, JPG, PNG ou WebP (max. 4 Mo).</p>{editingDepense?.justificatif_url && <a className='text-xs font-medium text-blue-600 hover:underline' href={editingDepense.justificatif_url} target='_blank' rel='noreferrer'>Voir le justificatif actuel</a>}{form.errors.justificatif && <p className='text-xs text-red-600'>{form.errors.justificatif}</p>}
            {Object.values(form.errors)[0] && <p className='rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600'>{Object.values(form.errors)[0]}</p>}</div>
            <div className='mt-auto flex gap-2 border-t border-slate-200 pt-3'><button className='h-11 flex-1 rounded-lg border border-slate-200 text-sm' onClick={closeForm}>Fermer</button><button className='h-11 flex-1 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:bg-blue-400' disabled={form.processing} onClick={handleSaveDepense}>{form.processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}</button></div>
        </div></div></div>}

        {deleteTarget && <div className='fixed inset-0 z-50 grid place-items-center bg-black/30'><div className='w-full max-w-md rounded-2xl bg-white p-5'><p className='font-semibold'>Supprimer la dépense « {deleteTarget.libelle} » ?</p><div className='mt-3 flex gap-2'><button onClick={() => setDeleteTarget(null)} className='rounded-xl border px-3 py-2'>Annuler</button><button className='rounded-xl bg-red-600 px-3 py-2 text-white' onClick={() => router.delete(route('finances.depenses.destroy', deleteTarget.id), { preserveScroll: true, onSuccess: () => { setDeleteTarget(null); router.reload({ only: ['depenses', 'metrics'] }); } })}>Supprimer</button></div></div></div>}
    </div></AppLayout>;
}
