import Pagination from '@/Components/Shared/Pagination';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import AppLayout from '@/Layouts/AppLayout';
import type { PaginationLink, PaginationMeta } from '@/types/eleve';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Search } from 'lucide-react';
import { useState } from 'react';

type Option = { id: number; nom?: string; libelle?: string };

type InscriptionItem = {
    id: number;
    date_inscription: string;
    statut: string;
    eleve?: { matricule?: string; nom?: string; prenoms?: string };
    classe?: { nom?: string };
    annee_scolaire?: { libelle?: string };
};

type Filters = {
    search?: string;
    classe_id?: string;
    annee_scolaire_id?: string;
    statut?: string;
};

type Props = {
    inscriptions: { data: InscriptionItem[]; links: PaginationLink[]; meta?: PaginationMeta; from?: number | null; to?: number | null; total?: number };
    filters: Filters;
    classes: Option[];
    annees: Option[];
};

const statutColorMap: Record<string, string> = {
    inscrit: 'bg-green-100 text-green-700',
    en_attente: 'bg-amber-100 text-amber-700',
    annule: 'bg-red-100 text-red-700',
};

const formatDate = (value: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function InscriptionsIndex({ inscriptions, filters, classes, annees }: Props) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

    const submitFilters = (nextFilters: Filters) => {
        router.get(route('inscriptions.index'), nextFilters, { preserveState: true, replace: true });
    };

    const onSearchChange = (value: string) => {
        const next = { ...localFilters, search: value || undefined };
        setLocalFilters(next);
        if (searchTimeout) window.clearTimeout(searchTimeout);
        const timeout = window.setTimeout(() => submitFilters(next), 300);
        setSearchTimeout(timeout);
    };

    const hasActiveFilters = Object.values(localFilters).some((value) => !!value);

    return (
        <AppLayout title="Inscriptions">
            <Head title="Inscriptions" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">Inscriptions</h1>
                        <p className="text-sm text-gray-500">Gestion des inscriptions des élèves</p>
                    </div>
                    <Link href={route('inscriptions.create')}>
                        <Button className="bg-[#1a56a0] text-white hover:bg-[#164983]">+ Nouvelle inscription</Button>
                    </Link>
                </div>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={localFilters.search ?? ''}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9"
                                placeholder="Rechercher élève ou matricule..."
                            />
                        </div>

                        <Select
                            value={localFilters.classe_id ?? 'all'}
                            onValueChange={(value) => {
                                const next = { ...localFilters, classe_id: value === 'all' ? undefined : value };
                                setLocalFilters(next);
                                submitFilters(next);
                            }}
                        >
                            <SelectTrigger className="w-full"><SelectValue placeholder="Classe" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les classes</SelectItem>
                                {classes.map((classe) => (
                                    <SelectItem key={classe.id} value={String(classe.id)}>{classe.nom}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={localFilters.annee_scolaire_id ?? 'all'}
                            onValueChange={(value) => {
                                const next = { ...localFilters, annee_scolaire_id: value === 'all' ? undefined : value };
                                setLocalFilters(next);
                                submitFilters(next);
                            }}
                        >
                            <SelectTrigger className="w-full"><SelectValue placeholder="Année" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les années</SelectItem>
                                {annees.map((annee) => (
                                    <SelectItem key={annee.id} value={String(annee.id)}>{annee.libelle}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={localFilters.statut ?? 'all'}
                            onValueChange={(value) => {
                                const next = { ...localFilters, statut: value === 'all' ? undefined : value };
                                setLocalFilters(next);
                                submitFilters(next);
                            }}
                        >
                            <SelectTrigger className="w-full"><SelectValue placeholder="Statut" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="inscrit">Inscrit</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="annule">Annulé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilters ? (
                        <div className="mt-3">
                            <Button variant="outline" onClick={() => { setLocalFilters({}); router.get(route('inscriptions.index')); }}>
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    ) : null}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Matricule</th>
                                    <th className="px-4 py-3 text-left">Élève</th>
                                    <th className="px-4 py-3 text-left">Classe</th>
                                    <th className="px-4 py-3 text-left">Année</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Statut</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscriptions.data.length > 0 ? inscriptions.data.map((inscription) => (
                                    <tr key={inscription.id} className="border-t border-gray-100 transition hover:bg-gray-50">
                                        <td className="px-4 py-3"><span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">{inscription.eleve?.matricule ?? '—'}</span></td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{inscription.eleve?.nom} {inscription.eleve?.prenoms}</td>
                                        <td className="px-4 py-3">{inscription.classe?.nom ?? '—'}</td>
                                        <td className="px-4 py-3">{inscription.annee_scolaire?.libelle ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {formatDate(inscription.date_inscription)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={`border-0 capitalize ${statutColorMap[inscription.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {inscription.statut?.replace('_', ' ') ?? '—'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link href={route('inscriptions.show', inscription.id)} className="text-[#1a56a0] hover:underline">Détail</Link>
                                                <Link href={route('inscriptions.edit', inscription.id)} className="text-[#1a56a0] hover:underline">Éditer</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="px-4 py-12 text-center text-sm text-gray-500" colSpan={7}>
                                            Aucune inscription trouvée avec ces filtres.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4">
                        <Pagination
                            links={inscriptions.links}
                            meta={inscriptions.meta ?? {
                                from: inscriptions.from ?? 0,
                                to: inscriptions.to ?? 0,
                                total: inscriptions.total ?? 0,
                                current_page: 1,
                                last_page: 1,
                                per_page: 20,
                            }}
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
