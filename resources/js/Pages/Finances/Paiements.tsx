import AppLayout from '@/Layouts/AppLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Paperclip, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FinanceProps, PaymentRow } from './types';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;
const formatDate = (date: string) => date;
const toDisplayDate = (date: string) => {
    if (!date) return '—';
    const parts = date.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return date;
};

const emptyPayment = {
    inscription_id: '',
    type_frais_id: '',
    montant_attendu: '0',
    montant_paye: '',
    mode_paiement: '',
    date_paiement: new Date().toISOString().slice(0, 10),
    reference_transaction: '',
    note_caissier: '',
    justificatif: null as File | null,
};

const modeBadge = (mode: string) => ({ especes: 'bg-slate-100 text-slate-700', orange_money: 'bg-orange-100 text-orange-700', wave: 'bg-cyan-100 text-cyan-700', mtn_momo: 'bg-yellow-100 text-yellow-800', virement: 'bg-violet-100 text-violet-700' }[mode] || 'bg-slate-100 text-slate-700');
const statusBadge = (s: string) => ({ paye: 'bg-emerald-100 text-emerald-700', partiel: 'bg-orange-100 text-orange-700', annule: 'bg-red-100 text-red-700' }[s] || 'bg-slate-100 text-slate-700');
const normalizeSearch = (value: string) => value.trim().toLowerCase();

export default function FinancesPaiements() {
    const { props } = usePage<{ props: FinanceProps }>() as any;
    const data = props as FinanceProps;

    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [receipt, setReceipt] = useState<PaymentRow | null>(null);
    const [cancelTarget, setCancelTarget] = useState<PaymentRow | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [studentQuery, setStudentQuery] = useState('');

    const [f, setF] = useState({ q: '', classe: '', type: '', mode: '', status: '', period: 'all', page: 1 });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const pageSize = 12;

    const form = useForm({ ...emptyPayment, mode_paiement: data.modesPaiement[0] || 'especes' });
    const cancelForm = useForm({ motif_annulation: '' });

    const selectedEleve = data.eleves.find((e) => String(e.inscription_id) === form.data.inscription_id);
    const filteredEleves = useMemo(() => {
        const q = normalizeSearch(studentQuery);
        if (!q) return data.eleves;
        return data.eleves.filter((e: any) => `${e.nom} ${e.classe || ''} ${e.matricule || ''}`.toLowerCase().includes(q));
    }, [data.eleves, studentQuery]);

    useEffect(() => {
        if (isEdit) return;

        const q = normalizeSearch(studentQuery);
        const exactEleve = filteredEleves.find((e: any) => normalizeSearch(e.nom || '') === q || normalizeSearch(e.matricule || '') === q);
        const autoSelectedEleve = exactEleve ?? (q && filteredEleves.length === 1 ? filteredEleves[0] : null);
        const nextInscriptionId = autoSelectedEleve ? String(autoSelectedEleve.inscription_id) : '';

        if (form.data.inscription_id === nextInscriptionId) return;

        form.setData({
            ...form.data,
            inscription_id: nextInscriptionId,
            type_frais_id: '',
            montant_attendu: '0',
            montant_paye: '',
        });
    }, [filteredEleves, form.data.inscription_id, isEdit, studentQuery]);

    const eleveFeeRows = useMemo(() => {
        if (!form.data.inscription_id) return [];
        const paidByFee = data.payments
            .filter((p) => String(p.inscription_id) === form.data.inscription_id && p.statut !== 'annule')
            .reduce<Record<string, number>>((acc, p) => {
                acc[String(p.type_frais_id)] = (acc[String(p.type_frais_id)] || 0) + p.montant;
                return acc;
            }, {});

        return data.typesFrais.map((fee) => {
            const paid = paidByFee[String(fee.id)] || 0;
            const due = fee.montant || 0;
            const remaining = Math.max(0, due - paid);
            return { fee, paid, due, remaining };
        });
    }, [data.payments, data.typesFrais, form.data.inscription_id]);

    const selectableFees = eleveFeeRows.filter((item) => item.remaining > 0 || String(item.fee.id) === form.data.type_frais_id);
    const currentFee = data.typesFrais.find((fee) => String(fee.id) === form.data.type_frais_id);

    const openCreate = () => {
        setIsEdit(false);
        setEditingId(null);
        setStudentQuery('');
        setShowSuggestions(false);
        form.reset();
        form.setData({ ...emptyPayment, mode_paiement: data.modesPaiement[0] || 'especes' });
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (r: PaymentRow) => {
        const fee = data.typesFrais.find((x) => x.id === r.type_frais_id);
        setIsEdit(true);
        setEditingId(r.id);
        setStudentQuery(r.eleve);
        form.setData({
            inscription_id: String(r.inscription_id),
            type_frais_id: String(r.type_frais_id),
            montant_attendu: String(fee?.montant || r.montant),
            montant_paye: String(r.montant),
            mode_paiement: r.mode || data.modesPaiement[0] || 'especes',
            date_paiement: r.date.split('/').reverse().join('-'),
            reference_transaction: r.reference || '',
            note_caissier: r.note_caissier || '',
            justificatif: null,
        });
        form.clearErrors();
        setOpen(true);
    };

    const dejaPaye = useMemo(
        () => data.payments.filter((p) => String(p.inscription_id) === form.data.inscription_id && String(p.type_frais_id) === form.data.type_frais_id && p.statut !== 'annule').reduce((a, b) => a + b.montant, 0),
        [data.payments, form.data.inscription_id, form.data.type_frais_id],
    );
    const montantDu = currentFee?.montant || 0;
    const reste = Math.max(0, montantDu - dejaPaye);
    const montantPaye = Number(form.data.montant_paye || 0);
    const resteApresPaiement = Math.max(0, reste - montantPaye);

    const handleSavePayment = () => {
        const url = isEdit && editingId ? route('finances.paiements.update', editingId) : route('finances.paiements.store');
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                setIsEdit(false);
                setEditingId(null);
                form.reset();
                router.reload({ only: ['payments', 'metrics', 'impayes'] });
                setToast('Paiement enregistré avec succès.');
                setTimeout(() => setToast(null), 3000);
            },
        };

        form.transform((data) => (isEdit && editingId ? { ...data, _method: 'put' } : data));
        form.post(url, options);
    };

    const filtered = useMemo(() => data.payments.filter((p) => {
        if (f.q && !`${p.eleve} ${p.reference || ''}`.toLowerCase().includes(f.q.toLowerCase())) return false;
        if (f.classe && p.classe !== f.classe) return false;
        if (f.type && p.type_frais !== f.type) return false;
        if (f.mode && p.mode !== f.mode) return false;
        if (f.status && p.statut !== f.status) return false;
        return true;
    }), [data.payments, f]);

    const total = filtered.length;
    const start = (f.page - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);
    const pages = Math.max(1, Math.ceil(total / pageSize));

    return <AppLayout title='Paiements / Encaissements'><div className='space-y-4 bg-[#F8FAFC] p-3 md:p-5'>
        {toast && <div className='fixed right-4 top-4 z-[60] rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg'>{toast}</div>}
        <div className='flex items-center justify-between'><div><h1 className='text-2xl font-bold text-[#0F172A]'>Paiements / Encaissements</h1><p className='text-sm text-[#64748B]'>Enregistrez les paiements des élèves et consultez l'historique des encaissements.</p></div><button onClick={openCreate} className='h-10 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700'>Nouveau paiement</button></div>
        <div className='grid gap-3 md:grid-cols-4'>{[['Total encaissé', data.metrics.totalEncaisse], ['Encaissements du mois', data.metrics.paiementsDuMois], ['Nombre de paiements', data.metrics.nombrePaiements], ['Paiements annulés', data.metrics.paiementsAnnules]].map(([l, v]) => <div key={String(l)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm text-slate-500'>{l}</p><p className='text-xl font-semibold text-[#0F172A]'>{typeof v === 'number' ? formatCurrency(v) : v}</p></div>)}</div>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid gap-2 md:grid-cols-6'><input className='rounded-xl border p-2 text-sm' placeholder='Recherche élève' value={f.q} onChange={e => setF({ ...f, q: e.target.value, page: 1 })} /><select className='rounded-xl border p-2 text-sm' value={f.classe} onChange={e => setF({ ...f, classe: e.target.value, page: 1 })}><option value=''>Classe</option>{data.classes.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select><select className='rounded-xl border p-2 text-sm' value={f.type} onChange={e => setF({ ...f, type: e.target.value, page: 1 })}><option value=''>Type de frais</option>{data.typesFrais.map(t => <option key={t.id} value={t.libelle}>{t.libelle}</option>)}</select><select className='rounded-xl border p-2 text-sm' value={f.mode} onChange={e => setF({ ...f, mode: e.target.value, page: 1 })}><option value=''>Mode</option>{data.modesPaiement.map(m => <option key={m} value={m}>{m}</option>)}</select><select className='rounded-xl border p-2 text-sm' value={f.status} onChange={e => setF({ ...f, status: e.target.value, page: 1 })}><option value=''>Statut</option><option value='paye'>payé</option><option value='partiel'>partiel</option><option value='annule'>annulé</option><option value='impaye'>en attente</option></select><button className='rounded-xl border p-2 text-sm' onClick={() => setF({ q: '', classe: '', type: '', mode: '', status: '', period: 'all', page: 1 })}>Réinitialiser</button></div>
        <div className='rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto'><table className='min-w-full text-sm'><thead className='bg-slate-50 text-slate-600'><tr><th className='p-3 text-left'>Date</th><th>Élève</th><th>Classe</th><th>Type de frais</th><th>Montant payé</th><th>Mode</th><th>Référence</th><th>Justificatif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{rows.map(r => <tr key={r.id} className='border-t hover:bg-slate-50'><td className='p-3'>{formatDate(r.date)}</td><td>{r.eleve}</td><td>{r.classe}</td><td>{r.type_frais}</td><td>{formatCurrency(r.montant)}</td><td><span className={`rounded-full px-2 py-1 text-xs ${modeBadge(r.mode)}`}>{r.mode}</span></td><td>{r.reference || 'Non renseigné'}</td><td>{r.justificatif_url ? <a className='text-blue-600 hover:underline' href={r.justificatif_url} target='_blank' rel='noreferrer'>Voir</a> : '—'}</td><td><span className={`rounded-full px-2 py-1 text-xs ${statusBadge(r.statut)}`}>{r.statut}</span></td><td><div className='flex gap-2'><button className='text-blue-600' onClick={() => setReceipt(r)}>Voir reçu</button><button className='text-slate-700 disabled:text-slate-300' disabled={r.statut === 'annule'} onClick={() => openEdit(r)}>Modifier</button><button className='text-red-600 disabled:text-slate-300' disabled={r.statut === 'annule'} onClick={() => setCancelTarget(r)}>Annuler</button></div></td></tr>)}{rows.length === 0 && <tr><td className='p-6 text-center text-slate-500' colSpan={10}>{total === 0 ? 'Aucune donnée disponible' : 'Aucun résultat pour ces filtres.'}</td></tr>}</tbody></table></div>
        <div className='flex items-center justify-between text-sm'><p>Affichage de {total ? start + 1 : 0} à {Math.min(start + pageSize, total)} sur {total} paiements</p><div className='flex gap-1'><button className='rounded border px-3 py-1' disabled={f.page === 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Précédent</button>{Array.from({ length: pages }).slice(0, 7).map((_, i) => <button key={i} className={`rounded border px-3 py-1 ${f.page === i + 1 ? 'bg-blue-600 text-white' : ''}`} onClick={() => setF({ ...f, page: i + 1 })}>{i + 1}</button>)}<button className='rounded border px-3 py-1' disabled={f.page === pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Suivant</button></div></div>

        {open && <div className='fixed inset-0 z-50 bg-black/30'><div className='ml-auto h-full w-full border-l border-slate-200 bg-white p-5 shadow-xl md:w-[440px] md:max-w-[480px]'><div className='flex h-full flex-col'><div className='flex items-start justify-between'><div><h3 className='text-lg font-semibold text-slate-900'>{isEdit ? 'Modifier le paiement' : 'Nouveau paiement'}</h3><p className='text-xs text-slate-500'>Enregistrez un encaissement pour un élève.</p></div><button className='rounded-md p-2 text-slate-500 hover:bg-slate-100' onClick={() => { setOpen(false); setIsEdit(false); setEditingId(null); }}><X className='h-4 w-4' /></button></div>
            <div className='mt-5 flex-1 space-y-5 overflow-y-auto pr-1'>
                <section className='space-y-2'><h4 className='text-sm font-semibold text-slate-800'>Élève concerné</h4>
                    <label className='text-xs text-slate-500'>Élève</label>
                    <div className='relative'>
                        <Search className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                        <input
                            disabled={isEdit}
                            value={studentQuery}
                            onChange={(e) => { setStudentQuery(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            placeholder='Tapez le nom ou le matricule…'
                            className='h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm disabled:bg-slate-100'
                        />
                        {!isEdit && showSuggestions && studentQuery.trim() && !selectedEleve && filteredEleves.length > 0 && (
                            <div className='absolute left-0 right-0 top-11 z-50 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg'>
                                {filteredEleves.slice(0, 8).map((e: any) => (
                                    <button
                                        key={e.inscription_id}
                                        type='button'
                                        onMouseDown={() => { setStudentQuery(e.nom); setShowSuggestions(false); }}
                                        className='flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0'
                                    >
                                        <div className='flex-1 min-w-0'>
                                            <p className='truncate font-medium text-slate-900 text-sm'>{e.nom}</p>
                                            <p className='text-xs text-slate-400'>{e.classe || '—'} · {e.matricule || '—'}</p>
                                        </div>
                                    </button>
                                ))}
                                {filteredEleves.length > 8 && (
                                    <p className='px-3 py-2 text-xs text-slate-400 bg-slate-50'>+{filteredEleves.length - 8} autres — affinez la recherche</p>
                                )}
                            </div>
                        )}
                        {!isEdit && showSuggestions && studentQuery.trim() && !selectedEleve && filteredEleves.length === 0 && (
                            <div className='absolute left-0 right-0 top-11 z-50 rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-3'>
                                <p className='text-xs text-slate-400'>Aucun élève trouvé pour «&nbsp;{studentQuery}&nbsp;»</p>
                            </div>
                        )}
                    </div>
                    {selectedEleve ? <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-slate-600'><p className='font-semibold text-emerald-800'>Élève sélectionné automatiquement</p><p className='mt-1 font-semibold text-slate-800'>{selectedEleve.nom}</p><p>Classe : {selectedEleve.classe || 'Non renseignée'}</p><p>Matricule : {selectedEleve.matricule || 'Non renseigné'}</p><p>Année scolaire : {selectedEleve.annee_scolaire || 'Non renseignée'}</p><p>Statut financier : {(selectedEleve as any).statut_financier || 'Non renseigné'}</p></div> : <p className='text-xs text-slate-500'>Tapez le nom ou le matricule complet de l'élève pour afficher ses frais.</p>}
                </section>

                <section className='space-y-2'><h4 className='text-sm font-semibold text-slate-800'>Frais à régler</h4>
                    <label className='text-xs text-slate-500'>Type de frais</label>
                    <select disabled={isEdit || !selectedEleve} className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm disabled:bg-slate-100' value={form.data.type_frais_id} onChange={e => { const v = e.target.value; form.setData('type_frais_id', v); const fee = data.typesFrais.find(x => String(x.id) === v); form.setData('montant_attendu', String(fee?.montant || 0)); }}><option value=''>Sélectionnez un type de frais</option>{selectableFees.map(({ fee }) => <option key={fee.id} value={fee.id}>{fee.libelle}</option>)}</select>
                    <div className='grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-xs'><div><p className='text-slate-500'>Montant dû</p><p className='font-semibold text-slate-900'>{formatCurrency(montantDu)}</p></div><div><p className='text-slate-500'>Déjà payé</p><p className='font-semibold text-slate-900'>{formatCurrency(dejaPaye)}</p></div><div><p className='text-slate-500'>Reste à payer</p>{reste === 0 ? <p className='font-semibold text-emerald-600'>Déjà soldé</p> : <p className='font-semibold text-orange-600'>{formatCurrency(reste)}</p>}</div></div>
                </section>

                <section className='space-y-2'><h4 className='text-sm font-semibold text-slate-800'>Paiement</h4>
                    <label className='text-xs text-slate-500'>Montant payé</label><input className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.montant_paye} onChange={e => form.setData('montant_paye', e.target.value)} />{form.errors.montant_paye && <p className='text-xs text-red-600'>{form.errors.montant_paye}</p>}
                    <label className='text-xs text-slate-500'>Mode de paiement</label><select className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.mode_paiement} onChange={e => form.setData('mode_paiement', e.target.value)}>{data.modesPaiement.map(m => <option key={m} value={m}>{m}</option>)}</select>{form.errors.mode_paiement && <p className='text-xs text-red-600'>{form.errors.mode_paiement}</p>}
                    <label className='text-xs text-slate-500'>Date de paiement</label><input type='date' className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.date_paiement} onChange={e => form.setData('date_paiement', e.target.value)} />{form.errors.date_paiement && <p className='text-xs text-red-600'>{form.errors.date_paiement}</p>}
                    <label className='text-xs text-slate-500'>Référence</label><input className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm' value={form.data.reference_transaction} onChange={e => form.setData('reference_transaction', e.target.value)} />{form.errors.reference_transaction && <p className='text-xs text-red-600'>{form.errors.reference_transaction}</p>}
                    <label className='text-xs text-slate-500'>Observation</label><textarea className='w-full rounded-lg border border-slate-200 p-3 text-sm' value={form.data.note_caissier} onChange={e => form.setData('note_caissier', e.target.value)} />{form.errors.note_caissier && <p className='text-xs text-red-600'>{form.errors.note_caissier}</p>}
                    <label className='text-xs text-slate-500'>Document justificatif</label><label className='flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50'><Paperclip className='h-4 w-4 text-blue-600' /><span className='flex-1 truncate'>{form.data.justificatif?.name || (isEdit && data.payments.find((p) => p.id === editingId)?.justificatif_url ? 'Remplacer le justificatif existant' : 'Ajouter un fichier PDF ou image')}</span><input type='file' className='hidden' accept='.pdf,.jpg,.jpeg,.png,.webp' onChange={e => form.setData('justificatif', e.target.files?.[0] || null)} /></label><p className='text-[11px] text-slate-500'>Formats acceptés : PDF, JPG, PNG ou WebP (max. 4 Mo).</p>{isEdit && data.payments.find((p) => p.id === editingId)?.justificatif_url && <a className='text-xs font-medium text-blue-600 hover:underline' href={data.payments.find((p) => p.id === editingId)?.justificatif_url || '#'} target='_blank' rel='noreferrer'>Voir le justificatif actuel</a>}{form.errors.justificatif && <p className='text-xs text-red-600'>{form.errors.justificatif}</p>}
                </section>

                <section className='space-y-2'><h4 className='text-sm font-semibold text-slate-800'>Résumé du paiement</h4><div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1'><p><span className='text-slate-500'>Élève :</span> {selectedEleve?.nom || '—'}</p><p><span className='text-slate-500'>Classe :</span> {selectedEleve?.classe || '—'}</p><p><span className='text-slate-500'>Frais :</span> {currentFee?.libelle || '—'}</p><p><span className='text-slate-500'>Montant payé :</span> {formatCurrency(montantPaye)}</p><p><span className='text-slate-500'>Mode :</span> {form.data.mode_paiement || '—'}</p><p><span className='text-slate-500'>Date :</span> {toDisplayDate(form.data.date_paiement)}</p><p><span className='text-slate-500'>Justificatif :</span> {form.data.justificatif?.name || (isEdit && data.payments.find((p) => p.id === editingId)?.justificatif_url ? 'Conservé' : '—')}</p><p><span className='text-slate-500'>Reste après paiement :</span> {formatCurrency(resteApresPaiement)} {resteApresPaiement === 0 ? <span className='ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700'>Soldé</span> : <span className='ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-orange-700'>Paiement partiel</span>}</p></div></section>
                {Object.keys(form.errors).length > 0 && <div className='rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700'>{Object.values(form.errors)[0]}</div>}
            </div>
            <div className='mt-5 flex gap-2 border-t border-slate-200 pt-3'><button className='h-10 flex-1 rounded-lg border border-slate-200 text-sm' onClick={() => { setOpen(false); setIsEdit(false); setEditingId(null); }}>Fermer</button><button className='h-10 flex-1 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400' disabled={form.processing || !form.data.montant_paye || (Number(form.data.montant_paye) > reste && reste > 0)} onClick={handleSavePayment}>{form.processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer le paiement'}</button></div>
        </div></div></div>}
        {receipt && <div className='fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-[2px]'><div className='w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl'><div className='bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-5 text-white'><p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/80'>Finance scolaire</p><h3 className='mt-1 text-2xl font-bold'>Reçu de paiement</h3><p className='mt-1 text-sm text-white/80'>Reçu généré le {receipt.date}</p></div><div className='space-y-4 px-6 py-5'><div className='grid gap-3 sm:grid-cols-2'>{[["Élève", receipt.eleve], ["Classe", receipt.classe], ["Type de frais", receipt.type_frais], ["Mode", receipt.mode], ["Référence", receipt.reference || 'Non renseigné'], ["Caissier", receipt.encaisse_par_nom || 'Non renseigné'], ["Date", receipt.date], ["Statut", receipt.statut]].map(([label, value]) => <div key={String(label)} className='rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3'><p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{label}</p><p className='mt-1 text-sm font-medium text-slate-900'>{value}</p></div>)}</div><div className='rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4'><p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>Montant payé</p><p className='mt-1 text-3xl font-extrabold text-emerald-700'>{formatCurrency(receipt.montant)}</p></div><div className='flex flex-wrap gap-2 border-t border-slate-200 pt-4'><button onClick={() => window.print()} className='h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'>Imprimer</button><button disabled className='h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400'>Télécharger PDF</button><button onClick={() => setReceipt(null)} className='ml-auto h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700'>Fermer</button></div></div></div></div>}
        {cancelTarget && <div className='fixed inset-0 z-50 grid place-items-center bg-black/30'><div className='w-full max-w-md rounded-2xl bg-white p-5'><p className='font-semibold'>Voulez-vous vraiment annuler ce paiement ? Cette action conservera une trace dans l'historique.</p><textarea className='mt-3 w-full rounded-xl border p-2' placeholder="Motif d'annulation" value={cancelForm.data.motif_annulation} onChange={e => cancelForm.setData('motif_annulation', e.target.value)} /><div className='mt-3 flex gap-2'><button onClick={() => setCancelTarget(null)} className='rounded-xl border px-3 py-2'>Fermer</button><button className='rounded-xl bg-red-600 px-3 py-2 text-white' onClick={() => cancelForm.post(route('finances.paiements.cancel', cancelTarget.id), { preserveScroll: true, onSuccess: () => { setCancelTarget(null); cancelForm.reset(); router.reload({ only: ['payments', 'metrics', 'impayes'] }); } })}>Confirmer l'annulation</button></div></div></div>}
    </div></AppLayout>;
}
