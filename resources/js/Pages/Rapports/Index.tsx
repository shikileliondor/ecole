import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Option = { id: number; libelle?: string; nom?: string };

export default function RapportsIndex({ filters, filterOptions, kpis, data, exports }: any) {
    const onFilterChange = (key: string, value: string) => {
        router.get(route('finances.rapports.index'), { ...filters, [key]: value || null }, { preserveState: true, replace: true });
    };

    const cards = [
        ['Élèves inscrits', kpis.elevesInscrits],
        ['Classes actives', kpis.classesActives],
        ['Enseignants', kpis.enseignants],
        ['Bulletins générés', kpis.bulletinsGeneres],
        ['Absences du mois', kpis.absencesMois],
        ['Nouveaux inscrits', kpis.nouveauxInscrits],
    ];

    const sections = [
        { title: 'Rapports scolaires', items: ['Effectif par classe', 'Effectif par niveau', 'Filles / garçons', 'Nouveaux inscrits', 'Réinscriptions', 'Liste des élèves par classe'] },
        { title: 'Rapports pédagogiques', items: ['Moyennes par classe', 'Classement par classe', 'Taux de réussite', 'Élèves excellents', 'Élèves faibles', 'Bulletins générés', 'Matières avec faibles résultats'] },
        { title: "Rapports d'absences", items: ['Absences élèves', 'Absences justifiées', 'Absences non justifiées', 'Élèves les plus absents', 'Absences par classe', 'Absences par période'] },
        { title: 'Rapports ressources humaines', items: ['Liste du personnel', 'Personnel par poste', 'Enseignants actifs', 'Documents manquants', 'Absences du personnel'] },
    ];

    return (
        <AppLayout title="Rapports">
            <div className="space-y-5 bg-slate-50 p-1 text-slate-900">
                <div>
                    <h1 className="text-2xl font-semibold">Rapports</h1>
                    <p className="text-sm text-slate-500">Analysez les statistiques scolaires, pédagogiques, les absences et les ressources humaines de l'établissement.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    {[
                        ['annee_id', 'Année scolaire', filterOptions.annees],
                        ['periode_id', 'Période', filterOptions.periodes],
                        ['classe_id', 'Classe', filterOptions.classes],
                        ['niveau_id', 'Niveau', filterOptions.niveaux],
                    ].map(([key, label, options]: any) => (
                        <select key={key} value={filters[key] ?? ''} onChange={(e) => onFilterChange(key, e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="">{label}</option>
                            {(options as Option[]).map((o) => <option key={o.id} value={o.id}>{o.libelle ?? o.nom}</option>)}
                        </select>
                    ))}
                    <select value={filters.type_rapport ?? ''} onChange={(e) => onFilterChange('type_rapport', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        <option value="">Type de rapport</option>
                        {filterOptions.typesRapport.map((t: string) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                    {cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-semibold text-[#0B63CE]">{value ?? 0}</p></div>)}
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {sections.map((section) => (
                        <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <h2 className="mb-3 text-sm font-semibold text-slate-900">{section.title}</h2>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div key={item} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                        <span className="text-slate-700">{item}</span>
                                        <div className="flex gap-2"><button className="rounded-lg bg-[#0B63CE] px-3 py-1 text-xs text-white">Voir</button><button disabled className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-400">Exporter</button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <ChartCard title="Répartition des élèves par niveau"><SimpleBar data={data.effectifParNiveau} dataKey="total" nameKey="libelle" color="#0B63CE" /></ChartCard>
                    <ChartCard title="Évolution des inscriptions"><SimpleLine data={data.effectifParClasse} xKey="nom" yKey="total" color="#16A34A" /></ChartCard>
                    <ChartCard title="Répartition filles / garçons"><SimplePie data={data.repartitionSexe} nameKey="sexe" valueKey="total" /></ChartCard>
                    <ChartCard title="Absences par mois"><SimpleBar data={data.absencesParMois} dataKey="total" nameKey="mois" color="#F97316" /></ChartCard>
                    <ChartCard title="Bulletins générés par trimestre"><SimpleBar data={data.bulletinsParTrimestre} dataKey="total" nameKey="libelle" color="#7C3AED" /></ChartCard>
                </div>

                <div className="flex gap-2">
                    {exports.pdf ? (
                        <a
                            href={route('finances.rapports.export.pdf', Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null)))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[#1a56a0] bg-[#1a56a0] px-4 py-2 text-sm text-white hover:bg-[#1548a0]"
                        >
                            Export PDF
                        </a>
                    ) : (
                        <button disabled className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 opacity-60">Export PDF</button>
                    )}
                    <button disabled={!exports.excel} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 disabled:opacity-60">Export Excel</button>
                    <button disabled={!exports.print} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 disabled:opacity-60">Impression</button>
                </div>
            </div>
        </AppLayout>
    );
}

function ChartCard({ title, children }: any) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-2 text-sm font-semibold">{title}</h3><div className="h-64">{children}</div></div>; }
function EmptyState() { return <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée disponible.</div>; }
function SimpleBar({ data, dataKey, nameKey, color }: any) { if (!data?.length) return <EmptyState />; return <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={nameKey} /><YAxis /><Tooltip /><Bar dataKey={dataKey} fill={color} radius={[6,6,0,0]} /></BarChart></ResponsiveContainer>; }
function SimpleLine({ data, xKey, yKey, color }: any) { if (!data?.length) return <EmptyState />; return <ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xKey} /><YAxis /><Tooltip /><Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} /></LineChart></ResponsiveContainer>; }
function SimplePie({ data, nameKey, valueKey }: any) { if (!data?.length) return <EmptyState />; const colors = ['#0B63CE', '#EF4444', '#16A34A']; return <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={90} label>{data.map((_:any, i:number) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie></PieChart></ResponsiveContainer>; }
