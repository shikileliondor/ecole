import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Check, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';

type Option = { id: number; [key: string]: any };

type Props = {
    classes: Option[];
    annees: Option[];
    eleves: Option[];
    parents: Option[];
};

export default function InscriptionsCreate({ classes, annees, eleves, parents }: Props) {
    const steps = useMemo(
        () => [
            { id: 1, key: 'identite', label: "Identité de l'élève" },
            { id: 2, key: 'contacts', label: 'Responsables et urgences' },
            { id: 3, key: 'scolarite', label: 'Affectation scolaire' },
            { id: 4, key: 'documents', label: 'Justificatifs' },
        ],
        [],
    );

    const [currentStep, setCurrentStep] = useState(0);
    const [stepError, setStepError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<any>({
        type_inscription: 'nouvelle',
        eleve_id: '',
        nom: '',
        prenoms: '',
        sexe: '',
        date_naissance: '',
        lieu_naissance: '',
        nationalite: 'Ivoirienne',
        reference_extrait: '',
        photo: null,

        mode_tuteur: 'create',
        parent_tuteur_id: '',
        nom_tuteur: '',
        prenoms_tuteur: '',
        telephone_tuteur: '',
        email_tuteur: '',
        adresse_tuteur: '',
        lien_parente: '',

        nom_urgence: '',
        telephone_urgence: '',
        lien_urgence: '',
        adresse_urgence: '',

        annee_scolaire_id: annees[0]?.id ? String(annees[0].id) : '',
        classe_id: '',
        date_inscription: new Date().toISOString().slice(0, 10),
        statut: 'inscrit',
        boursier: false,

        documents: [{ libelle: '', description: '', fichier: null }],
    });

    const addDocument = () => setData('documents', [...data.documents, { libelle: '', description: '', fichier: null }]);

    const updateDocument = (idx: number, field: string, value: any) => {
        const next = [...data.documents];
        next[idx] = { ...next[idx], [field]: value };
        setData('documents', next);
    };

    const validateCurrentStep = () => {
        if (currentStep === 0) {
            if (data.type_inscription === 'reinscription' && !data.eleve_id) {
                setStepError("Veuillez sélectionner un élève pour la réinscription.");
                return false;
            }

            if (data.type_inscription === 'nouvelle') {
                const required = [data.nom, data.prenoms, data.sexe, data.date_naissance];
                if (required.some((value) => !String(value ?? '').trim())) {
                    setStepError('Nom, prénoms, sexe et date de naissance sont obligatoires.');
                    return false;
                }
            }
        }

        if (currentStep === 1) {
            if (data.mode_tuteur === 'attach' && !data.parent_tuteur_id) {
                setStepError('Veuillez choisir un parent existant.');
                return false;
            }

            if (data.mode_tuteur !== 'attach') {
                const required = [data.nom_tuteur, data.prenoms_tuteur, data.telephone_tuteur, data.lien_parente];
                if (required.some((value) => !String(value ?? '').trim())) {
                    setStepError('Les informations tuteur sont incomplètes.');
                    return false;
                }
            }
        }

        if (currentStep === 2 && (!data.annee_scolaire_id || !data.classe_id)) {
            setStepError('Veuillez choisir une année scolaire et une classe.');
            return false;
        }

        setStepError(null);
        return true;
    };

    const goToNext = () => {
        if (!validateCurrentStep()) return;
        setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const goToPrev = () => {
        setStepError(null);
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const submit = () => post(route('inscriptions.store'), { forceFormData: true });

    const errorEntries = Object.entries(errors);
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AppLayout title="Nouvelle inscription">
            <Head title="Nouvelle inscription" />

            <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Créer une inscription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                {steps.map((step, index) => {
                                    const isDone = index < currentStep;
                                    const isActive = index === currentStep;

                                    return (
                                        <button
                                            key={step.key}
                                            type="button"
                                            className={`rounded-lg border px-3 py-2 text-left transition ${
                                                isActive
                                                    ? 'border-primary bg-primary/5'
                                                    : isDone
                                                      ? 'border-emerald-200 bg-emerald-50'
                                                      : 'border-border hover:bg-muted/40'
                                            }`}
                                            onClick={() => setCurrentStep(index)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : isDone
                                                          ? 'bg-emerald-600 text-white'
                                                          : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                                                </span>
                                                <span className="text-sm font-medium">{step.label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {currentStep === 0 ? (
                        <Card>
                            <CardHeader><CardTitle>Identité de l'élève</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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
                                    </div>
                                ) : (
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
                                )}
                            </CardContent>
                        </Card>
                    ) : null}

                    {currentStep === 1 ? (
                        <Card>
                            <CardHeader><CardTitle>Responsables et contact d'urgence</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div><Label>Nom urgence</Label><Input value={data.nom_urgence} onChange={(e) => setData('nom_urgence', e.target.value)} /></div>
                                    <div><Label>Téléphone urgence</Label><Input value={data.telephone_urgence} onChange={(e) => setData('telephone_urgence', e.target.value)} /></div>
                                    <div><Label>Lien urgence</Label><Input value={data.lien_urgence} onChange={(e) => setData('lien_urgence', e.target.value)} /></div>
                                    <div><Label>Adresse urgence</Label><Input value={data.adresse_urgence} onChange={(e) => setData('adresse_urgence', e.target.value)} /></div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {currentStep === 2 ? (
                        <Card>
                            <CardHeader><CardTitle>Affectation scolaire</CardTitle></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div><Label>Année scolaire</Label><Select value={data.annee_scolaire_id || 'none'} onValueChange={(v) => setData('annee_scolaire_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{annees.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Classe</Label><Select value={data.classe_id || 'none'} onValueChange={(v) => setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Date inscription</Label><Input type="date" value={data.date_inscription} onChange={(e) => setData('date_inscription', e.target.value)} /></div>
                                <div><Label>Statut</Label><Select value={data.statut} onValueChange={(v) => setData('statut', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inscrit">Inscrit</SelectItem><SelectItem value="transfere">Transféré</SelectItem><SelectItem value="abandonne">Abandonné</SelectItem></SelectContent></Select></div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {currentStep === 3 ? (
                        <Card>
                            <CardHeader><CardTitle>Documents justificatifs</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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

                    {stepError ? <FeedbackAlert type="error" title="Vérification étape" message={stepError} /> : null}
                    {errorEntries.length > 0 ? (
                        <FeedbackAlert
                            type="error"
                            title="Veuillez corriger les erreurs du formulaire"
                            message={errorEntries
                                .map(([field, message]) => `${field.replaceAll('_', ' ')}: ${String(message)}`)
                                .join(' · ')}
                        />
                    ) : null}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={isFirstStep ? () => window.history.back() : goToPrev}>
                            {isFirstStep ? 'Annuler' : <><ChevronLeft className="mr-1 h-4 w-4" /> Précédent</>}
                        </Button>
                        {isLastStep ? (
                            <Button type="button" onClick={submit} disabled={processing}>{processing ? 'Enregistrement...' : 'Créer l\'inscription'}</Button>
                        ) : (
                            <Button type="button" onClick={goToNext}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-4">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" />Résumé ERP</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p><span className="font-medium">Type:</span> {data.type_inscription === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription'}</p>
                            <p><span className="font-medium">Élève:</span> {data.nom || data.eleve_id ? `${data.nom} ${data.prenoms}`.trim() || 'Élève existant sélectionné' : 'Non renseigné'}</p>
                            <p><span className="font-medium">Tuteur:</span> {data.mode_tuteur === 'attach' ? 'Parent existant' : `${data.nom_tuteur} ${data.prenoms_tuteur}`.trim() || 'Non renseigné'}</p>
                            <p><span className="font-medium">Classe:</span> {classes.find((c) => String(c.id) === data.classe_id)?.nom ?? 'Non sélectionnée'}</p>
                            <p><span className="font-medium">Année:</span> {annees.find((a) => String(a.id) === data.annee_scolaire_id)?.libelle ?? 'Non sélectionnée'}</p>
                            <p><span className="font-medium">Documents:</span> {data.documents.length}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
