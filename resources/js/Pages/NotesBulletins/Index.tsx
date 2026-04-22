import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';

type Item = { id: number; [key: string]: unknown };

type InscriptionRow = {
    id: number;
    classe_id: number;
    numero_ordre?: number | null;
    eleve?: { nom?: string; prenoms?: string };
};

type Props = {
    periodes: Array<Item & { libelle: string }>;
    classes: Array<Item & { nom: string }>;
    matieres: Array<Item & { libelle: string; coefficient: number }>;
    configEvaluation: Record<string, unknown>;
    inscriptions: InscriptionRow[];
    noteMap: Record<string, Record<string, Record<string, string>>>;
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

export default function NotesBulletinsIndex({ periodes, classes, matieres, configEvaluation, compositions, inscriptions, noteMap }: Props) {
    const [activeCompositionId, setActiveCompositionId] = useState<number | null>(compositions[0]?.id ?? null);
    const [activeClasseId, setActiveClasseId] = useState<number | null>(classes[0]?.id ?? null);
    const [activeMatiereId, setActiveMatiereId] = useState<number | null>(matieres[0]?.id ?? null);
    const [classeQuery, setClasseQuery] = useState<string>(classes[0]?.nom ?? '');
    const [compositionQuery, setCompositionQuery] = useState<string>(compositions[0] ? `${compositions[0].libelle} (${compositions[0].type})` : '');
    const [matiereQuery, setMatiereQuery] = useState<string>(matieres[0]?.libelle ?? '');

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

    const notesElevesForm = useForm({
        classe_id: String(activeClasseId ?? ''),
        matiere_id: String(activeMatiereId ?? ''),
        notes: [] as Array<{ inscription_id: number; note: string }>,
    });

    const activeComposition = useMemo(
        () => compositions.find((composition) => composition.id === activeCompositionId) ?? null,
        [activeCompositionId, compositions],
    );

    const resolveIdFromQuery = <T extends Item>(options: T[], query: string, getLabel: (item: T) => string): number | null => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        if (!normalizedQuery) return options[0]?.id ?? null;
        const exactMatch = options.find((item) => getLabel(item).toLocaleLowerCase() === normalizedQuery);
        if (exactMatch) return exactMatch.id;
        const startsWithMatch = options.find((item) => getLabel(item).toLocaleLowerCase().startsWith(normalizedQuery));
        if (startsWithMatch) return startsWithMatch.id;
        const includesMatch = options.find((item) => getLabel(item).toLocaleLowerCase().includes(normalizedQuery));
        return includesMatch?.id ?? null;
    };

    const classeNotes = useMemo(() => {
        if (!activeComposition || !activeClasseId) return [];
        return activeComposition.notes.filter((item) => item.classe_id === activeClasseId);
    }, [activeClasseId, activeComposition]);

    const elevesByClasse = useMemo(() => {
        if (!activeClasseId) return [];
        return inscriptions
            .filter((inscription) => inscription.classe_id === activeClasseId)
            .sort((a, b) => Number(a.numero_ordre ?? 0) - Number(b.numero_ordre ?? 0));
    }, [activeClasseId, inscriptions]);

    useEffect(() => {
        const compositionKey = String(activeCompositionId ?? '');
        const matiereKey = String(activeMatiereId ?? '');
        const mapped = noteMap[compositionKey]?.[matiereKey] ?? {};

        notesElevesForm.setData((current) => ({
            ...current,
            classe_id: String(activeClasseId ?? ''),
            matiere_id: String(activeMatiereId ?? ''),
            notes: elevesByClasse.map((inscription) => ({
                inscription_id: inscription.id,
                note: mapped[String(inscription.id)] ?? '',
            })),
        }));
    }, [activeClasseId, activeCompositionId, activeMatiereId, elevesByClasse, noteMap]);

    useEffect(() => {
        const selectedClasse = classes.find((classe) => classe.id === activeClasseId);
        if (selectedClasse) setClasseQuery(selectedClasse.nom);
    }, [activeClasseId, classes]);

    useEffect(() => {
        const selectedComposition = compositions.find((composition) => composition.id === activeCompositionId);
        if (selectedComposition) setCompositionQuery(`${selectedComposition.libelle} (${selectedComposition.type})`);
    }, [activeCompositionId, compositions]);

    useEffect(() => {
        const selectedMatiere = matieres.find((matiere) => matiere.id === activeMatiereId);
        if (selectedMatiere) setMatiereQuery(selectedMatiere.libelle);
    }, [activeMatiereId, matieres]);

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
                    <p className="mt-1 text-sm text-slate-600">Créez des compositions par période, puis sélectionnez classe, composition et matière pour saisir les notes par élève.</p>
                </section>
{/* 
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
                </section> */}

                <section className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Classe</p>
                            <Input
                                list="classes-autoselect"
                                className="mt-2"
                                value={classeQuery}
                                onChange={(e) => {
                                    const nextQuery = e.target.value;
                                    setClasseQuery(nextQuery);
                                    const nextId = resolveIdFromQuery(classes, nextQuery, (classe) => classe.nom);
                                    if (nextId) setActiveClasseId(nextId);
                                }}
                            />
                            <datalist id="classes-autoselect">
                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.nom} />
                                ))}
                            </datalist>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Composition</p>
                            <Input
                                list="compositions-autoselect"
                                className="mt-2"
                                value={compositionQuery}
                                onChange={(e) => {
                                    const nextQuery = e.target.value;
                                    setCompositionQuery(nextQuery);
                                    const nextId = resolveIdFromQuery(compositions, nextQuery, (composition) => `${composition.libelle} (${composition.type})`);
                                    if (nextId) setActiveCompositionId(nextId);
                                }}
                            />
                            <datalist id="compositions-autoselect">
                                {compositions.map((composition) => (
                                    <option key={composition.id} value={`${composition.libelle} (${composition.type})`} />
                                ))}
                            </datalist>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Matière</p>
                            <Input
                                list="matieres-autoselect"
                                className="mt-2"
                                value={matiereQuery}
                                onChange={(e) => {
                                    const nextQuery = e.target.value;
                                    setMatiereQuery(nextQuery);
                                    const nextId = resolveIdFromQuery(matieres, nextQuery, (matiere) => matiere.libelle);
                                    if (nextId) setActiveMatiereId(nextId);
                                }}
                            />
                            <datalist id="matieres-autoselect">
                                {matieres.map((matiere) => (
                                    <option key={matiere.id} value={matiere.libelle} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {activeCompositionId && activeClasseId ? (
                        <a href={route('notes-bulletins.compositions.export', { composition: activeCompositionId, classe_id: activeClasseId })} className="mt-3 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">Exporter CSV</a>
                    ) : null}

                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!activeCompositionId) return;
                            notesElevesForm.post(route('notes-bulletins.compositions.notes-eleves.store', activeCompositionId));
                        }}
                    >
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Élève</th>
                                        <th className="px-4 py-2 text-left">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notesElevesForm.data.notes.map((entry, index) => {
                                        const eleve = elevesByClasse.find((inscription) => inscription.id === entry.inscription_id)?.eleve;
                                        return (
                                            <tr key={entry.inscription_id} className="border-t border-slate-100">
                                                <td className="px-4 py-2 font-medium text-slate-800">{eleve?.prenoms} {eleve?.nom}</td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        max={activeComposition?.bareme ?? 20}
                                                        value={entry.note}
                                                        onChange={(e) => notesElevesForm.setData('notes', notesElevesForm.data.notes.map((line, lineIndex) => lineIndex === index ? { ...line, note: e.target.value } : line))}
                                                        placeholder={`/ ${activeComposition?.bareme ?? 20}`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Enregistrer les notes</Button>
                        </div>
                    </form>
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
