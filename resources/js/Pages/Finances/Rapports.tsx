import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';
import type { FinanceProps } from './types';
const formatCurrency=(a:number)=>`${new Intl.NumberFormat('fr-FR').format(Math.round(a||0))} FCFA`;
export default function FinancesRapports(){ const {props}=usePage<{props:FinanceProps}>() as any; const data=props as FinanceProps; const depenses=data.depenses??[]; const salaires=data.salaires??[];
const totalDep=depenses.filter((d:any)=>d.statut!=='annulee').reduce((s:number,d:any)=>s+d.montant,0); const totalSal=salaires.filter((s:any)=>s.statut==='paye').reduce((t:number,s:any)=>t+s.net_a_payer,0); const totalEnc=data.metrics?.totalEncaisse||0;
return <AppLayout title='Rapports financiers'><div className='space-y-4 bg-[#F8FAFC] p-4'><div><h1 className='text-2xl font-bold'>Rapports financiers</h1><p className='text-sm text-slate-500'>Analysez les entrées, sorties, impayés et salaires de l'établissement.</p></div>
<div className='grid gap-3 md:grid-cols-5'>{[['Total encaissé',totalEnc],['Total impayés',data.metrics?.resteAPayer||0],['Total dépenses',totalDep],['Total salaires payés',totalSal],['Solde estimé',totalEnc-totalDep-totalSal]].map(([l,v])=><div key={String(l)} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-xs text-slate-500'>{l}</p><p className='font-semibold'>{formatCurrency(Number(v)||0)}</p></div>)}</div>
<div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><div className='flex gap-2'><button disabled className='rounded-xl border px-3 py-2 text-slate-400'>Export PDF</button><button disabled className='rounded-xl border px-3 py-2 text-slate-400'>Export Excel</button><button onClick={()=>window.print()} className='rounded-xl border px-3 py-2'>Imprimer</button></div></div>
</div></AppLayout>; }
