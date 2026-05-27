import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import type { Classe } from '@/types/eleve';

interface InscriptionOption {
    id: number;
    eleve: { id: number; nom: string; prenoms: string; matricule: string };
}

type Props = {
    classes: Classe[];
    inscriptions: InscriptionOption[];
    selected_classe_id: number | null;
};

export default function AbsencesCreate({ classes, inscriptions, selected_classe_id }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        inscription_id: '',
        date_absence: new Date().toISOString().split('T')[0],
        type: '' as 'matin' | 'apres_midi' | 'journee' | '',
        motif: '' as 'maladie' | 'sans_motif' | 'deces_famille' | 'autre' | '',
        est_justifiee: false,
        parent_notifie: false,
        justificatif: '',
    });

    const handleClasseChange = (classeId: string) => {
        router.get(
            route('absences.create'),
            { classe_id: classeId },
            { preserveState: true, replace: true },
        );
        setData('inscription_id', '');
    };

    return (
        <AppLayout title="Enregistrer une absence">
            <Head title="Enregistrer une absence" />
            <div className="mx-auto max-w-xl space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-800">Enregistrer une absence</h1>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> Retour
                    </Button>
                </div>

                <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-6">
                    {/* Sélection classe */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Classe</label>
                        <Select
                            value={selected_classe_id ? String(selected_classe_id) : 'none'}
                            onValueChange={(v) => handleClasseChange(v === 'none' ? '' : v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner une classe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sélectionner une classe</SelectItem>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nom} {c.niveau ? `(${c.niveau.libelle})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sélection élève */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Élève</label>
                        <Select
                            value={data.inscription_id || 'none'}
                            onValueChange={(v) => setData('inscription_id', v === 'none' ? '' : v)}
                            disabled={inscriptions.length === 0}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={inscriptions.length === 0 ? 'Sélectionner une classe d\'abord' : 'Sélectionner un élève'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sélectionner un élève</SelectItem>
                                {inscriptions.map((ins) => (
                                    <SelectItem key={ins.id} value={String(ins.id)}>
                                        {ins.eleve.nom} {ins.eleve.prenoms}
                                        <span className="ml-2 text-xs text-gray-400">({ins.eleve.matricule})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.inscription_id ? (
                            <p className="mt-1 text-xs text-red-500">{errors.inscription_id}</p>
                        ) : null}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Date d'absence</label>
                        <Input
                            type="date"
                            value={data.date_absence}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setData('date_absence', e.target.value)}
                        />
                        {errors.date_absence ? (
                            <p className="mt-1 text-xs text-red-500">{errors.date_absence}</p>
                        ) : null}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Type d'absence</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['matin', 'apres_midi', 'journee'] as const).map((t) => {
                                const labels = { matin: 'Matin', apres_midi: 'Après-midi', journee: 'Journée entière' };
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setData('type', t)}
                                        className={`rounded-lg border py-2.5 text-sm transition ${data.type === t ? 'border-[#1a56a0] bg-blue-50 text-[#1a56a0] font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        {labels[t]}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.type ? <p className="mt-1 text-xs text-red-500">{errors.type}</p> : null}
                    </div>

                    {/* Motif */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Motif</label>
                        <Select
                            value={data.motif || 'none'}
                            onValueChange={(v) => setData('motif', v === 'none' ? '' : v as typeof data.motif)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un motif" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sélectionner</SelectItem>
                                <SelectItem value="maladie">Maladie</SelectItem>
                                <SelectItem value="sans_motif">Sans motif</SelectItem>
                                <SelectItem value="deces_famille">Décès dans la famille</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.motif ? <p className="mt-1 text-xs text-red-500">{errors.motif}</p> : null}
                    </div>

                    {/* Justificatif */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Justificatif <span className="font-normal text-gray-400">(optionnel)</span>
                        </label>
                        <Input
                            value={data.justificatif}
                            onChange={(e) => setData('justificatif', e.target.value)}
                            placeholder="Certificat médical, note des parents..."
                        />
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-6 text-sm">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.est_justifiee}
                                onChange={(e) => setData('est_justifiee', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#1a56a0]"
                            />
                            <span className="text-gray-700">Absence justifiée</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.parent_notifie}
                                onChange={(e) => setData('parent_notifie', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#1a56a0]"
                            />
                            <span className="text-gray-700">Parent notifié</span>
                        </label>
                    </div>

                    {/* Bouton */}
                    <div className="flex justify-end pt-2">
                        <Button
                            className="bg-[#1a56a0]"
                            disabled={processing || !data.inscription_id || !data.type || !data.motif}
                            onClick={() => post(route('absences.store'))}
                        >
                            {processing ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Enregistrer l'absence
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}