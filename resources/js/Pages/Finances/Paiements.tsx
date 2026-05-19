import AppLayout from '@/Layouts/AppLayout';
import { useForm, usePage } from '@inertiajs/react';
import type { FinanceProps } from './types';
import { useMemo, useState } from 'react';

const fcfa=(n:number)=>new Intl.NumberFormat('fr-FR').format(n)+' FCFA';

export default function FinancesPaiements() {
  const {props}=usePage<{props:FinanceProps}>() as any; const p=props as FinanceProps;
  const [open,setOpen]=useState(false);
  const form=useForm({inscription_id:'',type_frais_id:'',montant_attendu:'0',montant_paye:'',mode_paiement:'especes',date_paiement:new Date().toISOString().slice(0,10),reference_transaction:'',note_caissier:''});
  const selected=p.eleves.find(e=>String(e.inscription_id)===form.data.inscription_id);
  const fee=p.typesFrais.find(f=>String(f.id)===form.data.type_frais_id);
  const paid=useMemo(()=>p.payments.filter(x=>String(x.inscription_id)===form.data.inscription_id && String(x.type_frais_id)===form.data.type_frais_id).reduce((a,b)=>a+b.montant,0),[p.payments,form.data.inscription_id,form.data.type_frais_id]);
  const due=fee?.montant ?? 0; const rest=Math.max(0,due-paid);
  return <AppLayout title='Paiements / Encaissements'><div className='space-y-4 bg-[#F8FAFC] p-2'>
    <div className='flex items-center justify-between'><div><h1 className='text-2xl font-semibold text-slate-900'>Paiements / Encaissements</h1><p className='text-sm text-slate-500'>Enregistrez les paiements des élèves et consultez l’historique des encaissements.</p></div><button onClick={()=>setOpen(true)} className='rounded-lg bg-[#0B63CE] px-4 py-2 text-white'>Nouveau paiement</button></div>
    <div className='grid gap-3 md:grid-cols-4'>{[['Total encaissé',p.metrics.totalEncaisse],['Encaissements du mois',p.metrics.paiementsDuMois],['Nombre de paiements',p.metrics.nombrePaiements],['Paiements annulés',p.metrics.paiementsAnnules]].map(([l,v])=><div key={String(l)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><div className='text-xs text-slate-500'>{l}</div><div className='mt-1 font-semibold'>{typeof v==='number'?fcfa(v):v}</div></div>)}</div>
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-auto'><table className='w-full text-sm'><thead><tr className='text-left text-slate-500'><th>Date</th><th>Élève</th><th>Classe</th><th>Type de frais</th><th>Montant payé</th><th>Mode</th><th>Référence</th><th>Statut</th></tr></thead><tbody>{p.payments.length?p.payments.map(r=><tr key={r.id} className='border-t'><td>{r.date}</td><td>{r.eleve}</td><td>{r.classe}</td><td>{r.type_frais}</td><td>{fcfa(r.montant)}</td><td>{r.mode}</td><td>{r.reference??'—'}</td><td>{r.statut}</td></tr>):<tr><td colSpan={8} className='py-8 text-center text-slate-500'>Aucun paiement disponible.</td></tr>}</tbody></table></div>
    {open && <div className='fixed inset-0 z-50 bg-black/30'><div className='ml-auto h-full w-full max-w-xl overflow-auto bg-white p-4'><h3 className='text-lg font-semibold'>Nouveau paiement</h3><div className='grid gap-2 py-3'>
      <select value={form.data.inscription_id} onChange={e=>form.setData('inscription_id',e.target.value)} className='rounded border p-2'><option value=''>Élève</option>{p.eleves.map(e=><option key={e.inscription_id} value={e.inscription_id}>{e.nom}</option>)}</select>
      <div className='text-xs text-slate-500'>Classe: {selected?.classe ?? '—'}</div>
      <select value={form.data.type_frais_id} onChange={e=>{form.setData('type_frais_id',e.target.value); form.setData('montant_attendu',String(fee?.montant ?? 0));}} className='rounded border p-2'><option value=''>Type de frais</option>{p.typesFrais.map(f=><option key={f.id} value={f.id}>{f.libelle}</option>)}</select>
      <div className='text-xs'>Montant dû: {fcfa(due)} | Déjà payé: {fcfa(paid)} | Reste: {fcfa(rest)}</div>
      <input className='rounded border p-2' placeholder='Montant payé' value={form.data.montant_paye} onChange={e=>form.setData('montant_paye',e.target.value)} />
      <input className='rounded border p-2' placeholder='Référence' value={form.data.reference_transaction} onChange={e=>form.setData('reference_transaction',e.target.value)} />
      <button className='rounded bg-[#0B63CE] py-2 text-white' onClick={()=>form.post(route('finances.paiements.store'),{onSuccess:()=>setOpen(false)})}>Enregistrer</button><button onClick={()=>setOpen(false)}>Fermer</button>
    </div></div></div>}
  </div></AppLayout>
}
