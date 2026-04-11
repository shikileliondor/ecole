import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, UserPlus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Checkbox } from '@/Components/ui/checkbox';
import type { Classe, Niveau } from '@/types/eleve';

type Props = { classes: Classe[]; niveaux: Niveau[]; annee_active: { id: number; libelle: string } | null };

export default function ElevesCreate({ classes, niveaux, annee_active }: Props) {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [sameWhatsapp, setSameWhatsapp] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing } = useForm({
        nom: '', prenoms: '', date_naissance: '', lieu_naissance: '', pays_naissance: "Côte d'Ivoire", sexe: '', nationalite: 'Ivoirienne', situation_familiale: '', est_boursier: false,
        extrait_naissance_numero: '', photo: null as File | null,
        parent_nom: '', parent_prenoms: '', parent_lien: '', parent_profession: '', parent_telephone_1: '', parent_telephone_2: '', parent_whatsapp: '', parent_email: '', parent_adresse_quartier: 'Abidjan', parent_est_payeur: true, parent_can_portal_access: false,
        niveau_id: '', classe_id: '',
    });

    const age = useMemo(() => {
        if (!data.date_naissance) return null;
        const birth = new Date(data.date_naissance);
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
        return years;
    }, [data.date_naissance]);

    const classesFiltrees = useMemo(() => classes.filter((c) => !data.niveau_id || String(c.niveau?.id ?? '') === data.niveau_id), [classes, data.niveau_id]);
    const selectedClasse = classes.find((c) => String(c.id) === data.classe_id);
    const capacite = selectedClasse?.capacite_max ?? 0;
    const inscrits = selectedClasse?.inscriptions_count ?? 0;
    const ratio = capacite > 0 ? Math.round((inscrits / capacite) * 100) : 0;

    const validateStepOne = () => {
        const errors: Record<string, string> = {};
        ['nom', 'prenoms', 'date_naissance', 'lieu_naissance', 'sexe'].forEach((key) => {
            if (!(data as Record<string, unknown>)[key]) errors[key] = 'Champ requis';
        });
        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submit = () => {
        post(route('eleves.store'), {
            forceFormData: true,
            data: {
                ...data,
                parent: {
                    nom: data.parent_nom,
                    prenoms: data.parent_prenoms,
                    lien: data.parent_lien,
                    profession: data.parent_profession || null,
                    telephone_1: data.parent_telephone_1,
                    telephone_2: data.parent_telephone_2 || null,
                    whatsapp: data.parent_whatsapp || null,
                    email: data.parent_email || null,
                    adresse_quartier: data.parent_adresse_quartier || null,
                    est_payeur: data.parent_est_payeur,
                    can_portal_access: data.parent_can_portal_access,
                    est_contact_urgence: true,
                },
            },
        });
    };

    return (
        <AppLayout title="Nouvel élève">
            <Head title="Nouvel élève" />
            <div className="space-y-6">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="mx-auto flex max-w-3xl items-center justify-between">
                        {['Infos élève', 'Parent/Tuteur', 'Classe'].map((label, idx) => {
                            const step = (idx + 1) as 1 | 2 | 3;
                            const done = currentStep > step;
                            const active = currentStep === step;
                            return <div key={label} className="flex flex-1 items-center"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${done ? 'bg-green-500 text-white' : active ? 'bg-[#1a56a0] text-white' : 'bg-gray-200 text-gray-600'}`}>{done ? <Check className="h-4 w-4" /> : step}</div><span className="ml-2 text-sm text-gray-700">{label}</span>{step < 3 ? <div className="mx-3 h-0.5 flex-1 bg-gray-200" /> : null}</div>;
                        })}
                    </div>
                </div>

                {currentStep === 1 ? <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6">
                    <h2 className="font-medium text-gray-800">Identité</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div><Input value={data.nom} onChange={(e) => setData('nom', e.target.value.toUpperCase())} placeholder="Nom" />{localErrors.nom ? <p className="text-xs text-red-500">{localErrors.nom}</p> : null}</div>
                        <div><Input value={data.prenoms} onChange={(e) => setData('prenoms', e.target.value)} placeholder="Prénoms" />{localErrors.prenoms ? <p className="text-xs text-red-500">{localErrors.prenoms}</p> : null}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" className={`rounded-lg border p-3 ${data.sexe === 'M' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setData('sexe', 'M')}>Garçon</button>
                        <button type="button" className={`rounded-lg border p-3 ${data.sexe === 'F' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`} onClick={() => setData('sexe', 'F')}>Fille</button>
                    </div>
                    <h2 className="font-medium text-gray-800">Naissance</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div><Input type="date" value={data.date_naissance} onChange={(e) => setData('date_naissance', e.target.value)} />{age !== null ? <p className="text-xs text-gray-500">({age} ans)</p> : null}</div>
                        <Input value={data.lieu_naissance} onChange={(e) => setData('lieu_naissance', e.target.value)} placeholder="Lieu de naissance" />
                        <Input value={data.pays_naissance} onChange={(e) => setData('pays_naissance', e.target.value)} placeholder="Pays de naissance" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Input value={data.nationalite} onChange={(e) => setData('nationalite', e.target.value)} placeholder="Nationalité" />
                        <Select value={data.situation_familiale || 'none'} onValueChange={(value) => setData('situation_familiale', value === 'none' ? '' : value)}><SelectTrigger className="w-full"><SelectValue placeholder="Situation familiale" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem><SelectItem value="parents_ensemble">Parents ensemble</SelectItem><SelectItem value="divorces">Divorcés</SelectItem><SelectItem value="orphelin_partiel">Orphelin partiel</SelectItem><SelectItem value="orphelin_total">Orphelin total</SelectItem></SelectContent></Select>
                    </div>
                    <div className="flex items-center justify-between"><Input value={data.extrait_naissance_numero} onChange={(e) => setData('extrait_naissance_numero', e.target.value)} placeholder="Numéro extrait de naissance" /><div className="ml-4 flex items-center gap-2"><Switch checked={data.est_boursier} onCheckedChange={(checked) => setData('est_boursier', checked)} /><span className="text-sm">Boursier MENA</span></div></div>
                    <div className="rounded-lg border border-dashed p-4"><label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-gray-500"><ImagePlus className="h-6 w-6" />Drag & drop ou cliquer<input className="hidden" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0] ?? null; setData('photo', file); if (file) setPhotoPreview(URL.createObjectURL(file)); }} /></label>{photoPreview ? <div className="mt-3"><img src={photoPreview} className="h-24 w-24 rounded object-cover" /><Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { setPhotoPreview(null); setData('photo', null); }}>Supprimer la photo</Button></div> : null}</div>
                    <div className="flex justify-end"><Button className="bg-[#1a56a0]" onClick={() => validateStepOne() && setCurrentStep(2)}>Suivant <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
                </div> : null}

                {currentStep === 2 ? <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6">
                    <Select value={data.parent_lien || 'none'} onValueChange={(value) => setData('parent_lien', value === 'none' ? '' : value)}><SelectTrigger className="w-full"><SelectValue placeholder="Lien avec l'élève" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem><SelectItem value="pere">Père</SelectItem><SelectItem value="mere">Mère</SelectItem><SelectItem value="tuteur">Tuteur</SelectItem></SelectContent></Select>
                    <div className="grid gap-4 md:grid-cols-2"><Input value={data.parent_nom} onChange={(e) => setData('parent_nom', e.target.value.toUpperCase())} placeholder="Nom du parent" /><Input value={data.parent_prenoms} onChange={(e) => setData('parent_prenoms', e.target.value)} placeholder="Prénoms du parent" /></div>
                    <div className="grid gap-4 md:grid-cols-2"><Input value={data.parent_profession} onChange={(e) => setData('parent_profession', e.target.value)} placeholder="Profession" /><div className="flex items-center rounded-lg border px-3"><span className="mr-2 text-sm text-gray-400">+225</span><Input className="border-none shadow-none" value={data.parent_telephone_1} onChange={(e) => { setData('parent_telephone_1', e.target.value); if (sameWhatsapp) setData('parent_whatsapp', e.target.value); }} placeholder="Téléphone 1" /></div></div>
                    <div className="grid gap-4 md:grid-cols-2"><Input value={data.parent_telephone_2} onChange={(e) => setData('parent_telephone_2', e.target.value)} placeholder="Téléphone 2" /><div><div className="mb-2 flex items-center gap-2"><Checkbox checked={sameWhatsapp} onCheckedChange={(checked) => { const enabled = Boolean(checked); setSameWhatsapp(enabled); if (enabled) setData('parent_whatsapp', data.parent_telephone_1); }} /><span className="text-sm">Même numéro que téléphone 1</span></div><Input disabled={sameWhatsapp} value={data.parent_whatsapp} onChange={(e) => setData('parent_whatsapp', e.target.value)} placeholder="WhatsApp" /></div></div>
                    <div className="grid gap-4 md:grid-cols-2"><Input value={data.parent_email} onChange={(e) => setData('parent_email', e.target.value)} placeholder="Email" /><Input value={data.parent_adresse_quartier} onChange={(e) => setData('parent_adresse_quartier', e.target.value)} placeholder="Quartier / Adresse" /></div>
                    <div className="space-y-2"><div className="flex items-center gap-2"><Switch checked={data.parent_can_portal_access} onCheckedChange={(checked) => setData('parent_can_portal_access', checked)} /><span className="text-sm">Accès portail parent</span></div>{data.parent_can_portal_access ? <p className="text-xs text-blue-600">Le parent pourra consulter les notes en ligne</p> : null}<div className="flex items-center gap-2"><Switch checked={data.parent_est_payeur} onCheckedChange={(checked) => setData('parent_est_payeur', checked)} /><span className="text-sm">Contact d'urgence</span></div></div>
                    <div className="flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(1)}><ChevronLeft className="mr-2 h-4 w-4" />Précédent</Button><Button className="bg-[#1a56a0]" onClick={() => setCurrentStep(3)}>Suivant <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
                </div> : null}

                {currentStep === 3 ? <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6">
                    <h2 className="font-medium">Affectation</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Select value={data.niveau_id || 'none'} onValueChange={(value) => { setData('niveau_id', value === 'none' ? '' : value); setData('classe_id', ''); }}><SelectTrigger className="w-full"><SelectValue placeholder="Niveau" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{niveaux.map((niveau) => <SelectItem key={niveau.id} value={String(niveau.id)}>{niveau.libelle}</SelectItem>)}</SelectContent></Select>
                        <Select value={data.classe_id || 'none'} onValueChange={(value) => setData('classe_id', value === 'none' ? '' : value)}><SelectTrigger className="w-full"><SelectValue placeholder="Classe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classesFiltrees.map((classe) => <SelectItem key={classe.id} value={String(classe.id)}>{classe.nom}</SelectItem>)}</SelectContent></Select>
                    </div>
                    {selectedClasse ? <div className="rounded-xl border p-4 text-sm"><p><strong>Classe:</strong> {selectedClasse.nom}</p><p><strong>Enseignant titulaire:</strong> {selectedClasse.enseignant_titulaire?.nom_complet ?? 'Non renseigné'}</p><p><strong>Nb élèves actuels:</strong> {inscrits} / {capacite}</p><div className="mt-2 h-2 rounded-full bg-gray-100"><div className={`h-full rounded-full ${ratio > 95 ? 'bg-red-500' : ratio >= 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(ratio, 100)}%` }} /></div>{ratio > 95 ? <p className="mt-2 text-xs text-red-600">Classe presque pleine</p> : null}</div> : null}

                    <div className="rounded-xl border bg-gray-50 p-4"><h3 className="mb-3 font-medium">Récapitulatif</h3><div className="grid gap-3 md:grid-cols-2 text-sm"><div><p><strong>Élève:</strong> {data.nom} {data.prenoms}</p><p><strong>Sexe:</strong> {data.sexe || '—'}</p><p><strong>Âge:</strong> {age ?? '—'} ans</p><p><strong>Classe:</strong> {selectedClasse?.nom ?? '—'}</p></div><div><p><strong>Parent:</strong> {data.parent_nom} {data.parent_prenoms}</p><p><strong>Lien:</strong> {data.parent_lien || '—'}</p><p><strong>Téléphone:</strong> {data.parent_telephone_1 || '—'}</p><p><strong>Année:</strong> {annee_active?.libelle ?? 'Non définie'}</p></div></div></div>
                    <div className="flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(2)}><ChevronLeft className="mr-2 h-4 w-4" />Précédent</Button><Button className="bg-[#1a56a0]" disabled={processing} onClick={submit}>{processing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Inscrire l'élève</Button></div>
                </div> : null}
            </div>
        </AppLayout>
    );
}
