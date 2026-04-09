import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import {
    ArrowUpRight,
    Banknote,
    CalendarDays,
    CalendarX,
    CreditCard,
    FileText,
    GraduationCap,
    Receipt,
    School,
    Users,
    UserSquare2,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type DashboardUser = {
    name: string;
};

type AuthData = {
    user: DashboardUser | null;
    roles?: string[];
    permissions?: string[];
};

type PageData = {
    auth: AuthData;
};

type Scope = 'all' | 'finance' | 'scolarite';

export default function DashboardIndex() {
    const { auth } = usePage<PageData>().props;

    const roles = auth.roles ?? [];
    const permissions = auth.permissions ?? [];

    const hasElevatedRole = roles.some((role) => ['super_admin', 'directeur'].includes(role));
    const isCaissier = roles.includes('caissier');
    const isEnseignant = roles.includes('enseignant');

    const hasFinancePerm = permissions.some((permission) =>
        ['finance', 'paiement', 'frais', 'salaire', 'comptabilite'].some((keyword) => permission.includes(keyword)),
    );
    const hasScolaritePerm = permissions.some((permission) =>
        ['eleve', 'inscription', 'classe', 'note', 'absence', 'bulletin', 'scolarite'].some((keyword) =>
            permission.includes(keyword),
        ),
    );

    // Contrôle d'accès basé sur les rôles/permissions partagés via Inertia
    const visibleScope: Scope = hasElevatedRole
        ? 'all'
        : isCaissier || hasFinancePerm
          ? 'finance'
          : isEnseignant || hasScolaritePerm
            ? 'scolarite'
            : 'all';

    const canViewFinance = visibleScope === 'all' || visibleScope === 'finance';
    const canViewScolarite = visibleScope === 'all' || visibleScope === 'scolarite';

    // TODO: remplacer par props Inertia
    const metrics = {
        elevesInscrits: 247,
        recouvrement: 78,
        recettesMois: '1 250 000 FCFA',
        absencesJour: 8,
        classesActives: 14,
        enseignants: 22,
        impayesEnCours: '6 450 000 FCFA',
        bulletinsTrimestre: 241,
    };

    // TODO: remplacer par props Inertia
    const inscriptionData = [
        { mois: 'Nov', total: 118 },
        { mois: 'Déc', total: 136 },
        { mois: 'Jan', total: 154 },
        { mois: 'Fév', total: 181 },
        { mois: 'Mar', total: 220 },
        { mois: 'Avr', total: 247 },
    ];

    // TODO: remplacer par props Inertia
    const niveauData = [
        { niveau: 'CP1', eleves: 38, color: 'rgba(26,86,160,0.4)' },
        { niveau: 'CP2', eleves: 42, color: 'rgba(26,86,160,0.52)' },
        { niveau: 'CE1', eleves: 40, color: 'rgba(26,86,160,0.6)' },
        { niveau: 'CE2', eleves: 39, color: 'rgba(26,86,160,0.68)' },
        { niveau: 'CM1', eleves: 45, color: 'rgba(26,86,160,0.78)' },
        { niveau: 'CM2', eleves: 43, color: 'rgba(26,86,160,0.9)' },
    ];

    // TODO: remplacer par props Inertia
    const payments = [
        { eleve: 'Amani Koffi', classe: 'CM2-A', montant: '85 000 FCFA', mode: 'Wave', date: '08/04/2026' },
        { eleve: 'N’Dri Yao', classe: 'CE1-B', montant: '65 000 FCFA', mode: 'Orange Money', date: '08/04/2026' },
        { eleve: 'Konan Aya', classe: 'CP2-A', montant: '45 000 FCFA', mode: 'Espèces', date: '07/04/2026' },
        { eleve: 'Traoré Idriss', classe: 'CM1-A', montant: '90 000 FCFA', mode: 'Wave', date: '07/04/2026' },
        { eleve: 'Fofana Fatou', classe: 'CE2-A', montant: '70 000 FCFA', mode: 'Orange Money', date: '06/04/2026' },
    ];

    // TODO: remplacer par props Inertia
    const criticalUnpaid = [
        { eleve: 'Assi Marius', classe: 'CM2-B', montant: '120 000 FCFA' },
        { eleve: 'Coulibaly Inès', classe: 'CE2-B', montant: '95 000 FCFA' },
        { eleve: 'Kouamé Didier', classe: 'CM1-B', montant: '88 000 FCFA' },
        { eleve: 'Bamba Ruth', classe: 'CP1-A', montant: '71 000 FCFA' },
    ];

    // TODO: remplacer par props Inertia
    const absencePieData = [
        { name: 'Justifiées', value: 24, color: '#1a56a0' },
        { name: 'Non justifiées', value: 11, color: '#f97316' },
    ];

    // TODO: remplacer par props Inertia
    const events = [
        { titre: 'Conseil de classe T1', date: '12 avr. 2026', type: 'Pédagogie' },
        { titre: 'Remise des bulletins', date: '18 avr. 2026', type: 'Administration' },
        { titre: 'Sortie scolaire CP', date: '24 avr. 2026', type: 'Vie scolaire' },
        { titre: 'Réunion parents', date: '30 avr. 2026', type: 'Communication' },
    ];

    // TODO: remplacer par props Inertia
    const activities = [
        { icon: GraduationCap, texte: 'Nouvelle inscription: N’Guessan Léa (CE1-A)', time: 'il y a 25 min' },
        { icon: CreditCard, texte: 'Paiement validé pour Koffi Junior', time: 'il y a 1h' },
        { icon: FileText, texte: 'Notes de mathématiques saisies (CM2-A)', time: 'il y a 2h' },
        { icon: CalendarX, texte: 'Absence signalée pour Yao Mariam', time: 'il y a 3h' },
    ];

    const paymentModeClass: Record<string, string> = {
        Wave: 'bg-green-100 text-green-700',
        'Orange Money': 'bg-orange-100 text-orange-700',
        Espèces: 'bg-gray-100 text-gray-700',
    };

    return (
        <AppLayout title="Tableau de bord">
            <Head title="Tableau de bord" />

            <div className="space-y-6">
                {/* En-tête de page */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Tableau de bord</h1>
                        <p className="text-sm text-gray-500">
                            Vue d&apos;ensemble de votre activité — 2025-2026
                        </p>
                    </div>
                    <ButtonNouvelleInscription />
                </div>

                {/* Rangée 1 — Cartes métriques principales */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {canViewScolarite ? (
                        <MetricCard
                            icon={Users}
                            iconClass="bg-blue-50 text-blue-600"
                            label="Élèves inscrits"
                            value={String(metrics.elevesInscrits)}
                            footer={<span className="inline-flex items-center gap-1 text-sm text-emerald-600"><ArrowUpRight size={14} />+12 ce mois</span>}
                        />
                    ) : null}

                    {canViewFinance ? (
                        <MetricCard
                            icon={CreditCard}
                            iconClass="bg-green-50 text-green-600"
                            label="Taux de recouvrement"
                            value={`${metrics.recouvrement}%`}
                            footer={
                                <>
                                    <div className="h-2 overflow-hidden rounded-full bg-green-100">
                                        <div className="h-full rounded-full bg-green-500" style={{ width: `${metrics.recouvrement}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500">Frais collectés / Frais dus</span>
                                </>
                            }
                        />
                    ) : null}

                    {canViewFinance ? (
                        <MetricCard
                            icon={Banknote}
                            iconClass="bg-amber-50 text-amber-600"
                            label="Recettes du mois"
                            value={metrics.recettesMois}
                            footer={<span className="inline-flex items-center gap-1 text-sm text-emerald-600"><ArrowUpRight size={14} />+9.4% vs mois dernier</span>}
                        />
                    ) : null}

                    {canViewScolarite ? (
                        <MetricCard
                            icon={CalendarX}
                            iconClass="bg-red-50 text-red-600"
                            label="Absences du jour"
                            value={String(metrics.absencesJour)}
                            footer={<span className="text-sm text-gray-500">Sur 247 élèves présents</span>}
                        />
                    ) : null}
                </section>

                {/* Rangée 2 — Cartes secondaires */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {canViewScolarite ? <SecondaryCard title="Classes actives" value={String(metrics.classesActives)} icon={School} /> : null}
                    {canViewScolarite ? <SecondaryCard title="Enseignants" value={String(metrics.enseignants)} icon={UserSquare2} /> : null}
                    {canViewFinance ? <SecondaryCard title="Impayés en cours" value={metrics.impayesEnCours} icon={Receipt} /> : null}
                    {canViewScolarite ? <SecondaryCard title="Bulletins générés ce trimestre" value={String(metrics.bulletinsTrimestre)} icon={FileText} /> : null}
                </section>

                {/* Rangée 3 — Graphiques */}
                <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {canViewScolarite ? (
                        <ChartCard title="Évolution des inscriptions" actionLabel="6 derniers mois">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={inscriptionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="mois" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="total" stroke="#1a56a0" strokeWidth={3} dot={{ fill: '#1a56a0' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    ) : null}

                    {canViewScolarite ? (
                        <ChartCard title="Répartition par niveau" actionLabel="Année 2025-2026">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={niveauData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="niveau" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip />
                                        <Bar dataKey="eleves" radius={[8, 8, 0, 0]}>
                                            {niveauData.map((entry) => (
                                                <Cell key={entry.niveau} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    ) : null}
                </section>

                {/* Rangée 4 — Paiements & impayés */}
                {canViewFinance ? (
                    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-medium text-gray-800">Derniers paiements</h2>
                                <Link href="#" className="text-sm text-[#1a56a0] hover:underline">
                                    Voir tous les paiements
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="pb-3 font-medium">Élève</th>
                                            <th className="pb-3 font-medium">Classe</th>
                                            <th className="pb-3 font-medium">Montant</th>
                                            <th className="pb-3 font-medium">Mode</th>
                                            <th className="pb-3 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {payments.map((payment) => (
                                            <tr key={`${payment.eleve}-${payment.date}`}>
                                                <td className="py-3">{payment.eleve}</td>
                                                <td className="py-3">{payment.classe}</td>
                                                <td className="py-3 font-medium">{payment.montant}</td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${paymentModeClass[payment.mode]}`}>
                                                        {payment.mode}
                                                    </span>
                                                </td>
                                                <td className="py-3">{payment.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-medium text-gray-800">Impayés critiques</h2>
                                <Link href="#" className="text-sm text-[#1a56a0] hover:underline">
                                    Voir tous les impayés
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {criticalUnpaid.map((item) => (
                                    <div key={item.eleve} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{item.eleve}</p>
                                            <p className="text-xs text-gray-500">{item.classe}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-red-600">{item.montant}</p>
                                        <button
                                            type="button"
                                            className="rounded-lg border border-[#1a56a0]/20 px-3 py-1.5 text-xs font-medium text-[#1a56a0] transition hover:bg-[#1a56a0]/5"
                                        >
                                            Relancer
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* Rangée 5 — Absences, événements, activité */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {canViewScolarite ? (
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-base font-medium text-gray-800">Répartition des absences</h2>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={absencePieData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                                            {absencePieData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {absencePieData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            {item.name}
                                        </div>
                                        <span className="font-medium text-gray-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-base font-medium text-gray-800">Prochains événements</h2>
                        <div className="space-y-3">
                            {events.map((event) => (
                                <div key={event.titre} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                                    <CalendarDays size={18} className="mt-0.5 text-[#1a56a0]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-800">{event.titre}</p>
                                        <p className="text-xs text-gray-500">{event.date}</p>
                                    </div>
                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#1a56a0]">
                                        {event.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="mb-4 text-base font-medium text-gray-800">Activité récente</h2>
                        <div className="space-y-3">
                            {activities.map((activity) => {
                                const ActivityIcon = activity.icon;

                                return (
                                    <div key={activity.texte} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                                        <div className="rounded-md bg-gray-100 p-2 text-gray-600">
                                            <ActivityIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700">{activity.texte}</p>
                                            <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function MetricCard({
    icon: Icon,
    iconClass,
    label,
    value,
    footer,
}: {
    icon: typeof Users;
    iconClass: string;
    label: string;
    value: string;
    footer: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-2 ${iconClass}`}>
                    <Icon size={18} />
                </div>
            </div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
            <div className="mt-3 space-y-2">{footer}</div>
        </div>
    );
}

function SecondaryCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string;
    icon: typeof Users;
}) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-gray-500">{title}</p>
                <Icon size={16} className="text-[#1a56a0]" />
            </div>
            <p className="text-xl font-semibold text-gray-800">{value}</p>
        </div>
    );
}

function ChartCard({
    title,
    actionLabel,
    children,
}: {
    title: string;
    actionLabel: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-medium text-gray-800">{title}</h2>
                <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                    {actionLabel}
                </button>
            </div>
            {children}
        </div>
    );
}

function ButtonNouvelleInscription() {
    return (
        <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-[#1a56a0] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#164a89]"
        >
            + Nouvelle inscription
        </button>
    );
}
