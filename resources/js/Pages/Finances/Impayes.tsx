import AppLayout from '@/Layouts/AppLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FinanceProps, ImpayeRow } from './types';

type Filters = {
  q: string;
  classe: string;
  annee: string;
  type: string;
  status: string;
  retard: string;
  page: number;
};

const PAGE_SIZE = 10;

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;
const formatDate = (date: string) => {
  if (!date || date === 'Non renseigné' || date === '—') return 'Non renseigné';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Non renseigné' : parsed.toLocaleDateString('fr-FR');
};

const paymentFormDefaults = {
  inscription_id: '',
  type_frais_id: '',
  montant_attendu: '0',
  montant_paye: '',
  mode_paiement: '',
  date_paiement: new Date().toISOString().slice(0, 10),
  reference_transaction: '',
  note_caissier: '',
};

const statusMeta = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'paye') return { label: 'payé', classes: 'bg-emerald-100 text-emerald-700' };
  if (s === 'partiel') return { label: 'partiel', classes: 'bg-orange-100 text-orange-700' };
  if (s === 'impaye' || s === 'en retard') return { label: 'en retard', classes: 'bg-amber-100 text-amber-700' };
  if (s === 'critique') return { label: 'critique', classes: 'bg-red-100 text-red-700' };
  if (s === 'annule') return { label: 'en attente', classes: 'bg-slate-100 text-slate-700' };
  return { label: s || 'en attente', classes: 'bg-slate-100 text-slate-700' };
};

export default function FinancesImpayes() {
  const { props } = usePage<{ props: FinanceProps }>() as any;
  const data = props as FinanceProps;
  const [filters, setFilters] = useState<Filters>({ q: '', classe: '', annee: '', type: '', status: '', retard: '', page: 1 });
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [historyTarget, setHistoryTarget] = useState<ImpayeRow | null>(null);
  const [relanceTarget, setRelanceTarget] = useState<ImpayeRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const form = useForm({ ...paymentFormDefaults, mode_paiement: data.modesPaiement[0] || 'especes' });

  const selectedFee = data.typesFrais.find((f) => String(f.id) === form.data.type_frais_id);
  const selectedPayments = useMemo(
    () => data.payments.filter((p) => String(p.inscription_id) === form.data.inscription_id && String(p.type_frais_id) === form.data.type_frais_id && p.statut !== 'annule'),
    [data.payments, form.data.inscription_id, form.data.type_frais_id],
  );
  const dejaPaye = selectedPayments.reduce((sum, p) => sum + p.montant, 0);
  const montantDu = Number(form.data.montant_attendu || selectedFee?.montant || 0);
  const resteActuel = Math.max(0, montantDu - dejaPaye);

  const filtered = useMemo(() => {
    return data.impayes.filter((r) => {
      if (filters.q && !r.eleve.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.classe && r.classe !== filters.classe) return false;
      if (filters.annee && (r.annee_scolaire || '') !== filters.annee) return false;
      if (filters.type && r.type_frais !== filters.type) return false;

      const resolved = statusMeta(r.statut).label;
      if (filters.status && resolved !== filters.status) return false;

      if (filters.retard === 'faible' && r.reste > 50000) return false;
      if (filters.retard === 'moyen' && (r.reste <= 50000 || r.reste > 150000)) return false;
      if (filters.retard === 'eleve' && r.reste <= 150000) return false;
      return true;
    });
  }, [data.impayes, filters]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const totalImpayes = filtered.reduce((sum, r) => sum + r.reste, 0);
  const elevesConcernes = new Set(filtered.map((r) => r.eleve)).size;
  const classePlusRetard = Object.entries(filtered.reduce<Record<string, number>>((acc, r) => {
    acc[r.classe] = (acc[r.classe] || 0) + r.reste;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0];

  const openPaymentDrawer = (row: ImpayeRow) => {
    form.setData({
      ...paymentFormDefaults,
      mode_paiement: data.modesPaiement[0] || 'especes',
      inscription_id: String(row.inscription_id),
      type_frais_id: String(row.type_frais_id || ''),
      montant_attendu: String(row.montant_du),
    });
    form.clearErrors();
    setDrawerOpen(true);
    setOpenMenu(null);
  };

  const paginationButtons = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);

  return (
    <AppLayout title="Impayés">
      <div className="space-y-4 bg-[#F8FAFC] p-3 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Impayés</h1>
            <p className="text-sm text-[#64748B]">Suivez les restes à payer des élèves par classe, frais et année scolaire.</p>
          </div>
          <div className="flex gap-2">
            <button disabled className="h-10 rounded-xl border border-slate-300 px-4 text-sm text-slate-400">Exporter</button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total des impayés', formatCurrency(totalImpayes)],
            ['Nombre d’élèves concernés', String(elevesConcernes)],
            ['Classe la plus en retard', classePlusRetard ? `${classePlusRetard[0]} (${formatCurrency(classePlusRetard[1])})` : '—'],
            ['Reste moyen par élève', formatCurrency(elevesConcernes ? totalImpayes / elevesConcernes : 0)],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-[#64748B]">{label}</p>
              <p className="mt-1 text-lg font-semibold text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-7">
          <input className="h-10 rounded-xl border border-slate-200 px-3 text-sm" placeholder="Recherche élève" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={filters.classe} onChange={(e) => setFilters({ ...filters, classe: e.target.value, page: 1 })}><option value="">Classe</option>{data.classes.map((c) => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={filters.annee} onChange={(e) => setFilters({ ...filters, annee: e.target.value, page: 1 })}><option value="">Année scolaire</option>{data.anneesScolaires.map((a) => <option key={a.id} value={a.libelle}>{a.libelle}</option>)}</select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}><option value="">Type de frais</option>{data.typesFrais.map((t) => <option key={t.id} value={t.libelle}>{t.libelle}</option>)}</select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}><option value="">Statut</option><option value="payé">payé</option><option value="partiel">partiel</option><option value="en retard">en retard</option><option value="critique">critique</option><option value="en attente">en attente</option></select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={filters.retard} onChange={(e) => setFilters({ ...filters, retard: e.target.value, page: 1 })}><option value="">Niveau de retard</option><option value="faible">Faible</option><option value="moyen">Moyen</option><option value="eleve">Élevé</option></select>
          <button className="h-10 rounded-xl border border-slate-300 px-3 text-sm" onClick={() => setFilters({ q: '', classe: '', annee: '', type: '', status: '', retard: '', page: 1 })}>Réinitialiser</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Élève</th><th>Classe</th><th>Type de frais</th><th>Montant dû</th><th>Montant payé</th><th>Reste à payer</th><th>Dernier paiement</th><th>Statut</th><th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const meta = statusMeta(r.statut);
                return <tr key={`${r.inscription_id}-${idx}`} className="border-t border-slate-100 text-sm hover:bg-slate-50">
                  <td className="px-4 py-3 text-[#0F172A]">{r.eleve}</td><td>{r.classe}</td><td>{r.type_frais}</td><td>{formatCurrency(r.montant_du)}</td><td>{formatCurrency(r.montant_paye)}</td><td className="font-semibold text-red-600">{formatCurrency(r.reste)}</td><td>{formatDate(r.dernier_paiement)}</td>
                  <td><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.classes}`}>{meta.label}</span></td>
                  <td className="px-4">
                    <div className="relative">
                      <button className="rounded-lg border border-slate-200 px-2 py-1" onClick={() => setOpenMenu(openMenu === idx ? null : idx)}>...</button>
                      {openMenu === idx && <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                        <button onClick={() => openPaymentDrawer(r)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">Enregistrer paiement</button>
                        <button onClick={() => { setHistoryTarget(r); setOpenMenu(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">Voir historique</button>
                        <button onClick={() => { setRelanceTarget(r); setOpenMenu(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">Relancer</button>
                      </div>}
                    </div>
                  </td>
                </tr>;
              })}
              {rows.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">Aucun impayé trouvé.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>Affichage de {total ? start + 1 : 0} à {Math.min(start + PAGE_SIZE, total)} sur {total} impayés</p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5" disabled={page === 1} onClick={() => setFilters({ ...filters, page: page - 1 })}>Précédent</button>
            {paginationButtons.map((p, i) => <>
              {i > 0 && paginationButtons[i - 1] !== p - 1 && <span className="px-1" key={`dots-${p}`}>…</span>}
              <button key={p} className={`rounded-lg border px-3 py-1.5 ${p === page ? 'border-[#0B63CE] bg-[#0B63CE] text-white' : 'border-slate-300'}`} onClick={() => setFilters({ ...filters, page: p })}>{p}</button>
            </>)}
            <button className="rounded-lg border border-slate-300 px-3 py-1.5" disabled={page === pages} onClick={() => setFilters({ ...filters, page: page + 1 })}>Suivant</button>
          </div>
        </div>
      </div>

      {drawerOpen && <div className="fixed inset-0 z-50 bg-black/30"><div className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-4"><h3 className="text-lg font-semibold">Nouveau paiement</h3><div className="mt-3 grid gap-2"><div className="rounded-xl bg-slate-50 p-2 text-sm">Montant dû: {formatCurrency(montantDu)} · Montant déjà payé: {formatCurrency(dejaPaye)} · Reste à payer: {formatCurrency(resteActuel)}</div><input className="rounded-xl border p-2" placeholder="Montant payé" value={form.data.montant_paye} onChange={(e) => form.setData('montant_paye', e.target.value)} /><select className="rounded-xl border p-2" value={form.data.mode_paiement} onChange={(e) => form.setData('mode_paiement', e.target.value)}>{data.modesPaiement.map((m) => <option key={m} value={m}>{m}</option>)}</select><input type="date" className="rounded-xl border p-2" value={form.data.date_paiement} onChange={(e) => form.setData('date_paiement', e.target.value)} /><input className="rounded-xl border p-2" placeholder="Référence" value={form.data.reference_transaction} onChange={(e) => form.setData('reference_transaction', e.target.value)} />
            {Object.keys(form.errors).length > 0 && <div className="text-sm text-red-600">{Object.values(form.errors)[0]}</div>}
            <div className="flex gap-2"><button className="rounded-xl bg-blue-600 px-4 py-2 text-white" disabled={form.processing || !form.data.inscription_id || !form.data.type_frais_id || (Number(form.data.montant_paye) > resteActuel && resteActuel > 0)} onClick={() => form.post(route('finances.paiements.store'), { preserveScroll: true, onSuccess: () => { setDrawerOpen(false); form.reset(); router.reload({ only: ['payments', 'metrics', 'impayes'] }); } })}>Enregistrer</button><button className="rounded-xl border px-4 py-2" onClick={() => setDrawerOpen(false)}>Fermer</button></div></div></div></div>}

      {historyTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div className="w-full max-w-4xl rounded-2xl bg-white p-4"><h3 className="text-lg font-semibold">Historique des paiements - {historyTarget.eleve}</h3><div className="mt-3 max-h-[60vh] overflow-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><th className="p-2">Date</th><th>Frais</th><th>Montant</th><th>Mode</th><th>Référence</th><th>Statut</th></tr></thead><tbody>{data.payments.filter((p) => p.inscription_id === historyTarget.inscription_id).map((p) => <tr key={p.id} className="border-t"><td className="p-2">{formatDate(p.date)}</td><td>{p.type_frais}</td><td>{formatCurrency(p.montant)}</td><td>{p.mode}</td><td>{p.reference || 'Non renseigné'}</td><td>{statusMeta(p.statut).label}</td></tr>)}{data.payments.filter((p) => p.inscription_id === historyTarget.inscription_id).length === 0 && <tr><td className="p-4 text-center text-slate-500" colSpan={6}>Aucun historique.</td></tr>}</tbody></table></div><div className="mt-3"><button className="rounded-xl border px-4 py-2" onClick={() => setHistoryTarget(null)}>Fermer</button></div></div></div>}

      {relanceTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-5"><h3 className="text-lg font-semibold">Relance paiement</h3><p className="mt-2 text-sm text-slate-600">Le module de communication n'est pas disponible ici. Action préparée pour {relanceTarget.eleve}, classe {relanceTarget.classe}, reste {formatCurrency(relanceTarget.reste)}.</p><div className="mt-4"><button className="rounded-xl border px-4 py-2" onClick={() => setRelanceTarget(null)}>Fermer</button></div></div></div>}
    </AppLayout>
  );
}
