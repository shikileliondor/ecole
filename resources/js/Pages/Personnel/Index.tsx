import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Shared/Pagination';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

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

export default function PersonnelIndex({ personnel, filters, options, classes }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categorieFilter, setCategorieFilter] = useState(filters.categorie ?? 'all');

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
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout title="Personnel">
            <Head title="Personnel" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Personnel</h1>
                    <p className="text-sm text-gray-500">Gestion des identités, postes, documents et affectations des employés.</p>
                </div>

                <Card>
                    <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
                        <Input
                            placeholder="Rechercher nom, téléphone, matricule..."
                            value={search}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);
                                applyFilters(value, categorieFilter);
                            }}
                        />
                        <Select
                            value={categorieFilter}
                            onValueChange={(value) => {
                                setCategorieFilter(value);
                                applyFilters(search, value);
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes catégories</SelectItem>
                                {Object.entries(options.categories).map(([key]) => (
                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => {
                            setSearch('');
                            setCategorieFilter('all');
                            applyFilters('', 'all');
                        }}>
                            Réinitialiser
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <h2 className="font-semibold">Nouveau personnel</h2>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div><Label>Matricule</Label><Input value={data.matricule_interne} onChange={(e) => setData('matricule_interne', e.target.value)} /></div>
                                <div><Label>Nom</Label><Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} /></div>
                                <div><Label>Prénoms</Label><Input value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} /></div>
                                <div><Label>Téléphone</Label><Input value={data.telephone} onChange={(e) => setData('telephone', e.target.value)} /></div>
                                <div><Label>Email</Label><Input value={data.email} onChange={(e) => setData('email', e.target.value)} /></div>
                                <div><Label>Date embauche</Label><Input type="date" value={data.date_embauche} onChange={(e) => setData('date_embauche', e.target.value)} /></div>
                                <div><Label>Sexe</Label><Select value={data.sexe} onValueChange={(value) => setData('sexe', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.sexes).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Nationalité</Label><Input value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} /></div>
                                <div><Label>Catégorie</Label><Select value={data.categorie} onValueChange={(value) => setData('categorie', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.categories).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Type/Profil</Label><Select value={data.type} onValueChange={(value) => setData('type', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.types).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Contrat</Label><Select value={data.type_contrat} onValueChange={(value) => setData('type_contrat', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.typesContrat).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Salaire de base</Label><Input type="number" value={data.salaire_base} onChange={(e) => setData('salaire_base', Number(e.target.value))} /></div>
                                <div><Label>Statut</Label><Select value={data.statut} onValueChange={(value) => setData('statut', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options.statuts).map(([key]) => <SelectItem key={key} value={key}>{key}</SelectItem>)}</SelectContent></Select></div>
                            </div>

                            {data.categorie === 'enseignant' ? (
                                <div className="space-y-2 rounded-md border p-3">
                                    <p className="text-sm font-medium">Affectation classes (enseignant)</p>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {classes.map((classe) => {
                                            const checked = data.classes_ids.includes(classe.id);
                                            return (
                                                <label key={classe.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = e.target.checked
                                                                ? [...data.classes_ids, classe.id]
                                                                : data.classes_ids.filter((id: number) => id !== classe.id);
                                                            setData('classes_ids', next);
                                                        }}
                                                    />
                                                    {classe.nom}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-2 rounded-md border p-3">
                                <p className="text-sm font-medium">Documents (libellé + fichier)</p>
                                {data.documents.map((doc: any, index: number) => (
                                    <div key={index} className="grid gap-2 md:grid-cols-3">
                                        <Input placeholder="Libellé" value={doc.libelle} onChange={(e) => {
                                            const next = [...data.documents];
                                            next[index] = { ...next[index], libelle: e.target.value };
                                            setData('documents', next);
                                        }} />
                                        <Input placeholder="Description" value={doc.description} onChange={(e) => {
                                            const next = [...data.documents];
                                            next[index] = { ...next[index], description: e.target.value };
                                            setData('documents', next);
                                        }} />
                                        <Input type="file" onChange={(e) => {
                                            const next = [...data.documents];
                                            next[index] = { ...next[index], fichier: e.target.files?.[0] ?? null };
                                            setData('documents', next);
                                        }} />
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addDocument}>Ajouter document</Button>
                            </div>

                            {Object.keys(errors).length > 0 ? <p className="text-sm text-red-500">Veuillez corriger les champs requis.</p> : null}
                            <Button type="button" onClick={submit} disabled={processing}>Enregistrer</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-3 pt-6">
                            <h2 className="font-semibold">Liste du personnel</h2>
                            <div className="space-y-3">
                                {personnel.data.map((item) => (
                                    <div key={item.id} className="rounded-lg border p-3">
                                        <p className="font-medium">{item.nom_complet}</p>
                                        <p className="text-xs text-gray-500">{item.categorie} · {item.type} · {item.statut}</p>
                                        <p className="text-sm">{item.telephone} {item.email ? `• ${item.email}` : ''}</p>
                                        {item.classes_affectees && item.classes_affectees.length > 0 ? (
                                            <p className="text-xs text-blue-700">Classes: {item.classes_affectees.map((c) => c.nom).join(', ')}</p>
                                        ) : null}
                                        <p className="text-xs text-gray-600">Documents: {item.documents?.map((doc) => doc.libelle).join(', ') || 'Aucun'}</p>
                                    </div>
                                ))}
                            </div>
                            <Pagination links={personnel.links} meta={personnel.meta} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
