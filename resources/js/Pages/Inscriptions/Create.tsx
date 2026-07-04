import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, useRemember } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { ChevronRight, FileText, Info, School, ShieldCheck, Trash2, Upload, UserRound } from 'lucide-react';

type Option = { id: number; [key: string]: any };

type Props = {
    classes: Option[];
    annees: Option[];
    eleves: Option[];
    parents: Option[];
};

const inputClass = 'mt-2 h-11 rounded-lg border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-blue-900';
const selectClass = `${inputClass} w-full border px-3`;

type SimpleSelectOption = { value: string; label: string };

const relationshipOptions: SimpleSelectOption[] = [
    { value: 'pere', label: 'Père' },
    { value: 'mere', label: 'Mère' },
    { value: 'tuteur', label: 'Tuteur / Tutrice' },
    { value: 'grand_parent', label: 'Grand-parent' },
    { value: 'oncle_tante', label: 'Oncle / Tante' },
    { value: 'autre', label: 'Autre' },
];

function SimpleSelect({
    value,
    onChange,
    options,
    placeholder = 'Sélectionner',
}: {
    value: string;
    onChange: (value: string) => void;
    options: SimpleSelectOption[];
    placeholder?: string;
}) {
    return (
        <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export default function InscriptionsCreate({ classes, annees, eleves, parents }: Props) {
    const steps = useMemo(
        () => [
            { title: "Identité de l'élève", icon: UserRound, pastel: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
            { title: 'Responsables et urgence', icon: ShieldCheck, pastel: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
            { title: 'Affectation scolaire', icon: School, pastel: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
            { title: 'Justificatifs', icon: FileText, pastel: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
        ],
        [],
    );
    const [currentStep, setCurrentStep] = useRemember(0, 'inscriptions.create.current-step');
    const [stepError, setStepError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<any>('inscriptions.create.form', {
        type_inscription: 'nouvelle', eleve_id: '', nom: '', prenoms: '', sexe: '', date_naissance: '', lieu_naissance: '', nationalite: 'Ivoirienne', reference_extrait: '', photo: null,
        mode_tuteur: 'create', parent_tuteur_id: '', nom_tuteur: '', prenoms_tuteur: '', telephone_tuteur: '', email_tuteur: '', adresse_tuteur: '', lien_parente: '', lien_parente_autre: '',
        nom_urgence: '', prenoms_urgence: '', telephone_urgence: '', lien_urgence: '', lien_urgence_autre: '', adresse_urgence: '',
        annee_scolaire_id: annees[0]?.id ? String(annees[0].id) : '', classe_id: '', date_inscription: new Date().toISOString().slice(0, 10), statut: 'inscrit', boursier: false,
        documents: [{ libelle: '', description: '', fichier: null }],
    });

    const formatDisplayDate = (date: string) => {
        if (!date) return 'Non renseigné';
        const [y, m, d] = date.split('-');
        return y && m && d ? `${d}/${m}/${y}` : 'Non renseigné';
    };

    const validateCurrentStep = () => {
        if (currentStep === 0) {
            if (data.type_inscription === 'reinscription' && !data.eleve_id) return setStepError('Veuillez sélectionner un élève.'), false;
            if (data.type_inscription === 'nouvelle' && [data.nom, data.prenoms, data.sexe, data.date_naissance, data.lieu_naissance, data.nationalite].some((v) => !String(v || '').trim())) return setStepError('Complétez tous les champs obligatoires de la section identité.'), false;
        }
        if (currentStep === 1) {
            if (data.mode_tuteur === 'attach' && !data.parent_tuteur_id) return setStepError('Veuillez choisir un parent existant.'), false;
            if (data.mode_tuteur !== 'attach' && [data.nom_tuteur, data.prenoms_tuteur, data.telephone_tuteur, data.lien_parente].some((v) => !String(v || '').trim())) return setStepError('Complétez les informations du responsable légal.'), false;
            if (data.lien_parente === 'autre' && !String(data.lien_parente_autre || '').trim()) return setStepError('Précisez le lien du responsable légal.'), false;
            if ([data.nom_urgence, data.prenoms_urgence, data.telephone_urgence, data.lien_urgence].some((v) => !String(v || '').trim())) return setStepError("Complétez les informations de contact d'urgence."), false;
            if (data.lien_urgence === 'autre' && !String(data.lien_urgence_autre || '').trim()) return setStepError("Précisez le lien du contact d'urgence."), false;
        }
        if (currentStep === 2 && (!data.annee_scolaire_id || !data.classe_id)) return setStepError('Sélectionnez une année scolaire et une classe.'), false;
        setStepError(null);
        return true;
    };

    const submit = () => {
        post(route('inscriptions.store'), {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onError: () => setStepError('Veuillez corriger les erreurs signalées. Vos informations ont été conservées.'),
            onSuccess: () => {
                reset();
                setCurrentStep(0);
            },
        });
    };

    return (
        <AppLayout title="Nouvelle inscription">
            <Head title="Nouvelle inscription" />
            <div className="min-h-full space-y-6 bg-slate-50 p-1 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Créer une inscription</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enregistrez un nouvel élève et affectez-le à une classe.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-3 md:grid-cols-4">
                        {steps.map((step, index) => {
                            const active = currentStep === index;
                            const Icon = step.icon;
                            return <button key={step.title} type="button" onClick={() => setCurrentStep(index)} className={`relative rounded-xl border p-3 text-left transition-colors ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active ? 'bg-blue-600 text-white' : step.pastel}`}>{index + 1}</span>
                                    <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className={`text-sm font-medium ${active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{step.title}</span></div>
                                </div>
                                {active ? <span className="absolute inset-x-3 -bottom-px h-0.5 bg-blue-600" /> : null}
                            </button>;
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{steps[currentStep].title}</h2></div>
                        <CardContent className="space-y-6 p-6 dark:[&_label]:text-slate-200">
                            {currentStep === 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{/* identity */}
                                <div><Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Type d'inscription <span className="text-red-500">*</span></Label><SimpleSelect value={data.type_inscription} onChange={(v) => setData('type_inscription', v)} options={[{ value: 'nouvelle', label: 'Nouvelle inscription' }, { value: 'reinscription', label: 'Réinscription' }]} placeholder="Choisir le type" /></div>
                                {data.type_inscription === 'reinscription' ? <div><Label className="text-sm font-medium text-slate-800">Élève existant <span className="text-red-500">*</span></Label><SimpleSelect value={data.eleve_id || ''} onChange={(v) => setData('eleve_id', v)} options={eleves.map((e) => ({ value: String(e.id), label: `${e.matricule} - ${e.nom} ${e.prenoms}` }))} /></div> : <>
                                    <div><Label className="text-sm font-medium text-slate-800">Nom <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Nom de l'élève" value={data.nom} onChange={(e) => setData('nom', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Prénoms <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Prénoms de l'élève" value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Sexe <span className="text-red-500">*</span></Label><SimpleSelect value={data.sexe || ''} onChange={(v) => setData('sexe', v)} options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Date de naissance <span className="text-red-500">*</span></Label><Input className={inputClass} type="date" value={data.date_naissance} onChange={(e) => setData('date_naissance', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Lieu de naissance <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Lieu de naissance" value={data.lieu_naissance} onChange={(e) => setData('lieu_naissance', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Nationalité <span className="text-red-500">*</span></Label><Input className={inputClass} value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Référence extrait</Label><Input className={inputClass} placeholder="Référence de l'extrait de naissance" value={data.reference_extrait} onChange={(e) => setData('reference_extrait', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Photo</Label><Input className={inputClass} type="file" accept="image/*" onChange={(e) => setData('photo', e.target.files?.[0] ?? null)} /></div>
                                </>}
                            </div>}

                            {currentStep === 1 && <div className="space-y-6">{/* contacts */}
                                <section className="space-y-4">
                                    <div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Responsable légal</h3><p className="text-sm text-slate-500 dark:text-slate-400">Renseignez la personne légalement responsable de l'élève.</p></div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div><Label>Mode responsable</Label><SimpleSelect value={data.mode_tuteur} onChange={(v) => setData('mode_tuteur', v)} options={[{ value: 'create', label: 'Créer un responsable' }, { value: 'attach', label: 'Rattacher un responsable existant' }, { value: 'replace', label: 'Remplacer les responsables existants' }]} placeholder="Choisir le mode" /></div>
                                        {data.mode_tuteur === 'attach' ? <div><Label>Responsable existant *</Label><SimpleSelect value={data.parent_tuteur_id || ''} onChange={(v) => setData('parent_tuteur_id', v)} options={parents.map((p) => ({ value: String(p.id), label: `${p.nom} ${p.prenoms} (${p.telephone_1})` }))} /></div> : <>
                                            <div><Label>Lien avec l'élève *</Label><SimpleSelect value={data.lien_parente} onChange={(v) => { setData('lien_parente', v); if (v !== 'autre') setData('lien_parente_autre', ''); }} options={relationshipOptions} placeholder="Père, mère, tuteur…" /></div>
                                            {data.lien_parente === 'autre' ? <div><Label>Précisez le lien *</Label><Input className={inputClass} placeholder="Ex. : sœur, cousin, famille d'accueil" value={data.lien_parente_autre} onChange={(e) => setData('lien_parente_autre', e.target.value)} /></div> : null}
                                            <div><Label>Nom du responsable *</Label><Input className={inputClass} placeholder="Nom" value={data.nom_tuteur} onChange={(e) => setData('nom_tuteur', e.target.value)} /></div>
                                            <div><Label>Prénoms *</Label><Input className={inputClass} placeholder="Prénoms" value={data.prenoms_tuteur} onChange={(e) => setData('prenoms_tuteur', e.target.value)} /></div>
                                            <div><Label>Téléphone responsable *</Label><Input className={inputClass} type="tel" placeholder="Ex. : 0143099959" value={data.telephone_tuteur} onChange={(e) => setData('telephone_tuteur', e.target.value)} /></div>
                                            <div><Label>Email responsable</Label><Input className={inputClass} type="email" placeholder="adresse@email.com" value={data.email_tuteur} onChange={(e) => setData('email_tuteur', e.target.value)} /></div>
                                            <div className="md:col-span-2"><Label>Adresse responsable</Label><Input className={inputClass} placeholder="Quartier, commune, repère" value={data.adresse_tuteur} onChange={(e) => setData('adresse_tuteur', e.target.value)} /></div>
                                        </>}
                                    </div>
                                </section>

                                <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
                                    <div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Contact d'urgence</h3><p className="text-sm text-slate-500 dark:text-slate-400">Cette personne sera contactée si le responsable principal est indisponible.</p></div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div><Label>Lien avec l'élève *</Label><SimpleSelect value={data.lien_urgence} onChange={(v) => { setData('lien_urgence', v); if (v !== 'autre') setData('lien_urgence_autre', ''); }} options={relationshipOptions} placeholder="Choisir le lien" /></div>
                                        {data.lien_urgence === 'autre' ? <div><Label>Précisez le lien *</Label><Input className={inputClass} placeholder="Ex. : voisin de confiance" value={data.lien_urgence_autre} onChange={(e) => setData('lien_urgence_autre', e.target.value)} /></div> : null}
                                        <div><Label>Nom *</Label><Input className={inputClass} placeholder="Nom" value={data.nom_urgence} onChange={(e) => setData('nom_urgence', e.target.value)} /></div>
                                        <div><Label>Prénoms *</Label><Input className={inputClass} placeholder="Prénoms" value={data.prenoms_urgence} onChange={(e) => setData('prenoms_urgence', e.target.value)} /></div>
                                        <div><Label>Téléphone urgence *</Label><Input className={inputClass} type="tel" placeholder="Ex. : 0799524585" value={data.telephone_urgence} onChange={(e) => setData('telephone_urgence', e.target.value)} /></div>
                                        <div><Label>Adresse urgence</Label><Input className={inputClass} placeholder="Quartier, commune, repère" value={data.adresse_urgence} onChange={(e) => setData('adresse_urgence', e.target.value)} /></div>
                                    </div>
                                </section>
                            </div>}

                            {currentStep === 2 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div><Label>Année scolaire *</Label><SimpleSelect value={data.annee_scolaire_id || ''} onChange={(v) => setData('annee_scolaire_id', v)} options={annees.map((a) => ({ value: String(a.id), label: a.libelle }))} /></div>
                                <div><Label>Classe *</Label><SimpleSelect value={data.classe_id || ''} onChange={(v) => setData('classe_id', v)} options={classes.map((c) => ({ value: String(c.id), label: c.nom }))} /></div>
                                <div><Label>Statut inscription *</Label><SimpleSelect value={data.statut} onChange={(v) => setData('statut', v)} options={[{ value: 'inscrit', label: 'Inscrit' }, { value: 'transfere', label: 'Transféré' }, { value: 'abandonne', label: 'Abandonné' }]} placeholder="Choisir un statut" /></div>
                                <div><Label>Date inscription *</Label><Input className={inputClass} type="date" value={data.date_inscription} onChange={(e) => setData('date_inscription', e.target.value)} /></div>
                            </div>}

                            {currentStep === 3 && <div className="space-y-4">
                                <div><h3 className="font-semibold text-slate-900 dark:text-slate-100">Documents justificatifs</h3><p className="text-sm text-slate-500 dark:text-slate-400">Ajoutez un extrait de naissance, certificat, photo ou autre justificatif. PDF, JPG ou PNG — 5 Mo maximum.</p></div>
                                {data.documents.map((doc: any, idx: number) => <div key={idx} className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex items-center justify-between"><p className="text-sm font-medium">Document {idx + 1}</p>{data.documents.length > 1 ? <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setData('documents', data.documents.filter((_: any, documentIndex: number) => documentIndex !== idx))}><Trash2 className="mr-1 h-4 w-4" />Retirer</Button> : null}</div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div><Label>Libellé du document</Label><Input className={inputClass} placeholder="Ex. : Extrait de naissance" value={doc.libelle} onChange={(e) => { const next=[...data.documents]; next[idx]={...doc,libelle:e.target.value}; setData('documents', next);} } /></div>
                                        <div><Label>Fichier</Label><label className="mt-2 flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-sm hover:border-blue-500 dark:border-slate-700"><Upload className="h-4 w-4 text-blue-600" /><span className="min-w-0 flex-1 truncate">{doc.fichier?.name ?? 'Choisir un fichier'}</span><input className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e)=>{const next=[...data.documents];next[idx]={...doc,fichier:e.target.files?.[0]??null};setData('documents',next);}} /></label></div>
                                    </div>
                                    <div><Label>Informations complémentaires</Label><Textarea className="mt-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Description ou remarque concernant ce document" value={doc.description} onChange={(e)=>{const next=[...data.documents];next[idx]={...doc,description:e.target.value};setData('documents',next);}} /></div>
                                </div>)}
                                <Button type="button" variant="outline" onClick={() => setData('documents', [...data.documents, { libelle: '', description: '', fichier: null }])}><Upload className="mr-2 h-4 w-4" />Ajouter un autre document</Button>
                            </div>}

                            {stepError ? <FeedbackAlert type="error" title="Vérification étape" message={stepError} /> : null}
                            {Object.keys(errors).length > 0 ? <FeedbackAlert type="error" title="Erreurs de validation" message={Object.entries(errors).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')} /> : null}
                        </CardContent>
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                            <Button type="button" variant="outline" className="h-10 rounded-lg border-slate-200" onClick={() => currentStep === 0 ? window.history.back() : setCurrentStep(currentStep - 1)}>Annuler</Button>
                            {currentStep === steps.length - 1 ? <Button type="button" className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800" disabled={processing} onClick={submit}>{processing ? 'Création en cours...' : "Créer l'inscription"}</Button> : <Button type="button" className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800" onClick={() => validateCurrentStep() && setCurrentStep(currentStep + 1)}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button>}
                        </div>
                    </Card>

                    <Card className="h-fit rounded-2xl border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-6">
                        <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100"><FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /><h3 className="font-semibold">Résumé ERP</h3></div>
                        <div className="space-y-4 text-sm">
                            <div><p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Informations générales</p><p className="flex justify-between">Type <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">{data.type_inscription === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription'}</Badge></p><p className="mt-1 flex justify-between"><span>Date de création</span><span>{new Date().toLocaleDateString('fr-FR')}</span></p><p className="mt-1 flex justify-between">Statut <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">En cours</Badge></p></div>
                            <div><p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Élève</p><p>Nom complet: {(data.nom + ' ' + data.prenoms).trim() || 'Non renseigné'}</p><p>Date de naissance: {formatDisplayDate(data.date_naissance)}</p><p>Sexe: {data.sexe || 'Non renseigné'}</p><p>Nationalité: {data.nationalite || 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Affectation scolaire</p><p>Classe: {classes.find((c) => String(c.id) === data.classe_id)?.nom ?? 'Non sélectionnée'}</p><p>Année scolaire: {annees.find((a) => String(a.id) === data.annee_scolaire_id)?.libelle ?? 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Responsable</p><p>Responsable légal: {data.nom_tuteur || 'Non renseigné'}</p><p>Contact: {data.telephone_tuteur || 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Documents</p><p className="flex items-center gap-2">Documents ajoutés <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 dark:bg-slate-800">{data.documents.filter((doc: any) => doc.fichier).length}</span></p></div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-slate-600 dark:border-blue-900 dark:bg-blue-950/50 dark:text-slate-300"><p className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />Les informations du résumé se mettent à jour automatiquement au fur et à mesure.</p></div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
