import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    classes: Array<any>;
    niveaux: Array<any>;
    annees: Array<any>;
    eleves: Array<any>;
    parents: Array<any>;
};

export default function InscriptionsCreate({ classes, annees, eleves, parents }: Props) {
    const steps = useMemo(
        () => [
            { id: 1, key: 'identite', label: "Identité élève" },
            { id: 2, key: 'responsables', label: 'Responsables & contacts' },
            { id: 3, key: 'scolarite', label: 'Affectation scolaire' },
            { id: 4, key: 'justificatifs', label: 'Justificatifs' },
        ],
        [],
    );
    const [currentStep, setCurrentStep] = useState(0);

    const { data, setData, post, processing, errors } = useForm<any>({
        type_inscription: 'nouvelle',
        eleve_id: '',
        nom: '', prenoms: '', sexe: '', date_naissance: '', lieu_naissance: '', nationalite: 'Ivoirienne', reference_extrait: '', photo: null,
        mode_tuteur: 'create', parent_tuteur_id: '', nom_tuteur: '', prenoms_tuteur: '', telephone_tuteur: '', email_tuteur: '', adresse_tuteur: '', lien_parente: '',
        nom_urgence: '', telephone_urgence: '', lien_urgence: '', adresse_urgence: '',
        annee_scolaire_id: annees[0]?.id ? String(annees[0].id) : '', classe_id: '', date_inscription: new Date().toISOString().slice(0, 10), statut: 'inscrit', boursier: false,
        documents: [{ libelle: '', description: '', fichier: null }],
    });

    const addDocument = () => setData('documents', [...data.documents, { libelle: '', description: '', fichier: null }]);
    const updateDocument = (idx: number, field: string, value: any) => {
        const next = [...data.documents];
        next[idx] = { ...next[idx], [field]: value };
        setData('documents', next);
    };

    const submit = () => {
        post(route('inscriptions.store'), { forceFormData: true });
    };

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const goToPrev = () => setCurrentStep((prev) => Math.max(0, prev - 1));
    const goToNext = () => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));

    const errorEntries = Object.entries(errors);

    return (
        <AppLayout title="Nouvelle inscription">
            <Head title="Nouvelle inscription" />
            <div className="space-y-6">
                <Card><CardContent className="pt-6"><h1 className="text-xl font-semibold">Nouvelle inscription</h1></CardContent></Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isDone = index < currentStep;

                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        className={`rounded-lg border px-4 py-3 text-left transition ${
                                            isActive
                                                ? 'border-primary bg-primary/5'
                                                : isDone
                                                  ? 'border-emerald-200 bg-emerald-50'
                                                  : 'border-border bg-background hover:bg-muted/40'
                                        }`}
                                        onClick={() => setCurrentStep(index)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : isDone
                                                      ? 'bg-emerald-600 text-white'
                                                      : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {isDone ? <Check className="h-4 w-4" /> : step.id}
                                            </span>
                                            <p className="font-semibold">{step.label}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {isDone ? 'Terminé' : isActive ? 'En cours' : 'À venir'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {currentStep === 0 ? (
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h2 className="font-semibold">Identité élève</h2>
                            <div>
                                <Label>Type d'inscription</Label>
                                <Select value={data.type_inscription} onValueChange={(v) => setData('type_inscription', v)}>
                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="nouvelle">Nouvelle inscription</SelectItem>
                                        <SelectItem value="reinscription">Réinscription</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.type_inscription === 'reinscription' ? (
                                <div>
                                    <Label>Élève existant</Label>
                                    <Select value={data.eleve_id || 'none'} onValueChange={(v) => setData('eleve_id', v === 'none' ? '' : v)}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un élève" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sélectionner</SelectItem>
                                            {eleves.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.matricule} - {e.nom} {e.prenoms}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.eleve_id ? <p className="text-xs text-red-500">{errors.eleve_id}</p> : null}
                                </div>
                            ) : null}

                            {data.type_inscription === 'nouvelle' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div><Label>Nom</Label><Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} /></div>
                                <div><Label>Prénoms</Label><Input value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} /></div>
                                <div><Label>Sexe</Label><Select value={data.sexe || 'none'} onValueChange={(v) => setData('sexe', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent></Select></div>
                                <div><Label>Date de naissance</Label><Input type="date" value={data.date_naissance} onChange={(e) => setData('date_naissance', e.target.value)} /></div>
                                <div><Label>Lieu de naissance</Label><Input value={data.lieu_naissance} onChange={(e) => setData('lieu_naissance', e.target.value)} /></div>
                                <div><Label>Nationalité</Label><Input value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} /></div>
                                <div><Label>Référence extrait</Label><Input value={data.reference_extrait} onChange={(e) => setData('reference_extrait', e.target.value)} /></div>
                                <div><Label>Photo</Label><Input type="file" accept="image/*" onChange={(e) => setData('photo', e.target.files?.[0] ?? null)} /></div>
                            </div>
                            ) : null}
                        </CardContent>
                    </Card>
                ) : null}

                {currentStep === 1 ? (
                    <>
                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <h2 className="font-semibold">Parent / tuteur</h2>
                                <div><Label>Mode tuteur</Label><Select value={data.mode_tuteur} onValueChange={(v) => setData('mode_tuteur', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="create">Créer</SelectItem><SelectItem value="attach">Rattacher</SelectItem><SelectItem value="replace">Remplacer</SelectItem></SelectContent></Select></div>
                                {data.mode_tuteur === 'attach' ? (
                                    <div><Label>Parent existant</Label><Select value={data.parent_tuteur_id || 'none'} onValueChange={(v) => setData('parent_tuteur_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sélectionner un parent" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{parents.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nom} {p.prenoms} ({p.telephone_1})</SelectItem>)}</SelectContent></Select></div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div><Label>Nom tuteur</Label><Input value={data.nom_tuteur} onChange={(e) => setData('nom_tuteur', e.target.value)} /></div>
                                        <div><Label>Prénoms tuteur</Label><Input value={data.prenoms_tuteur} onChange={(e) => setData('prenoms_tuteur', e.target.value)} /></div>
                                        <div><Label>Téléphone</Label><Input value={data.telephone_tuteur} onChange={(e) => setData('telephone_tuteur', e.target.value)} /></div>
                                        <div><Label>Email</Label><Input value={data.email_tuteur} onChange={(e) => setData('email_tuteur', e.target.value)} /></div>
                                        <div><Label>Adresse</Label><Input value={data.adresse_tuteur} onChange={(e) => setData('adresse_tuteur', e.target.value)} /></div>
                                        <div><Label>Lien de parenté</Label><Select value={data.lien_parente || 'none'} onValueChange={(v) => setData('lien_parente', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Lien" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem><SelectItem value="pere">Père</SelectItem><SelectItem value="mere">Mère</SelectItem><SelectItem value="tuteur">Tuteur</SelectItem><SelectItem value="grand_parent">Grand parent</SelectItem><SelectItem value="oncle_tante">Oncle/Tante</SelectItem></SelectContent></Select></div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <h2 className="font-semibold">Contact d'urgence (distinct)</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div><Label>Nom urgence</Label><Input value={data.nom_urgence} onChange={(e) => setData('nom_urgence', e.target.value)} /></div>
                                    <div><Label>Téléphone urgence</Label><Input value={data.telephone_urgence} onChange={(e) => setData('telephone_urgence', e.target.value)} /></div>
                                    <div><Label>Lien urgence</Label><Input value={data.lien_urgence} onChange={(e) => setData('lien_urgence', e.target.value)} /></div>
                                    <div><Label>Adresse urgence</Label><Input value={data.adresse_urgence} onChange={(e) => setData('adresse_urgence', e.target.value)} /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : null}

                {currentStep === 2 ? (
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h2 className="font-semibold">Informations d'inscription</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div><Label>Année scolaire</Label><Select value={data.annee_scolaire_id || 'none'} onValueChange={(v) => setData('annee_scolaire_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{annees.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Classe</Label><Select value={data.classe_id || 'none'} onValueChange={(v) => setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Date inscription</Label><Input type="date" value={data.date_inscription} onChange={(e) => setData('date_inscription', e.target.value)} /></div>
                                <div><Label>Statut</Label><Select value={data.statut} onValueChange={(v) => setData('statut', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inscrit">Inscrit</SelectItem><SelectItem value="transfere">Transféré</SelectItem><SelectItem value="abandonne">Abandonné</SelectItem></SelectContent></Select></div>
                                <div><Label>Matricule</Label><Input value="Auto-généré" disabled /></div>
                                <div className="flex items-center gap-2 pt-7"><input type="checkbox" checked={data.boursier} onChange={(e) => setData('boursier', e.target.checked)} /><span>Boursier</span></div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {currentStep === 3 ? (
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <h2 className="font-semibold">Documents justificatifs (libres)</h2>
                            {data.documents.map((doc: any, idx: number) => (
                                <div key={idx} className="grid gap-3 rounded-md border p-3 md:grid-cols-3">
                                    <Input placeholder="Libellé" value={doc.libelle} onChange={(e) => updateDocument(idx, 'libelle', e.target.value)} />
                                    <Input type="file" onChange={(e) => updateDocument(idx, 'fichier', e.target.files?.[0] ?? null)} />
                                    <Textarea placeholder="Description (optionnel)" value={doc.description} onChange={(e) => updateDocument(idx, 'description', e.target.value)} />
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addDocument}>Ajouter un document</Button>
                        </CardContent>
                    </Card>
                ) : null}

                {errorEntries.length > 0 ? (
                    <FeedbackAlert
                        type="error"
                        title="Veuillez corriger les erreurs du formulaire."
                        message={errorEntries
                            .map(([field, message]) => `${field.replaceAll('_', ' ')}: ${String(message)}`)
                            .join(' · ')}
                    />
                ) : null}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={isFirstStep ? () => window.history.back() : goToPrev}>
                        {isFirstStep ? 'Annuler' : 'Précédent'}
                    </Button>
                    {isLastStep ? (
                        <Button type="button" onClick={submit} disabled={processing}>{processing ? 'Enregistrement...' : 'Créer l\'inscription'}</Button>
                    ) : (
                        <Button type="button" onClick={goToNext}>Suivant</Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
