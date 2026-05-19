import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Bell, ChevronRight, FileText, Info, Moon, School, Search, ShieldCheck, UserRound } from 'lucide-react';

type Option = { id: number; [key: string]: any };

type Props = {
    classes: Option[];
    annees: Option[];
    eleves: Option[];
    parents: Option[];
};

const inputClass = 'mt-2 h-11 rounded-lg border-slate-200 text-sm focus-visible:ring-blue-100';

export default function InscriptionsCreate({ classes, annees, eleves, parents }: Props) {
    const steps = useMemo(
        () => [
            { title: "Identité de l'élève", icon: UserRound, pastel: 'bg-blue-100 text-blue-700' },
            { title: 'Responsables et urgence', icon: ShieldCheck, pastel: 'bg-emerald-100 text-emerald-700' },
            { title: 'Affectation scolaire', icon: School, pastel: 'bg-violet-100 text-violet-700' },
            { title: 'Justificatifs', icon: FileText, pastel: 'bg-orange-100 text-orange-700' },
        ],
        [],
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [stepError, setStepError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<any>({
        type_inscription: 'nouvelle', eleve_id: '', nom: '', prenoms: '', sexe: '', date_naissance: '', lieu_naissance: '', nationalite: 'Ivoirienne', reference_extrait: '', photo: null,
        mode_tuteur: 'create', parent_tuteur_id: '', nom_tuteur: '', prenoms_tuteur: '', telephone_tuteur: '', email_tuteur: '', adresse_tuteur: '', lien_parente: '',
        nom_urgence: '', telephone_urgence: '', lien_urgence: '', adresse_urgence: '',
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
            if ([data.nom_urgence, data.telephone_urgence, data.lien_urgence].some((v) => !String(v || '').trim())) return setStepError('Complétez les informations de contact d’urgence.'), false;
        }
        if (currentStep === 2 && (!data.annee_scolaire_id || !data.classe_id)) return setStepError('Sélectionnez une année scolaire et une classe.'), false;
        setStepError(null);
        return true;
    };

    return (
        <AppLayout title="Nouvelle inscription">
            <Head title="Nouvelle inscription" />
            <div className="space-y-6 bg-slate-50 p-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900">Créer une inscription</h1>
                    <p className="text-sm text-slate-500">Enregistrez un nouvel élève et affectez-le à une classe.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-4">
                        {steps.map((step, index) => {
                            const active = currentStep === index;
                            const Icon = step.icon;
                            return <button key={step.title} type="button" onClick={() => setCurrentStep(index)} className={`relative rounded-xl border p-3 text-left ${active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active ? 'bg-blue-600 text-white' : step.pastel}`}>{index + 1}</span>
                                    <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-600'}`}>{step.title}</span></div>
                                </div>
                                {active ? <span className="absolute inset-x-3 -bottom-px h-0.5 bg-blue-600" /> : null}
                            </button>;
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
                    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
                        <div className="border-b border-slate-200 bg-white px-6 py-5"><h2 className="text-xl font-bold text-slate-900">{steps[currentStep].title}</h2></div>
                        <CardContent className="space-y-6 p-6">
                            {currentStep === 0 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{/* identity */}
                                <div><Label className="text-sm font-medium text-slate-800">Type d'inscription <span className="text-red-500">*</span></Label><Select value={data.type_inscription} onValueChange={(v) => setData('type_inscription', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nouvelle">Nouvelle inscription</SelectItem><SelectItem value="reinscription">Réinscription</SelectItem></SelectContent></Select></div>
                                {data.type_inscription === 'reinscription' ? <div><Label className="text-sm font-medium text-slate-800">Élève existant <span className="text-red-500">*</span></Label><Select value={data.eleve_id || 'none'} onValueChange={(v) => setData('eleve_id', v === 'none' ? '' : v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{eleves.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.matricule} - {e.nom} {e.prenoms}</SelectItem>)}</SelectContent></Select></div> : <>
                                    <div><Label className="text-sm font-medium text-slate-800">Nom <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Nom de l'élève" value={data.nom} onChange={(e) => setData('nom', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Prénoms <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Prénoms de l'élève" value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Sexe <span className="text-red-500">*</span></Label><Select value={data.sexe || 'none'} onValueChange={(v) => setData('sexe', v === 'none' ? '' : v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent></Select></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Date de naissance <span className="text-red-500">*</span></Label><Input className={inputClass} type="date" value={data.date_naissance} onChange={(e) => setData('date_naissance', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Lieu de naissance <span className="text-red-500">*</span></Label><Input className={inputClass} placeholder="Lieu de naissance" value={data.lieu_naissance} onChange={(e) => setData('lieu_naissance', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Nationalité <span className="text-red-500">*</span></Label><Input className={inputClass} value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Référence extrait</Label><Input className={inputClass} placeholder="Référence de l'extrait de naissance" value={data.reference_extrait} onChange={(e) => setData('reference_extrait', e.target.value)} /></div>
                                    <div><Label className="text-sm font-medium text-slate-800">Photo</Label><Input className={inputClass} type="file" accept="image/*" onChange={(e) => setData('photo', e.target.files?.[0] ?? null)} /></div>
                                </>}
                            </div>}

                            {currentStep === 1 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{/* contacts */}
                                <div><Label>Mode responsable</Label><Select value={data.mode_tuteur} onValueChange={(v) => setData('mode_tuteur', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="create">Créer</SelectItem><SelectItem value="attach">Rattacher</SelectItem><SelectItem value="replace">Remplacer</SelectItem></SelectContent></Select></div>
                                {data.mode_tuteur === 'attach' ? <div><Label>Responsable existant</Label><Select value={data.parent_tuteur_id || 'none'} onValueChange={(v) => setData('parent_tuteur_id', v === 'none' ? '' : v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{parents.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nom} {p.prenoms} ({p.telephone_1})</SelectItem>)}</SelectContent></Select></div> : <>
                                    <div><Label>Responsable légal *</Label><Input className={inputClass} value={data.nom_tuteur} onChange={(e) => setData('nom_tuteur', e.target.value)} /></div><div><Label>Prénoms *</Label><Input className={inputClass} value={data.prenoms_tuteur} onChange={(e) => setData('prenoms_tuteur', e.target.value)} /></div>
                                    <div><Label>Téléphone responsable *</Label><Input className={inputClass} value={data.telephone_tuteur} onChange={(e) => setData('telephone_tuteur', e.target.value)} /></div><div><Label>Adresse responsable</Label><Input className={inputClass} value={data.adresse_tuteur} onChange={(e) => setData('adresse_tuteur', e.target.value)} /></div>
                                </>}
                                <div><Label>Contact d'urgence *</Label><Input className={inputClass} value={data.nom_urgence} onChange={(e) => setData('nom_urgence', e.target.value)} /></div><div><Label>Téléphone urgence *</Label><Input className={inputClass} value={data.telephone_urgence} onChange={(e) => setData('telephone_urgence', e.target.value)} /></div>
                                <div><Label>Lien urgence *</Label><Input className={inputClass} value={data.lien_urgence} onChange={(e) => setData('lien_urgence', e.target.value)} /></div><div><Label>Adresse urgence</Label><Input className={inputClass} value={data.adresse_urgence} onChange={(e) => setData('adresse_urgence', e.target.value)} /></div>
                            </div>}

                            {currentStep === 2 && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div><Label>Année scolaire *</Label><Select value={data.annee_scolaire_id || 'none'} onValueChange={(v) => setData('annee_scolaire_id', v === 'none' ? '' : v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{annees.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Classe *</Label><Select value={data.classe_id || 'none'} onValueChange={(v) => setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Statut inscription *</Label><Select value={data.statut} onValueChange={(v) => setData('statut', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inscrit">Inscrit</SelectItem><SelectItem value="transfere">Transféré</SelectItem><SelectItem value="abandonne">Abandonné</SelectItem></SelectContent></Select></div>
                                <div><Label>Date inscription *</Label><Input className={inputClass} type="date" value={data.date_inscription} onChange={(e) => setData('date_inscription', e.target.value)} /></div>
                            </div>}

                            {currentStep === 3 && <div className="space-y-4">{data.documents.map((doc: any, idx: number) => <div key={idx} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3"><Input className={inputClass} placeholder="Libellé" value={doc.libelle} onChange={(e) => { const n=[...data.documents]; n[idx]={...doc,libelle:e.target.value}; setData('documents', n);} } /><Input className={inputClass} type="file" onChange={(e)=>{const n=[...data.documents];n[idx]={...doc,fichier:e.target.files?.[0]??null};setData('documents',n);}} /><Textarea placeholder="Description" value={doc.description} onChange={(e)=>{const n=[...data.documents];n[idx]={...doc,description:e.target.value};setData('documents',n);}} /></div>)}<Button type="button" variant="outline" onClick={() => setData('documents', [...data.documents, { libelle: '', description: '', fichier: null }])}>Ajouter un document</Button></div>}

                            {stepError ? <FeedbackAlert type="error" title="Vérification étape" message={stepError} /> : null}
                            {Object.keys(errors).length > 0 ? <FeedbackAlert type="error" title="Erreurs de validation" message={Object.entries(errors).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')} /> : null}
                        </CardContent>
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                            <Button type="button" variant="outline" className="h-10 rounded-lg border-slate-200" onClick={() => currentStep === 0 ? window.history.back() : setCurrentStep(currentStep - 1)}>Annuler</Button>
                            {currentStep === steps.length - 1 ? <Button type="button" className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800" disabled={processing} onClick={() => post(route('inscriptions.store'), { forceFormData: true })}>{processing ? 'Création en cours...' : "Créer l'inscription"}</Button> : <Button type="button" className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800" onClick={() => validateCurrentStep() && setCurrentStep(currentStep + 1)}>Suivant <ChevronRight className="ml-1 h-4 w-4" /></Button>}
                        </div>
                    </Card>

                    <Card className="h-fit rounded-2xl border-slate-200 p-5 shadow-sm xl:sticky xl:top-6">
                        <div className="mb-4 flex items-center gap-2 text-slate-900"><FileText className="h-4 w-4 text-blue-600" /><h3 className="font-semibold">Résumé ERP</h3></div>
                        <div className="space-y-4 text-sm">
                            <div><p className="mb-2 font-medium text-slate-900">Informations générales</p><p className="flex justify-between">Type <Badge className="bg-blue-100 text-blue-700">{data.type_inscription === 'nouvelle' ? 'Nouvelle inscription' : 'Réinscription'}</Badge></p><p className="mt-1 flex justify-between"><span>Date de création</span><span>{new Date().toLocaleDateString('fr-FR')}</span></p><p className="mt-1 flex justify-between">Statut <Badge className="bg-orange-100 text-orange-700">En cours</Badge></p></div>
                            <div><p className="mb-2 font-medium text-slate-900">Élève</p><p>Nom complet: {(data.nom + ' ' + data.prenoms).trim() || 'Non renseigné'}</p><p>Date de naissance: {formatDisplayDate(data.date_naissance)}</p><p>Sexe: {data.sexe || 'Non renseigné'}</p><p>Nationalité: {data.nationalite || 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900">Affectation scolaire</p><p>Classe: {classes.find((c) => String(c.id) === data.classe_id)?.nom ?? 'Non sélectionnée'}</p><p>Année scolaire: {annees.find((a) => String(a.id) === data.annee_scolaire_id)?.libelle ?? 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900">Responsable</p><p>Responsable légal: {data.nom_tuteur || 'Non renseigné'}</p><p>Contact: {data.telephone_tuteur || 'Non renseigné'}</p></div>
                            <div><p className="mb-2 font-medium text-slate-900">Documents</p><p className="flex items-center gap-2">Documents ajoutés <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2">{data.documents.filter((doc: any) => doc.fichier).length}</span></p></div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-slate-600"><p className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 text-blue-600" />Les informations du résumé se mettent à jour automatiquement au fur et à mesure.</p></div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
