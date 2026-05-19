import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Shared/Pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Briefcase, FileWarning, GraduationCap, ShieldCheck, Users } from 'lucide-react';

type SelectOptionMap = Record<string, string>;

type PersonnelItem = {
    id: number;
    matricule_interne?: string | null;
    nom: string;
    prenoms: string;
    nom_complet: string;
    categorie: string;
    type: string;
    telephone: string;
    email?: string | null;
    statut: string;
    type_contrat?: string | null;
    date_embauche?: string | null;
    classes_affectees?: Array<{ id: number; nom: string }>;
    documents?: Array<{ id: number; libelle: string }>;
};

type Props = {
    personnel: {
        data: PersonnelItem[];
        links: Array<any>;
        meta?: any;
    };
    filters: {
        search?: string | null;
        categorie?: string | null;
    };
    options: {
        categories: SelectOptionMap;
        types: SelectOptionMap;
        typesContrat: SelectOptionMap;
        statuts: SelectOptionMap;
        sexes: SelectOptionMap;
    };
    classes: Array<{ id: number; nom: string }>;
};

const textOrFallback = (value?: string | null, fallback = 'Non renseigné') => value?.trim() || fallback;

export default function PersonnelIndex({ personnel, filters, options, classes }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categorieFilter, setCategorieFilter] = useState(filters.categorie ?? 'all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statutFilter, setStatutFilter] = useState('all');
    const [panelOpen, setPanelOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<any>({
        matricule_interne: '',
        nom: '',
        prenoms: '',
        sexe: 'M',
        date_naissance: '',
        lieu_naissance: '',
        nationalite: 'Ivoirienne',
        telephone: '',
        email: '',
        categorie: 'personnel_ecole',
        type: 'secretaire',
        date_embauche: new Date().toISOString().slice(0, 10),
        type_contrat: 'CDI',
        salaire_base: 0,
        statut: 'actif',
        documents: [{ libelle: '', description: '', fichier: null }],
        classes_ids: [] as number[],
    });

    const applyFilters = (nextSearch: string, nextCategorie: string) => {
        router.get(route('personnel.index'), {
            search: nextSearch || undefined,
            categorie: nextCategorie === 'all' ? undefined : nextCategorie,
        }, { preserveState: true, replace: true });
    };

    const addDocument = () => setData('documents', [...data.documents, { libelle: '', description: '', fichier: null }]);

    const submit = () => {
        post(route('personnel.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPanelOpen(false);
            },
        });
    };

    const filteredPersonnel = useMemo(() => personnel.data.filter((item) => {
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        if (statutFilter !== 'all' && item.statut !== statutFilter) return false;
        return true;
    }), [personnel.data, statutFilter, typeFilter]);

    const stats = useMemo(() => {
        const total = personnel.data.length;
        const enseignants = personnel.data.filter((p) => p.categorie === 'enseignant').length;
        const administration = personnel.data.filter((p) => ['administration', 'directeur', 'secretaire'].some((k) => `${p.type} ${p.categorie}`.toLowerCase().includes(k))).length;
        const actifs = personnel.data.filter((p) => p.statut === 'actif').length;
        const documentsManquants = personnel.data.filter((p) => !p.documents || p.documents.length === 0).length;

        return { total, enseignants, administration, actifs, documentsManquants };
    }, [personnel.data]);

    const pagination = {
        total: personnel.meta?.total ?? filteredPersonnel.length,
        from: filteredPersonnel.length > 0 ? (personnel.meta?.from ?? 1) : 0,
        to: filteredPersonnel.length > 0 ? (personnel.meta?.to ?? filteredPersonnel.length) : 0,
    };

    return (
        <AppLayout title="Personnel">
            <Head title="Personnel" />

            <div className="min-h-full space-y-5 bg-[#F8FAFC] p-1 text-[#0F172A]">
                <header className="space-y-2">
                    <p className="text-sm text-slate-500">Accueil / Personnel</p>
                    <h1 className="text-3xl font-bold text-slate-900">Personnel</h1>
                    <p className="text-sm text-slate-500">Gérez les employés, les postes, les documents et les affectations de l&apos;établissement.</p>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                    {[{
                        label: 'Total personnel', value: stats.total, icon: Users, tone: 'bg-blue-50 text-[#0B63CE]', note: 'Tous profils confondus',
                    }, {
                        label: 'Enseignants', value: stats.enseignants, icon: GraduationCap, tone: 'bg-blue-50 text-[#0B63CE]', note: 'Corps enseignant',
                    }, {
                        label: 'Administration', value: stats.administration, icon: Briefcase, tone: 'bg-violet-50 text-[#7C3AED]', note: 'Direction et secrétariat',
                    }, {
                        label: 'Agents actifs', value: stats.actifs, icon: ShieldCheck, tone: 'bg-green-50 text-[#16A34A]', note: 'Statut actif',
                    }, {
                        label: 'Documents manquants', value: stats.documentsManquants, icon: FileWarning, tone: 'bg-orange-50 text-[#F97316]', note: 'Dossiers à compléter',
                    }].map((card) => (
                        <Card key={card.label} className="rounded-2xl border-slate-200 shadow-sm">
                            <CardContent className="flex items-start gap-4 p-5">
                                <div className={`rounded-xl p-2 ${card.tone}`}><card.icon className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                                    <p className="text-sm font-medium text-slate-700">{card.label}</p>
                                    <p className="text-xs text-slate-500">{card.note}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="mt-5 rounded-2xl border-slate-200 shadow-sm">
                    <CardContent className="grid gap-3 p-4 lg:grid-cols-6">
                        <Input className="min-h-[42px] lg:col-span-2" placeholder="Rechercher nom, téléphone, email, matricule..." value={search} onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            applyFilters(value, categorieFilter);
                        }} />
                        <Select value={categorieFilter} onValueChange={(value) => {
                            setCategorieFilter(value);
                            applyFilters(search, value);
                        }}>
                            <SelectTrigger className="min-h-[42px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes catégories</SelectItem>
                                {Object.entries(options.categories).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="min-h-[42px]"><SelectValue placeholder="Type / Profil" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les profils</SelectItem>
                                {Object.entries(options.types).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statutFilter} onValueChange={setStatutFilter}>
                            <SelectTrigger className="min-h-[42px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                {Object.entries(options.statuts).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center justify-end gap-2 lg:col-span-1">
                            <Button type="button" variant="outline" onClick={() => {
                                setSearch(''); setCategorieFilter('all'); setTypeFilter('all'); setStatutFilter('all'); applyFilters('', 'all');
                            }}>Réinitialiser</Button>
                            <Button type="button" className="bg-[#0B63CE] hover:bg-[#0B63CE]/90" onClick={() => setPanelOpen(true)}>Ajouter un personnel</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_380px]">
                    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Employé</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Poste</th><th className="px-4 py-3 text-left">Contrat</th><th className="px-4 py-3 text-left">Documents</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPersonnel.length === 0 ? (
                                            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Aucun personnel trouvé pour les filtres sélectionnés.</td></tr>
                                        ) : filteredPersonnel.map((item) => {
                                            const initials = `${item.nom?.[0] || ''}${item.prenoms?.[0] || ''}`.toUpperCase();
                                            const docCount = item.documents?.length ?? 0;
                                            const statusClass = item.statut === 'actif' ? 'bg-green-50 text-[#16A34A]' : item.statut === 'suspendu' ? 'bg-red-50 text-[#EF4444]' : item.statut === 'en_attente' ? 'bg-orange-50 text-[#F97316]' : 'bg-slate-100 text-slate-600';
                                            const cat = `${item.categorie} ${item.type}`.toLowerCase();
                                            const categoryClass = cat.includes('enseignant') ? 'bg-blue-50 text-[#0B63CE]' : ['administration', 'directeur', 'secretaire'].some((c) => cat.includes(c)) ? 'bg-violet-50 text-[#7C3AED]' : cat.includes('entretien') ? 'bg-orange-50 text-[#F97316]' : 'bg-slate-100 text-slate-600';
                                            const docClass = docCount === 0 ? 'bg-slate-100 text-slate-600' : 'bg-green-50 text-[#16A34A]';
                                            return (
                                                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">{initials || 'NA'}</div><div><p className="font-medium text-slate-900">{textOrFallback(item.nom_complet)}</p><p className="text-xs text-slate-500">Matricule: {textOrFallback(item.matricule_interne)}</p></div></div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm"><p>{textOrFallback(item.telephone)}</p><p className="text-xs text-slate-500">{textOrFallback(item.email)}</p></td>
                                                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${categoryClass}`}>{textOrFallback(item.categorie)}</span><p className="mt-1 text-xs text-slate-500">{textOrFallback(item.type)}</p></td>
                                                    <td className="px-4 py-4 text-xs text-slate-600"><p>{textOrFallback(item.type_contrat)}</p><p>{textOrFallback(item.date_embauche)}</p></td>
                                                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${docClass}`}>{docCount} document{docCount > 1 ? 's' : ''}</span></td>
                                                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{textOrFallback(item.statut)}</span></td>
                                                    <td className="px-4 py-4 text-right"><Button type="button" variant="outline" size="sm" onClick={() => setPanelOpen(true)}>···</Button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center">
                                <p>Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats</p>
                                <Pagination links={personnel.links} meta={personnel.meta} />
                            </div>
                        </CardContent>
                    </Card>

                    {panelOpen ? (
                        <Card className="h-fit rounded-2xl border-slate-200 shadow-sm">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">Ajouter un personnel</h2><Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}>✕</Button></div>
                                <div className="space-y-4">
                                    <section className="space-y-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Identité</p><div className="grid gap-3"><div><Label>Matricule</Label><Input value={data.matricule_interne || 'Généré automatiquement après enregistrement'} readOnly disabled className="bg-slate-50 text-slate-500" /></div><div><Label>Nom</Label><Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} /></div><div><Label>Prénoms</Label><Input value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} /></div><div><Label>Sexe</Label><Select value={data.sexe} onValueChange={(value) => setData('sexe', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.sexes).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div><div><Label>Date de naissance</Label><Input type="date" value={data.date_naissance} onChange={(e) => setData('date_naissance', e.target.value)} /></div><div><Label>Nationalité</Label><Input value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} /></div></div></section>
                                    <section className="space-y-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact</p><div className="grid gap-3"><div><Label>Téléphone</Label><Input value={data.telephone} onChange={(e) => setData('telephone', e.target.value)} /></div><div><Label>Email</Label><Input value={data.email} onChange={(e) => setData('email', e.target.value)} /></div><div><Label>Adresse</Label><Input value={data.lieu_naissance} onChange={(e) => setData('lieu_naissance', e.target.value)} /></div></div></section>
                                    <section className="space-y-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fonction</p><div className="grid gap-3"><div><Label>Catégorie</Label><Select value={data.categorie} onValueChange={(value) => setData('categorie', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.categories).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div><div><Label>Type / Profil</Label><Select value={data.type} onValueChange={(value) => setData('type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.types).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div><div><Label>Contrat</Label><Select value={data.type_contrat} onValueChange={(value) => setData('type_contrat', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.typesContrat).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div><div><Label>Date d'embauche</Label><Input type="date" value={data.date_embauche} onChange={(e) => setData('date_embauche', e.target.value)} /></div><div><Label>Statut</Label><Select value={data.statut} onValueChange={(value) => setData('statut', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.statuts).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div><div><Label>Salaire de base</Label><Input type="number" value={data.salaire_base} onChange={(e) => setData('salaire_base', Number(e.target.value))} /></div></div></section>
                                </div>
                                <section className="space-y-2 rounded-xl border border-slate-200 p-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Documents</p>{data.documents.map((doc: any, index: number) => <div key={index} className="grid gap-2"><Input placeholder="Libellé" value={doc.libelle} onChange={(e) => { const next = [...data.documents]; next[index] = { ...next[index], libelle: e.target.value }; setData('documents', next); }} /><Input placeholder="Description" value={doc.description} onChange={(e) => { const next = [...data.documents]; next[index] = { ...next[index], description: e.target.value }; setData('documents', next); }} /><Input type="file" onChange={(e) => { const next = [...data.documents]; next[index] = { ...next[index], fichier: e.target.files?.[0] ?? null }; setData('documents', next); }} /></div>)}<Button type="button" variant="outline" onClick={addDocument}>Ajouter document</Button></section>

                                {Object.keys(errors).length > 0 ? <p className="text-sm text-[#EF4444]">Veuillez corriger les champs requis.</p> : null}
                                <Button type="button" onClick={submit} disabled={processing} className="w-full bg-[#0B63CE] hover:bg-[#0B63CE]/90">{processing ? 'Enregistrement en cours...' : 'Enregistrer'}</Button>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </div>
        </AppLayout>
    );
}
