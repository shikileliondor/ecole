import AppLayout from '@/Layouts/AppLayout';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import type { FinanceProps } from './types';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;
const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('fr-FR') : '—';

export default function FinancesDepenses() {
  const { props } = usePage<{ props: FinanceProps }>() as any; const data = props as FinanceProps;
  const depenses = data.depenses ?? [];
  const totalJour = useMemo(()=>depenses.filter((d:any)=> new Date(d.date).toDateString()===new Date().toDateString() && d.statut !== 'annulee').reduce((s:number,d:any)=>s+d.montant,0),[depenses]);
  const totalMois = useMemo(()=>depenses.filter((d:any)=>{ const dt=new Date(d.date); const n=new Date(); return dt.getMonth()===n.getMonth() && dt.getFullYear()===n.getFullYear() && d.statut!=='annulee';}).reduce((s:number,d:any)=>s+d.montant,0),[depenses]);
  const solde = (data.metrics?.totalEncaisse || 0) - (depenses.filter((d:any)=>d.statut!=='annulee').reduce((s:number,d:any)=>s+d.montant,0));
  return <AppLayout title="Dépenses / Caisse"><div className="space-y-4 bg-[#F8FAFC] p-4">
    <div><h1 className="text-2xl font-bold text-[#0F172A]">Dépenses / Caisse</h1><p className="text-sm text-[#64748B]">Suivez les sorties d’argent, les justificatifs et le solde de caisse.</p></div>
    <div className="grid gap-3 md:grid-cols-4">{[['Dépenses du jour',totalJour],['Dépenses du mois',totalMois],['Nombre de dépenses',depenses.length],['Solde caisse estimé',solde]].map(([l,v])=><div key={String(l)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{l}</p><p className="text-xl font-semibold">{typeof v==='number'?formatCurrency(v):String(v)}</p></div>)}</div>
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className='p-3 text-left'>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th><th>Mode</th><th>Responsable</th><th>Justificatif</th><th>Statut</th></tr></thead><tbody>{depenses.map((d:any)=><tr key={d.id} className='border-t'><td className='p-3'>{formatDate(d.date)}</td><td>{d.libelle}</td><td>{d.categorie || 'Non renseigné'}</td><td>{formatCurrency(d.montant)}</td><td>{d.mode_paiement || 'Non renseigné'}</td><td>{d.responsable || 'Non renseigné'}</td><td>{d.justificatif_url ? <a className='text-blue-600' href={d.justificatif_url} target='_blank'>Voir</a> : '—'}</td><td>{d.statut}</td></tr>)}{depenses.length===0 && <tr><td colSpan={8} className='p-8 text-center text-slate-500'>Aucune donnée disponible</td></tr>}</tbody></table></div>
  </div></AppLayout>
}
