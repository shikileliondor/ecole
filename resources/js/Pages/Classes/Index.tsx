import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Users, Percent, Trophy, CalendarDays } from 'lucide-react';
import Pagination from '@/Components/Shared/Pagination';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import type { PaginationLink, PaginationMeta } from '@/types/eleve';

type ClasseCard = {
    id: number;
    nom: string;
    statut: string;
    capacite_max?: number | null;
    effectif: number;
    niveau?: { libelle: string } | null;
    annee_scolaire?: { libelle: string } | null;
    anneeScolaire?: { libelle: string } | null;
};

type EmploiCreneau = {
    heure: string;
    matiere?: string | null;
    enseignant?: string | null;
    salle?: string | null;
};

type EmploiJour = {
    jour: string;
    creneaux: EmploiCreneau[];
};

type DetailData = {
    classe: {
        id: number;
        nom: string;
        statut: string;
        niveau?: string | null;
        annee?: string | null;
        salle?: string | null;
        capacite?: number | null;
        titulaire?: string | null;
    };
    stats: {
        effectif: number;
        fillRate: number;
        moyenneClasse?: number | null;
        garcons: number;
        filles: number;
    };
    classement: Array<{
        rang: number;
        eleve: string;
        sexe?: string | null;
        moyenne?: number | null;
    }>;
    eleves: Array<{
        id?: number | null;
        nomComplet: string;
        sexe?: string | null;
        moyenne?: number | null;
    }>;
    emploiDuTemps: EmploiJour[];
};

type Props = {
    classes: {
        data: ClasseCard[];
        links: PaginationLink[];
        meta?: PaginationMeta;
        from?: number | null;
        to?: number | null;
        total?: number;
    };
    selectedClasseId?: number | null;
    detail?: DetailData | null;
    filters: {
        search?: string | null;
        statut?: string | null;
    };
};

export default function ClassesIndex({ classes, selectedClasseId, detail, filters }: Props) {
    const [localFilters, setLocalFilters] = useState({
        search: filters.search ?? '',
        statut: filters.statut ?? 'all',
    });
    const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
    const [isScheduleCollapsed, setIsScheduleCollapsed] = useState(true);

    useEffect(() => {
        setIsScheduleCollapsed(true);
    }, [selectedClasseId]);

    const submitFilters = (nextFilters: { search: string; statut: string }) => {
        router.get(route('classes.index'), {
            search: nextFilters.search || undefined,
            statut: nextFilters.statut === 'all' ? undefined : nextFilters.statut,
        }, { preserveState: true, replace: true });
    };

    const onSearchChange = (value: string) => {
        const next = { ...localFilters, search: value };
        setLocalFilters(next);
        if (searchTimeout) {
            window.clearTimeout(searchTimeout);
        }
        const timeout = window.setTimeout(() => submitFilters(next), 300);
        setSearchTimeout(timeout);
    };

    const hasActiveFilters = localFilters.search.trim() !== '' || localFilters.statut !== 'all';

    return (
        <AppLayout title="Classes">
            <Head title="Classes" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Classes</h1>
                    <p className="text-sm text-gray-500">Consultez les informations globales de chaque classe (élèves, classement, taux et emploi du temps).</p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <section className="xl:col-span-1 xl:sticky xl:top-6 xl:h-[calc(100vh-7rem)]">
                        <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="space-y-2">
                                <Input
                                    value={localFilters.search}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    placeholder="Rechercher une classe, niveau, année..."
                                />
                                <Select value={localFilters.statut} onValueChange={(value) => {
                                    const next = { ...localFilters, statut: value };
                                    setLocalFilters(next);
                                    submitFilters(next);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="inactive">Inactif</SelectItem>
                                    </SelectContent>
                                </Select>
                                {hasActiveFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            const reset = { search: '', statut: 'all' };
                                            setLocalFilters(reset);
                                            submitFilters(reset);
                                        }}
                                    >
                                        Réinitialiser les filtres
                                    </Button>
                                ) : null}
                            </div>

                            <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
                                {classes.data.map((classe) => {
                                    const isActive = classe.id === selectedClasseId;
                                    const capacity = classe.capacite_max ?? 0;
                                    const fillRate = capacity > 0 ? Math.round((classe.effectif / capacity) * 100) : 0;

                                    return (
                                        <button
                                            key={classe.id}
                                            type="button"
                                            onClick={() => router.get(route('classes.index'), {
                                                classe: classe.id,
                                                page: classes.meta?.current_page,
                                                search: localFilters.search || undefined,
                                                statut: localFilters.statut === 'all' ? undefined : localFilters.statut,
                                            }, { preserveScroll: true, preserveState: true })}
                                            className={`w-full rounded-xl border p-4 text-left transition ${
                                                isActive
                                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h2 className="font-semibold text-gray-900">{classe.nom}</h2>
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classe.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {classe.statut}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">{classe.niveau?.libelle} • {classe.anneeScolaire?.libelle ?? classe.annee_scolaire?.libelle ?? 'Année non définie'}</p>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                <div className="rounded-md bg-gray-50 p-2">Effectif: <span className="font-semibold text-gray-900">{classe.effectif}</span></div>
                                                <div className="rounded-md bg-gray-50 p-2">Taux: <span className="font-semibold text-gray-900">{fillRate}%</span></div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 border-t border-gray-100 pt-3">
                                <Pagination
                                    links={classes.links}
                                    meta={classes.meta ?? {
                                        from: classes.from ?? 0,
                                        to: classes.to ?? 0,
                                        total: classes.total ?? 0,
                                        current_page: 1,
                                        last_page: 1,
                                        per_page: 12,
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6 xl:col-span-2">
                        {!detail ? (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                                Aucune classe disponible.
                            </div>
                        ) : (
                            <>
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">{detail.classe.nom}</h2>
                                            <p className="text-sm text-gray-600">{detail.classe.niveau} • {detail.classe.annee}</p>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <p>Salle: <span className="font-medium text-gray-900">{detail.classe.salle ?? 'Non définie'}</span></p>
                                            <p>Titulaire: <span className="font-medium text-gray-900">{detail.classe.titulaire ?? 'Non assigné'}</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                                        <StatCard icon={<Users size={16} />} label="Effectif" value={String(detail.stats.effectif)} />
                                        <StatCard icon={<Percent size={16} />} label="Taux remplissage" value={`${Math.round(detail.stats.fillRate)}%`} />
                                        <StatCard icon={<Trophy size={16} />} label="Moyenne classe" value={detail.stats.moyenneClasse ? `${detail.stats.moyenneClasse}/20` : '--'} />
                                        <StatCard icon={<Users size={16} />} label="Filles / Garçons" value={`${detail.stats.filles} / ${detail.stats.garcons}`} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                        <h3 className="mb-3 font-semibold text-gray-900">Classement</h3>
                                        <div className="max-h-80 overflow-auto">
                                            <table className="w-full text-sm">
                                                <thead className="text-left text-gray-500">
                                                    <tr>
                                                        <th className="pb-2">#</th>
                                                        <th className="pb-2">Élève</th>
                                                        <th className="pb-2">Moyenne</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {detail.classement.map((row) => (
                                                        <tr key={`${row.rang}-${row.eleve}`}>
                                                            <td className="py-2 font-medium text-gray-700">{row.rang}</td>
                                                            <td className="py-2 text-gray-800">{row.eleve}</td>
                                                            <td className="py-2 text-gray-700">{row.moyenne !== null && row.moyenne !== undefined ? `${row.moyenne}/20` : '--'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                        <h3 className="mb-3 font-semibold text-gray-900">Élèves de la classe</h3>
                                        <ul className="max-h-80 space-y-2 overflow-auto text-sm">
                                            {detail.eleves.map((eleve) => (
                                                <li key={`${eleve.id ?? eleve.nomComplet}`} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                                                    <span className="font-medium text-gray-800">{eleve.nomComplet}</span>
                                                    <span className="text-gray-600">{eleve.moyenne ? `${eleve.moyenne}/20` : '--'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays size={18} className="text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">Emploi du temps</h3>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsScheduleCollapsed((current) => !current)}
                                        >
                                            {isScheduleCollapsed ? 'Déplier' : 'Replier'}
                                        </Button>
                                    </div>
                                    {!isScheduleCollapsed && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[680px] border-collapse text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 text-left text-gray-600">
                                                        <th className="border border-gray-200 p-2">Jour</th>
                                                        <th className="border border-gray-200 p-2">Créneau</th>
                                                        <th className="border border-gray-200 p-2">Cours</th>
                                                        <th className="border border-gray-200 p-2">Enseignant</th>
                                                        <th className="border border-gray-200 p-2">Salle</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {detail.emploiDuTemps.flatMap((jour) =>
                                                        jour.creneaux.map((creneau, index) => (
                                                            <tr key={`${jour.jour}-${creneau.heure}`}>
                                                                {index === 0 ? <td rowSpan={jour.creneaux.length} className="border border-gray-200 p-2 font-medium text-gray-800">{jour.jour}</td> : null}
                                                                <td className="border border-gray-200 p-2 text-gray-700">{creneau.heure}</td>
                                                                <td className="border border-gray-200 p-2">{creneau.matiere ?? <span className="text-gray-400">Aucun cours</span>}</td>
                                                                <td className="border border-gray-200 p-2">{creneau.enseignant ?? <span className="text-gray-400">--</span>}</td>
                                                                <td className="border border-gray-200 p-2">{creneau.salle ?? <span className="text-gray-400">--</span>}</td>
                                                            </tr>
                                                        )),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">{icon}{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
    );
}
