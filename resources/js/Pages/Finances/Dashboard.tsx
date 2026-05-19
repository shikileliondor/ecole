import AppLayout from '@/Layouts/AppLayout';
import { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Bell,
    CreditCard,
    Download,
    Receipt,
    Users,
    Wallet,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { FinanceProps, ImpayeRow } from './types';

const PERIODS = [
    { value: 'today', label: "Aujourd’hui" },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
] as const;

const CHART_COLORS = ['#0B63CE', '#16A34A', '#F97316', '#EF4444', '#7C3AED', '#0EA5E9'];

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0))} FCFA`;

const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '—';
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('fr-FR');
};

const parseFrDate = (date: string) => {
    const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

const getStatusBadge = (status: string) => {
    if (status === 'paye') return 'bg-emerald-50 text-emerald-700';
    if (status === 'annule') return 'bg-red-50 text-red-700';
    if (status === 'partiel') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-700';
};

export default function FinancesDashboard() {
    const { props } = usePage<{ props: FinanceProps }>() as any;
    const data = props as FinanceProps;

    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<(typeof PERIODS)[number]['value']>('month');

    const paymentsWithDate = useMemo(
        () => data.payments.map((p) => ({ ...p, parsedDate: parseFrDate(p.date) })).filter((p) => p.parsedDate),
        [data.payments],
    );

    const filteredPayments = useMemo(() => {
        const now = new Date();
        return paymentsWithDate.filter((p) => {
            const d = p.parsedDate as Date;
            if (selectedYear !== 'all' && d.getFullYear() !== Number(selectedYear)) return false;
            if (selectedPeriod === 'today') return d.toDateString() === now.toDateString();
            if (selectedPeriod === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            if (selectedPeriod === 'quarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === quarter;
            }
            if (selectedPeriod === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    }, [paymentsWithDate, selectedPeriod, selectedYear]);

    const encaissementsParMois = useMemo(() => {
        const map = new Map<string, number>();
        paymentsWithDate.forEach((p) => {
            if (p.statut === 'annule' || p.statut === 'impaye') return;
            const d = p.parsedDate as Date;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            map.set(key, (map.get(key) || 0) + p.montant);
        });

        return [...map.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([key, total]) => {
                const [y, m] = key.split('-').map(Number);
                return {
                    key,
                    mois: new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' }),
                    montant: total,
                };
            });
    }, [paymentsWithDate]);

    const recouvrementParClasse = useMemo(() => {
        const map = new Map<string, { attendu: number; encaisse: number }>();
        data.impayes.forEach((i) => {
            const row = map.get(i.classe) || { attendu: 0, encaisse: 0 };
            row.attendu += i.montant_du;
            row.encaisse += i.montant_paye;
            map.set(i.classe, row);
        });

        return [...map.entries()].map(([classe, values]) => ({
            classe,
            attendu: values.attendu,
            encaisse: values.encaisse,
            reste: Math.max(0, values.attendu - values.encaisse),
        }));
    }, [data.impayes]);

    const repartitionModePaiement = useMemo(() => {
        const map = new Map<string, number>();
        data.payments.forEach((p) => {
            if (p.statut === 'annule' || p.statut === 'impaye') return;
            const mode = p.mode?.trim() || 'Non défini';
            map.set(mode, (map.get(mode) || 0) + p.montant);
        });
        return [...map.entries()].map(([mode, montant]) => ({ mode, montant }));
    }, [data.payments]);

    const impayesCritiques = useMemo(() => [...data.impayes].sort((a, b) => b.reste - a.reste).slice(0, 8), [data.impayes]);

    const paiementsValides = filteredPayments.filter((p) => p.statut !== 'annule' && p.statut !== 'impaye');
    const paiementsAnnulesRecents = data.payments.filter((p) => p.statut === 'annule').slice(0, 3);
    const totalAttendu = data.metrics.totalAttendu || 0;
    const totalEncaisse = data.metrics.totalEncaisse || 0;
    const tauxRecouvrement = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 10000) / 100 : 0;
    const hasAnyPaymentData = data.payments.length > 0;

    const alerts = [
        ...impayesCritiques.slice(0, 3).map((i) => `Retard élevé: ${i.eleve} (${i.classe}) - ${formatCurrency(i.reste)}`),
        ...paiementsAnnulesRecents.map((p) => `Paiement annulé: ${p.eleve} (${formatDate(p.date)})`),
        ...recouvrementParClasse
            .filter((c) => c.attendu > 0 && c.encaisse / c.attendu < 0.5)
            .slice(0, 2)
            .map((c) => `Faible recouvrement: ${c.classe} (${Math.round((c.encaisse / c.attendu) * 100)}%)`),
    ].slice(0, 6);

    return (
        <AppLayout title="Tableau de bord finance">
            <div className="min-h-full space-y-4 bg-[#F8FAFC] p-3 md:p-5">
                <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F172A]">Tableau de bord finance</h1>
                        <p className="text-sm text-[#64748B]">Vue d’ensemble des finances de l’établissement.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            <option value="all">Toutes les années</option>
                            {[...new Set(paymentsWithDate.map((p) => (p.parsedDate as Date).getFullYear()))].sort((a, b) => b - a).map((year) => <option key={year} value={String(year)}>{year}</option>)}
                        </select>
                        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)}>
                            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F172A]">
                            <Download className="h-4 w-4" /> Exporter
                        </button>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {[['Total attendu', formatCurrency(totalAttendu), Wallet, '#0B63CE'], ['Total encaissé', formatCurrency(totalEncaisse), CreditCard, '#16A34A'], ['Reste à payer', formatCurrency(data.metrics.resteAPayer), AlertCircle, '#F97316'], ['Taux de recouvrement', `${tauxRecouvrement}%`, Banknote, '#0B63CE'], ['Impayés en cours', String(data.metrics.impayesEnCours), Users, '#EF4444'], ['Paiements du mois', formatCurrency(data.metrics.paiementsDuMois), Receipt, '#7C3AED']].map(([label, value, Icon, color]) => (
                        <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-slate-500">{label}</p>
                                <span className="rounded-full p-2" style={{ backgroundColor: `${String(color)}1A` }}><Icon className="h-4 w-4" style={{ color: String(color) }} /></span>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[#0F172A]">{value}</p>
                            {label === 'Taux de recouvrement' && <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${Math.min(100, tauxRecouvrement)}%` }} /></div>}
                        </article>
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 font-semibold text-[#0F172A]">Évolution des encaissements</h3>
                        {encaissementsParMois.length ? <div className="h-72"><ResponsiveContainer minWidth={0} minHeight={1}><AreaChart data={encaissementsParMois}><CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" /><XAxis dataKey="mois" /><YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} /><Tooltip formatter={(value: number) => formatCurrency(Number(value))} /><Area dataKey="montant" stroke="#0B63CE" fill="#0B63CE22" /></AreaChart></ResponsiveContainer></div> : <p className="py-16 text-center text-sm text-slate-500">Aucune donnée d’encaissement disponible.</p>}
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 font-semibold text-[#0F172A]">Recouvrement par classe</h3>
                        {recouvrementParClasse.length ? <div className="h-72"><ResponsiveContainer minWidth={0} minHeight={1}><BarChart data={recouvrementParClasse}><CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" /><XAxis dataKey="classe" /><YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} /><Tooltip formatter={(value: number) => formatCurrency(Number(value))} /><Legend /><Bar dataKey="encaisse" fill="#16A34A" name="Encaissé" /><Bar dataKey="reste" fill="#F97316" name="Reste" /></BarChart></ResponsiveContainer></div> : <p className="py-16 text-center text-sm text-slate-500">Aucune donnée de recouvrement par classe.</p>}
                    </article>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
                        <h3 className="mb-3 font-semibold text-[#0F172A]">Derniers paiements</h3>
                        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Date</th><th>Élève</th><th>Classe</th><th>Type de frais</th><th>Montant</th><th>Mode</th><th>Statut</th><th>Action</th></tr></thead><tbody>{data.payments.slice(0, 8).map((p) => <tr key={p.id} className="border-b border-slate-100"><td className="py-2">{formatDate(p.date)}</td><td>{p.eleve}</td><td>{p.classe}</td><td>{p.type_frais}</td><td>{formatCurrency(p.montant)}</td><td>{p.mode || '—'}</td><td><span className={`rounded-full px-2 py-1 text-xs ${getStatusBadge(p.statut)}`}>{p.statut}</span></td><td><button className="text-[#0B63CE]">Voir reçu</button></td></tr>)}</tbody></table>{!data.payments.length && <p className="py-8 text-center text-slate-500">Aucun paiement disponible.</p>}</div>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 font-semibold text-[#0F172A]">Répartition par mode de paiement</h3>
                        {repartitionModePaiement.length ? <div className="h-72"><ResponsiveContainer minWidth={0} minHeight={1}><PieChart><Pie data={repartitionModePaiement} dataKey="montant" nameKey="mode" innerRadius={55} outerRadius={85} paddingAngle={2}>{repartitionModePaiement.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer></div> : <p className="py-16 text-center text-sm text-slate-500">Aucune donnée de mode de paiement.</p>}
                    </article>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
                        <h3 className="mb-3 font-semibold text-[#0F172A]">Impayés critiques</h3>
                        {impayesCritiques.length ? <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Élève</th><th>Classe</th><th>Reste à payer</th><th>Dernier paiement</th><th>Niveau retard</th><th>Action</th></tr></thead><tbody>{impayesCritiques.map((i: ImpayeRow) => <tr key={i.inscription_id} className="border-b border-slate-100"><td className="py-2">{i.eleve}</td><td>{i.classe}</td><td className="font-medium text-red-600">{formatCurrency(i.reste)}</td><td>{formatDate(i.dernier_paiement)}</td><td><span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">Élevé</span></td><td><div className="flex gap-2"><button className="text-[#F97316]">Relancer</button><button className="text-[#0B63CE]">Enregistrer paiement</button></div></td></tr>)}</tbody></table></div> : <p className="py-10 text-center text-sm text-slate-500">Aucun impayé critique.</p>}
                    </article>
                    <article className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-2 font-semibold text-[#0F172A]">Résumé caisse</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span className="text-slate-500">Solde estimé</span><span className="font-medium">{formatCurrency(totalEncaisse)}</span></li>
                                <li className="flex justify-between"><span className="text-slate-500">Encaissements du jour</span><span className="font-medium">{formatCurrency(paiementsValides.filter((p) => (p.parsedDate as Date).toDateString() === new Date().toDateString()).reduce((s, p) => s + p.montant, 0))}</span></li>
                                <li className="flex justify-between"><span className="text-slate-500">Encaissements du mois</span><span className="font-medium">{formatCurrency(data.metrics.paiementsDuMois)}</span></li>
                                <li className="flex justify-between"><span className="text-slate-500">Paiements annulés</span><span className="font-medium">{data.payments.filter((p) => p.statut === 'annule').length}</span></li>
                                <li className="flex justify-between"><span className="text-slate-500">Dernière opération</span><span className="font-medium">{formatDate(data.payments[0]?.date)}</span></li>
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-2 flex items-center gap-2 font-semibold text-[#0F172A]"><Bell className="h-4 w-4 text-[#EF4444]" /> Alertes</h3>
                            {alerts.length ? <ul className="space-y-2 text-sm text-slate-700">{alerts.map((a, idx) => <li key={idx} className="rounded-xl bg-slate-50 p-2">{a}</li>)}</ul> : <p className="text-sm text-slate-500">Aucune alerte financière pour le moment.</p>}
                        </div>
                    </article>
                </section>

                {!hasAnyPaymentData && <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Aucune donnée de paiement disponible pour le moment.</section>}
            </div>
        </AppLayout>
    );
}
