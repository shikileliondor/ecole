import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AlertCircle, ArrowRightLeft, Award, Download, EllipsisVertical, Eye, FileSpreadsheet, FileText, Pencil, Search, Trash2, UserCheck, UserPlus, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import StatCard from '@/Components/Eleves/StatCard';
import EleveAvatar from '@/Components/Eleves/EleveAvatar';
import NiveauBadge from '@/Components/Eleves/NiveauBadge';
import StatutBadge from '@/Components/Eleves/StatutBadge';
import Pagination from '@/Components/Shared/Pagination';
import type { Classe, Eleve, Niveau, PaginationLink, PaginationMeta, Stats } from '@/types/eleve';

type Filters = { search?: string; classe_id?: string; niveau_id?: string; statut?: string; sexe?: string };

type Props = {
    eleves: { data: Eleve[]; links: PaginationLink[]; meta?: PaginationMeta; from?: number | null; to?: number | null; total?: number };
    classes: Classe[];
    niveaux: Niveau[];
    filters: Filters;
    stats: Stats;
};

export default function ElevesIndex({ eleves, classes, niveaux, filters, stats }: Props) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
    const [showTransfertDialog, setShowTransfertDialog] = useState(false);
    const [eleveATransferer, setEleveATransferer] = useState<Eleve | null>(null);
    const [ecoleDestination, setEcoleDestination] = useState('');
    const [eleveASupprimer, setEleveASupprimer] = useState<Eleve | null>(null);

    const classesFiltrees = useMemo(() => {
        if (!localFilters.niveau_id) return classes;
        return classes.filter((c) => String(c.niveau?.id ?? '') === localFilters.niveau_id);
    }, [classes, localFilters.niveau_id]);

    const hasActiveFilters = Object.values(localFilters).some((value) => !!value);

    const submitFilters = (nextFilters: Filters) => {
        router.get(route('eleves.index'), nextFilters, { preserveState: true, replace: true });
    };

    const onSearchChange = (value: string) => {
        const next = { ...localFilters, search: value || undefined };
        setLocalFilters(next);
        if (searchTimeout) window.clearTimeout(searchTimeout);
        const timeout = window.setTimeout(() => submitFilters(next), 300);
        setSearchTimeout(timeout);
    };

    const principalParent = (eleve: Eleve) => (eleve.parentsTuteurs ?? eleve.parents ?? []).find((p) => p.pivot?.est_principal);
    const currentClasse = (eleve: Eleve) => eleve.inscription_active?.classe ?? eleve.inscriptions?.[0]?.classe;

    return (
        <AppLayout title="Élèves">
            <Head title="Élèves" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">Élèves</h1>
                        <p className="text-sm text-gray-500">Gestion des élèves inscrits</p>
                    </div>
                    <Link href={route('eleves.create')}>
                        <Button className="bg-[#1a56a0] text-white hover:bg-[#164983]">
                            <UserPlus className="mr-2 h-4 w-4" />+ Nouvel élève
                        </Button>
                    </Link>
                </div>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard icon={<Users className="h-5 w-5" />} label="Total élèves" value={stats.total_eleves} color="bg-blue-100 text-blue-700" />
                    <StatCard icon={<UserCheck className="h-5 w-5" />} label="Garçons" value={stats.total_garcons} color="bg-indigo-100 text-indigo-700" />
                    <StatCard icon={<UserCheck className="h-5 w-5" />} label="Filles" value={stats.total_filles} color="bg-pink-100 text-pink-700" />
                    <StatCard icon={<Award className="h-5 w-5" />} label="Boursiers" value={stats.total_boursiers} color="bg-amber-100 text-amber-700" />
                    <StatCard icon={<UserPlus className="h-5 w-5" />} label="Nouveaux ce mois" value={stats.nouveaux_ce_mois} color="bg-green-100 text-green-700" />
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input value={localFilters.search ?? ''} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" placeholder="Rechercher nom, prénom, matricule..." />
                        </div>

                        <Select value={localFilters.niveau_id ?? 'all'} onValueChange={(value) => {
                            const next = { ...localFilters, niveau_id: value === 'all' ? undefined : value, classe_id: undefined };
                            setLocalFilters(next);
                            submitFilters(next);
                        }}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Niveau" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les niveaux</SelectItem>
                                {niveaux.map((niveau) => <SelectItem key={niveau.id} value={String(niveau.id)}>{niveau.libelle}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.classe_id ?? 'all'} onValueChange={(value) => {
                            const next = { ...localFilters, classe_id: value === 'all' ? undefined : value };
                            setLocalFilters(next);
                            submitFilters(next);
                        }}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Classe" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les classes</SelectItem>
                                {classesFiltrees.map((classe) => <SelectItem key={classe.id} value={String(classe.id)}>{classe.nom}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.statut ?? 'all'} onValueChange={(value) => {
                            const next = { ...localFilters, statut: value === 'all' ? undefined : value };
                            setLocalFilters(next);
                            submitFilters(next);
                        }}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Statut" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem><SelectItem value="actif">Actif</SelectItem><SelectItem value="transfere">Transféré</SelectItem><SelectItem value="exclu">Exclu</SelectItem><SelectItem value="sorti">Sorti</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={localFilters.sexe ?? 'all'} onValueChange={(value) => {
                            const next = { ...localFilters, sexe: value === 'all' ? undefined : value };
                            setLocalFilters(next);
                            submitFilters(next);
                        }}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Sexe" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem><SelectItem value="M">Garçon</SelectItem><SelectItem value="F">Fille</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {hasActiveFilters ? <Button variant="outline" onClick={() => { setLocalFilters({}); router.get(route('eleves.index')); }}>Réinitialiser</Button> : null}
                        <Button variant="outline" onClick={() => window.open(route('eleves.export.pdf', localFilters), '_blank')}><Download className="mr-2 h-4 w-4" />Exporter PDF</Button>
                        <Button variant="outline" onClick={() => window.open(route('eleves.export.word', localFilters), '_blank')}><FileText className="mr-2 h-4 w-4" />Exporter Word</Button>
                        <Button variant="outline" onClick={() => window.open(route('eleves.export.excel', localFilters), '_blank')}><FileSpreadsheet className="mr-2 h-4 w-4" />Exporter Excel</Button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    {eleves.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>
                                    <th className="px-4 py-3 text-left">Élève</th><th className="px-4 py-3 text-left">Matricule</th><th className="px-4 py-3 text-left">Niveau</th><th className="px-4 py-3 text-left">Sexe</th><th className="px-4 py-3 text-left">Parent</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-right">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {eleves.data.map((eleve) => {
                                        const parent = principalParent(eleve);
                                        const classe = currentClasse(eleve);
                                        return (
                                            <tr key={eleve.id} className="border-t border-gray-100 transition hover:bg-gray-50">
                                                <td className="px-4 py-3"><div className="flex items-center gap-3"><EleveAvatar photo={eleve.photo} nom={eleve.nom} prenoms={eleve.prenoms} /><div><p className="font-medium text-gray-800">{eleve.nom} {eleve.prenoms}</p><p className="text-xs text-gray-500">{classe?.nom ?? 'Non affecté'}</p></div></div></td>
                                                <td className="px-4 py-3"><span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">{eleve.matricule}</span></td>
                                                <td className="px-4 py-3">{classe?.niveau?.libelle ? <NiveauBadge niveau={classe.niveau.libelle} /> : '—'}</td>
                                                <td className="px-4 py-3 text-sm">{eleve.sexe === 'M' ? 'Garçon' : 'Fille'}</td>
                                                <td className="px-4 py-3 text-sm"><p>{parent ? `${parent.nom} ${parent.prenoms}` : '—'}</p><div className="flex items-center gap-2 text-xs text-gray-500"><span>{parent?.telephone_1 ?? 'N/A'}</span>{parent?.whatsapp ? <a href={`https://wa.me/${parent.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-green-600" /></a> : null}</div></td>
                                                <td className="px-4 py-3"><StatutBadge statut={eleve.statut} /></td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><EllipsisVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => router.visit(route('eleves.show', eleve.id))}><Eye className="mr-2 h-4 w-4" />Voir la fiche</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.visit(route('eleves.edit', eleve.id))}><Pencil className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => { setEleveATransferer(eleve); setShowTransfertDialog(true); }}><ArrowRightLeft className="mr-2 h-4 w-4" />Transférer</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => setEleveASupprimer(eleve)}><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                            <Users className="mb-2 h-16 w-16 text-gray-300" />
                            <p className="font-medium text-gray-700">Aucun élève trouvé</p>
                            <p className="mb-4 text-sm text-gray-500">{hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Commencez en créant une inscription.'}</p>
                            {!hasActiveFilters ? <Link href={route('eleves.create')}><Button className="bg-[#1a56a0]">Inscrire le premier élève</Button></Link> : null}
                        </div>
                    )}
                    <div className="p-4"><Pagination links={eleves.links} meta={eleves.meta ?? { from: eleves.from ?? 0, to: eleves.to ?? 0, total: eleves.total ?? 0, current_page: 1, last_page: 1, per_page: 20 }} /></div>
                </section>
            </div>

            <Dialog open={showTransfertDialog} onOpenChange={setShowTransfertDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Transférer l'élève</DialogTitle><DialogDescription>Indiquez l'école de destination.</DialogDescription></DialogHeader>
                    <Input value={ecoleDestination} onChange={(e) => setEcoleDestination(e.target.value)} placeholder="École de destination" required />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransfertDialog(false)}>Annuler</Button>
                        <Button className="bg-[#1a56a0]" disabled={!ecoleDestination} onClick={() => {
                            if (!eleveATransferer) return;
                            router.post(route('eleves.transferer', eleveATransferer.id), { ecole_destination: ecoleDestination }, { onSuccess: () => { setShowTransfertDialog(false); setEcoleDestination(''); } });
                        }}>Confirmer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!eleveASupprimer} onOpenChange={(open) => !open && setEleveASupprimer(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Confirmer la suppression</AlertDialogTitle><AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cet élève ?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => eleveASupprimer && router.delete(route('eleves.destroy', eleveASupprimer.id))}><AlertCircle className="mr-2 h-4 w-4" />Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
