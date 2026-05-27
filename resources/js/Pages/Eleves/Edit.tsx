import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Save } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Checkbox } from '@/Components/ui/checkbox';
import type { Classe, Eleve, Niveau } from '@/types/eleve';

type Props = { eleve: Eleve; classes: Classe[]; niveaux: Niveau[] };

export default function ElevesEdit({ eleve, classes, niveaux }: Props) {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        eleve.photo ? `/storage/${eleve.photo}` : null,
    );
    const [sameWhatsapp, setSameWhatsapp] = useState(false);

    const parent = eleve.parentsTuteurs?.find((p) => p.pivot?.est_principal) ?? eleve.parentsTuteurs?.[0] ?? null;

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nom: eleve.nom ?? '',
        prenoms: eleve.prenoms ?? '',
        date_naissance: eleve.date_naissance ?? '',
        lieu_naissance: eleve.lieu_naissance ?? '',
        pays_naissance: eleve.pays_naissance ?? "Côte d'Ivoire",
        sexe: eleve.sexe ?? '',
        nationalite: eleve.nationalite ?? 'Ivoirienne',
        situation_familiale: eleve.situation_familiale ?? '',
        est_boursier: eleve.est_boursier ?? false,
        extrait_naissance_numero: eleve.extrait_naissance_numero ?? '',
        photo: null as File | null,
        parent_nom: parent?.nom ?? '',
        parent_prenoms: parent?.prenoms ?? '',
        parent_lien: parent?.lien ?? '',
        parent_profession: parent?.profession ?? '',
        parent_telephone_1: parent?.telephone_1 ?? '',
        parent_telephone_2: parent?.telephone_2 ?? '',
        parent_whatsapp: parent?.whatsapp ?? '',
        parent_email: parent?.email ?? '',
        parent_adresse_quartier: parent?.adresse_quartier ?? '',
        parent_est_payeur: parent?.est_payeur ?? true,
        parent_can_portal_access: parent?.can_portal_access ?? false,
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

    const submit = () => {
        post(route('eleves.update', eleve.id), {
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
                },
            },
        });
    };

    return (
        <AppLayout title={`Modifier — ${eleve.nom} ${eleve.prenoms}`}>
            <Head title={`Modifier ${eleve.nom}`} />
            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800">
                            Modifier l'élève
                        </h1>
                        <p className="text-sm text-gray-500">
                            Matricule : <span className="font-mono font-medium">{eleve.matricule}</span>
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Retour
                    </Button>
                </div>

                {/* Stepper */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="mx-auto flex max-w-xl items-center justify-between">
                        {(['Infos élève', 'Parent/Tuteur'] as const).map((label, idx) => {
                            const step = (idx + 1) as 1 | 2;
                            const done = currentStep > step;
                            const active = currentStep === step;
                            return (
                                <div key={label} className="flex flex-1 items-center">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${done ? 'bg-green-500 text-white' : active ? 'bg-[#1a56a0] text-white' : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        {done ? <Check className="h-4 w-4" /> : step}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                                    {step < 2 ? <div className="mx-3 h-0.5 flex-1 bg-gray-200" /> : null}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Étape 1 : Identité */}
                {currentStep === 1 ? (
                    <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6">
                        <h2 className="font-medium text-gray-800">Identité</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Input
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value.toUpperCase())}
                                    placeholder="Nom"
                                />
                                {errors.nom ? <p className="mt-1 text-xs text-red-500">{errors.nom}</p> : null}
                            </div>
                            <div>
                                <Input
                                    value={data.prenoms}
                                    onChange={(e) => setData('prenoms', e.target.value)}
                                    placeholder="Prénoms"
                                />
                                {errors.prenoms ? <p className="mt-1 text-xs text-red-500">{errors.prenoms}</p> : null}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className={`rounded-lg border p-3 text-sm ${data.sexe === 'M' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                onClick={() => setData('sexe', 'M')}
                            >
                                Garçon
                            </button>
                            <button
                                type="button"
                                className={`rounded-lg border p-3 text-sm ${data.sexe === 'F' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
                                onClick={() => setData('sexe', 'F')}
                            >
                                Fille
                            </button>
                        </div>
                        {errors.sexe ? <p className="text-xs text-red-500">{errors.sexe}</p> : null}

                        <h2 className="font-medium text-gray-800">Naissance</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Input
                                    type="date"
                                    value={data.date_naissance}
                                    onChange={(e) => setData('date_naissance', e.target.value)}
                                />
                                {age !== null ? <p className="text-xs text-gray-500">({age} ans)</p> : null}
                                {errors.date_naissance ? <p className="text-xs text-red-500">{errors.date_naissance}</p> : null}
                            </div>
                            <div>
                                <Input
                                    value={data.lieu_naissance}
                                    onChange={(e) => setData('lieu_naissance', e.target.value)}
                                    placeholder="Lieu de naissance"
                                />
                                {errors.lieu_naissance ? <p className="text-xs text-red-500">{errors.lieu_naissance}</p> : null}
                            </div>
                            <Input
                                value={data.pays_naissance}
                                onChange={(e) => setData('pays_naissance', e.target.value)}
                                placeholder="Pays de naissance"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                value={data.nationalite}
                                onChange={(e) => setData('nationalite', e.target.value)}
                                placeholder="Nationalité"
                            />
                            <Select
                                value={data.situation_familiale || 'none'}
                                onValueChange={(value) => setData('situation_familiale', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Situation familiale" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sélectionner</SelectItem>
                                    <SelectItem value="parents_ensemble">Parents ensemble</SelectItem>
                                    <SelectItem value="divorces">Divorcés</SelectItem>
                                    <SelectItem value="orphelin_partiel">Orphelin partiel</SelectItem>
                                    <SelectItem value="orphelin_total">Orphelin total</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <Input
                                value={data.extrait_naissance_numero}
                                onChange={(e) => setData('extrait_naissance_numero', e.target.value)}
                                placeholder="Numéro extrait de naissance"
                            />
                            <div className="flex shrink-0 items-center gap-2">
                                <Switch
                                    checked={data.est_boursier}
                                    onCheckedChange={(checked) => setData('est_boursier', checked)}
                                />
                                <span className="text-sm">Boursier MENA</span>
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="rounded-lg border border-dashed p-4">
                            <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-gray-500">
                                <ImagePlus className="h-6 w-6" />
                                {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                                <input
                                    className="hidden"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setData('photo', file);
                                        if (file) setPhotoPreview(URL.createObjectURL(file));
                                    }}
                                />
                            </label>
                            {photoPreview ? (
                                <div className="mt-3 flex items-center gap-3">
                                    <img src={photoPreview} className="h-24 w-24 rounded object-cover" alt="Photo" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPhotoPreview(null);
                                            setData('photo', null);
                                        }}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-end">
                            <Button className="bg-[#1a56a0]" onClick={() => setCurrentStep(2)}>
                                Suivant <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Étape 2 : Parent/Tuteur */}
                {currentStep === 2 ? (
                    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6">
                        <h2 className="font-medium text-gray-800">Parent / Tuteur principal</h2>

                        <Select
                            value={data.parent_lien || 'none'}
                            onValueChange={(value) => setData('parent_lien', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Lien avec l'élève" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sélectionner</SelectItem>
                                <SelectItem value="pere">Père</SelectItem>
                                <SelectItem value="mere">Mère</SelectItem>
                                <SelectItem value="tuteur">Tuteur</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                value={data.parent_nom}
                                onChange={(e) => setData('parent_nom', e.target.value.toUpperCase())}
                                placeholder="Nom du parent"
                            />
                            <Input
                                value={data.parent_prenoms}
                                onChange={(e) => setData('parent_prenoms', e.target.value)}
                                placeholder="Prénoms du parent"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                value={data.parent_profession}
                                onChange={(e) => setData('parent_profession', e.target.value)}
                                placeholder="Profession"
                            />
                            <div className="flex items-center rounded-lg border px-3">
                                <span className="mr-2 text-sm text-gray-400">+225</span>
                                <Input
                                    className="border-none shadow-none"
                                    value={data.parent_telephone_1}
                                    onChange={(e) => {
                                        setData('parent_telephone_1', e.target.value);
                                        if (sameWhatsapp) setData('parent_whatsapp', e.target.value);
                                    }}
                                    placeholder="Téléphone 1"
                                />
                            </div>
                        </div>
                        {errors['parent.telephone_1'] ? (
                            <p className="text-xs text-red-500">{errors['parent.telephone_1']}</p>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                value={data.parent_telephone_2}
                                onChange={(e) => setData('parent_telephone_2', e.target.value)}
                                placeholder="Téléphone 2"
                            />
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Checkbox
                                        checked={sameWhatsapp}
                                        onCheckedChange={(checked) => {
                                            const enabled = Boolean(checked);
                                            setSameWhatsapp(enabled);
                                            if (enabled) setData('parent_whatsapp', data.parent_telephone_1);
                                        }}
                                    />
                                    <span className="text-sm">Même numéro que téléphone 1</span>
                                </div>
                                <Input
                                    disabled={sameWhatsapp}
                                    value={data.parent_whatsapp}
                                    onChange={(e) => setData('parent_whatsapp', e.target.value)}
                                    placeholder="WhatsApp"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                value={data.parent_email}
                                onChange={(e) => setData('parent_email', e.target.value)}
                                placeholder="Email"
                            />
                            <Input
                                value={data.parent_adresse_quartier}
                                onChange={(e) => setData('parent_adresse_quartier', e.target.value)}
                                placeholder="Quartier / Adresse"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={data.parent_can_portal_access}
                                    onCheckedChange={(checked) => setData('parent_can_portal_access', checked)}
                                />
                                <span className="text-sm">Accès portail parent</span>
                            </div>
                            {data.parent_can_portal_access ? (
                                <p className="text-xs text-blue-600">
                                    Le parent pourra consulter les notes en ligne
                                </p>
                            ) : null}
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                            </Button>
                            <Button
                                className="bg-[#1a56a0]"
                                disabled={processing}
                                onClick={submit}
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}