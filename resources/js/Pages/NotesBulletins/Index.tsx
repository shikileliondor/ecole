import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { useMemo, useState } from 'react';

type Item = { id: number; [key: string]: unknown };

type Props = {
    periodes: Array<Item & { libelle: string }>;
    classes: Array<Item & { nom: string }>;
    matieres: Array<Item & { libelle: string; coefficient: number }>;
    configEvaluation: Record<string, unknown>;
    compositions: Array<
        Item & {
            libelle: string;
            type: 'simple' | 'passage';
            bareme: number;
            seuil_validation: number;
            regle_moyenne: 'simple' | 'ponderee_coefficient';
            mode_arrondi: string;
            appreciations_auto?: string;
            periode_academique?: { libelle: string };
            notes: Array<
                Item & {
                    classe_id: number;
                    matiere_id: number;
                    moyenne: number;
                    classe?: { nom: string };
                    matiere?: { libelle: string; coefficient: number };
                }
            >;
        }
    >;
};

const roundByMode = (value: number, mode: string) => {
    switch (mode) {
        case 'unite_inferieure':
            return Math.floor(value);
        case 'unite_superieure':
            return Math.ceil(value);
        case 'demi_point':
            return Math.round(value * 2) / 2;
        case 'dixieme_inferieur':
            return Math.floor(value * 10) / 10;
        case 'dixieme_superieur':
            return Math.ceil(value * 10) / 10;
        default:
            return value;
    }
};

export default function NotesBulletinsIndex({ periodes, classes, matieres, configEvaluation, compositions }: Props) {
    const [activeCompositionId, setActiveCompositionId] = useState<number | null>(compositions[0]?.id ?? null);
    const [activeClasseId, setActiveClasseId] = useState<number | null>(classes[0]?.id ?? null);

    const compositionForm = useForm({
        periode_academique_id: String(periodes[0]?.id ?? ''),
        libelle: '',
        type: 'simple',
        bareme: Number(configEvaluation.bareme_principal ?? 20),
        seuil_validation: String(configEvaluation.seuil_validation ?? '10'),
        regle_moyenne: String(configEvaluation.regle_moyenne ?? 'ponderee_coefficient'),
        mode_arrondi: String(configEvaluation.mode_arrondi ?? 'dixieme_superieur'),
        appreciations_auto: String(configEvaluation.appreciations_auto ?? ''),
    });

    const notesForm = useForm({
        classe_id: String(activeClasseId ?? ''),
        notes: matieres.map((matiere) => ({ matiere_id: matiere.id, moyenne: '' })),
    });

    const activeComposition = useMemo(
        () => compositions.find((composition) => composition.id === activeCompositionId) ?? null,
        [activeCompositionId, compositions],
    );

    const classeNotes = useMemo(() => {
        if (!activeComposition || !activeClasseId) return [];
        return activeComposition.notes.filter((item) => item.classe_id === activeClasseId);
    }, [activeClasseId, activeComposition]);

    const moyenneGenerale = useMemo(() => {
        if (!activeComposition || classeNotes.length === 0) return 0;
        let total = 0;
        let denominateur = 0;
        classeNotes.forEach((note) => {
            const coefficient = Number(note.matiere?.coefficient ?? 1);
            if (activeComposition.regle_moyenne === 'ponderee_coefficient') {
                total += Number(note.moyenne) * coefficient;
                denominateur += coefficient;
            } else {
                total += Number(note.moyenne);
                denominateur += 1;
            }
        });
        return roundByMode(total / Math.max(denominateur, 1), activeComposition.mode_arrondi);
    }, [activeComposition, classeNotes]);

    return (
        <AppLayout title="Notes & Bulletins">
            <Head title="Notes & Bulletins" />

            <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <h1 className="text-2xl font-bold text-slate-900">Notes & Bulletins</h1>
                    <p className="mt-1 text-sm text-slate-600">Créez des compositions par période, saisissez les moyennes par classe et exportez les bulletins.</p>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="text-lg font-semibold text-slate-900">Nouvelle composition</h2>
                    <form
                        className="mt-4 grid gap-3 md:grid-cols-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            compositionForm.post(route('notes-bulletins.compositions.store'));
                        }}
                    >
                        <select className="rounded-md border border-slate-200 p-2" value={compositionForm.data.periode_academique_id} onChange={(e) => compositionForm.setData('periode_academique_id', e.target.value)}>
                            {periodes.map((periode) => (
                                <option key={periode.id} value={String(periode.id)}>{periode.libelle}</option>
                            ))}
                        </select>
                        <Input placeholder="Libellé composition" value={compositionForm.data.libelle} onChange={(e) => compositionForm.setData('libelle', e.target.value)} />
                        <select className="rounded-md border border-slate-200 p-2" value={compositionForm.data.type} onChange={(e) => compositionForm.setData('type', e.target.value as 'simple' | 'passage')}>
                            <option value="simple">Simple</option>
                            <option value="passage">Passage</option>
                        </select>
                        <Input type="number" min={1} max={100} value={compositionForm.data.bareme} onChange={(e) => compositionForm.setData('bareme', Number(e.target.value))} placeholder="Barème" />
                        <Input value={compositionForm.data.seuil_validation} onChange={(e) => compositionForm.setData('seuil_validation', e.target.value)} placeholder="Seuil de validation" />
                        <select className="rounded-md border border-slate-200 p-2" value={compositionForm.data.regle_moyenne} onChange={(e) => compositionForm.setData('regle_moyenne', e.target.value)}>
                            <option value="simple">Moyenne simple</option>
                            <option value="ponderee_coefficient">Moyenne pondérée</option>
                        </select>
                        <select className="rounded-md border border-slate-200 p-2" value={compositionForm.data.mode_arrondi} onChange={(e) => compositionForm.setData('mode_arrondi', e.target.value)}>
                            <option value="unite_inferieure">Unité inférieure</option>
                            <option value="unite_superieure">Unité supérieure</option>
                            <option value="demi_point">Demi-point</option>
                            <option value="dixieme_inferieur">Dixième inférieur</option>
                            <option value="dixieme_superieur">Dixième supérieur</option>
                        </select>
                        <Textarea className="md:col-span-2" rows={4} placeholder="Appréciations automatiques" value={compositionForm.data.appreciations_auto} onChange={(e) => compositionForm.setData('appreciations_auto', e.target.value)} />
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit">Enregistrer la composition</Button>
                        </div>
                    </form>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="grid gap-3 md:grid-cols-3">
                        <select className="rounded-md border border-slate-200 p-2" value={activeCompositionId ?? ''} onChange={(e) => setActiveCompositionId(Number(e.target.value))}>
                            {compositions.map((composition) => (
                                <option key={composition.id} value={composition.id}>{composition.libelle} ({composition.type})</option>
                            ))}
                        </select>
                        <select className="rounded-md border border-slate-200 p-2" value={activeClasseId ?? ''} onChange={(e) => { const value = Number(e.target.value); setActiveClasseId(value); notesForm.setData('classe_id', String(value)); }}>
                            {classes.map((classe) => (
                                <option key={classe.id} value={classe.id}>{classe.nom}</option>
                            ))}
                        </select>
                        {activeCompositionId && activeClasseId ? (
                            <a href={route('notes-bulletins.compositions.export', { composition: activeCompositionId, classe_id: activeClasseId })} className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Exporter CSV</a>
                        ) : null}
                    </div>

                    {activeComposition ? (
                        <form
                            className="mt-4 space-y-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!activeCompositionId) return;
                                notesForm.post(route('notes-bulletins.compositions.notes.store', activeCompositionId));
                            }}
                        >
                            <div className="grid gap-2 md:grid-cols-3">
                                {matieres.map((matiere, index) => (
                                    <div key={matiere.id} className="rounded-lg border border-slate-200 p-3">
                                        <p className="text-sm font-medium text-slate-800">{matiere.libelle}</p>
                                        <p className="text-xs text-slate-500">Coef {matiere.coefficient}</p>
                                        <Input
                                            className="mt-2"
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            max={activeComposition.bareme}
                                            value={String(notesForm.data.notes[index].moyenne)}
                                            onChange={(e) =>
                                                notesForm.setData(
                                                    'notes',
                                                    notesForm.data.notes.map((note, noteIndex) =>
                                                        noteIndex === index ? { ...note, moyenne: e.target.value } : note,
                                                    ),
                                                )
                                            }
                                            placeholder={`/ ${activeComposition.bareme}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Enregistrer les notes</Button>
                            </div>
                        </form>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">Aucune composition disponible.</p>
                    )}
                </section>

                {activeComposition && activeClasseId ? (
                    <section className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="text-lg font-semibold text-slate-900">Résumé calculé</h3>
                        <p className="mt-2 text-sm text-slate-700">Moyenne générale: <strong>{moyenneGenerale.toFixed(2)} / {activeComposition.bareme}</strong></p>
                        <p className="text-sm text-slate-700">Décision: <strong>{activeComposition.type === 'passage' ? (moyenneGenerale >= Number(activeComposition.seuil_validation) ? 'Passe' : 'Redouble') : 'Simple'}</strong></p>
                    </section>
                ) : null}
            </div>
        </AppLayout>
    );
}
