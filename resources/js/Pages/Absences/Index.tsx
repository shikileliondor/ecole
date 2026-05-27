import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarX, Check, ChevronLeft, ChevronRight, Download, FileSpreadsheet, FileText, FileType, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import type { Classe, PaginationLink } from '@/types/eleve';

interface AbsenceRow {
    id: number;
    date_absence: string;
    type: 'matin' | 'apres_midi' | 'journee';
    motif: string;
    est_justifiee: boolean;
    parent_notifie: boolean;
    justificatif: string | null;
    inscription: {
        id: number;
        eleve: { id: number; nom: string; prenoms: string; matricule: string };
        classe: { id: number; nom: string };
    };
    signale_par: { id: number; name: string } | null;
}

interface AbsencesPaginator {
    data: AbsenceRow[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    absences: AbsencesPaginator;
    classes: Classe[];
    filters: { classe_id?: string; date_debut?: string; date_fin?: string; est_justifiee?: string };
    stats: { total: number; justifiees: number; non_justifiees: number };
    flash?: { success?: string };
}

const TYPE_LABELS: Record<string, string> = {
    matin: 'Matin',
    apres_midi: 'Après-midi',
    journee: 'Journée',
};

const MOTIF_LABELS: Record<string, string> = {
    maladie: 'Maladie',
    sans_motif: 'Sans motif',
    deces_famille: 'Décès famille',
    autre: 'Autre',
};

function EditDialog({
    absence,
    onClose,
}: {
    absence: AbsenceRow;
    onClose: () => void;
}) {
    const { data, setData, patch, processing } = useForm({
        motif: absence.motif,
        est_justifiee: absence.est_justifiee,
        parent_notifie: absence.parent_notifie,
        justificatif: absence.justificatif ?? '',
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Modifier l'absence</h2>
                    <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                    {absence.inscription.eleve.nom} {absence.inscription.eleve.prenoms} —{' '}
                    {new Date(absence.date_absence).toLocaleDateString('fr-FR')} ({TYPE_LABELS[absence.type]})
                </p>
                <div className="space-y-4">
                    <Select value={data.motif} onValueChange={(v) => setData('motif', v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Motif" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(MOTIF_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        value={data.justificatif}
                        onChange={(e) => setData('justificatif', e.target.value)}
                        placeholder="Justificatif (optionnel)"
                    />

                    <div className="flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.est_justifiee}
                                onChange={(e) => setData('est_justifiee', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Justifiée
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.parent_notifie}
                                onChange={(e) => setData('parent_notifie', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Parent notifié
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button
                        className="bg-[#1a56a0]"
                        disabled={processing}
                        onClick={() => patch(route('absences.update', absence.id), { onSuccess: onClose })}
                    >
                        Enregistrer
                    </Button>
                </div>
            </div>
        </div>
    );
}

function buildExportUrl(routeName: string, filters: Record<string, string>): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return route(routeName) + (qs ? '?' + qs : '');
}

function ExportButtons({ filters }: { filters: Record<string, string> }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <Button variant="outline" onClick={() => setOpen((o) => !o)} className="gap-2">
                <Download size={15} /> Exporter
            </Button>
            {open ? (
                <>
                    <button className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border bg-white py-1 shadow-lg">
                        <a
                            href={buildExportUrl('absences.export.pdf', filters)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            <FileText size={14} className="text-red-500" /> Export PDF
                        </a>
                        <a
                            href={buildExportUrl('absences.export.excel', filters)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            <FileSpreadsheet size={14} className="text-green-600" /> Export Excel
                        </a>
                        <a
                            href={buildExportUrl('absences.export.word', filters)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                        >
                            <FileType size={14} className="text-blue-600" /> Export Word
                        </a>
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default function AbsencesIndex({ absences, classes, filters, stats }: PageProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash;

    const [editingAbsence, setEditingAbsence] = useState<AbsenceRow | null>(null);
    const [filterClasse, setFilterClasse] = useState(filters.classe_id ?? '');
    const [filterDateDebut, setFilterDateDebut] = useState(filters.date_debut ?? '');
    const [filterDateFin, setFilterDateFin] = useState(filters.date_fin ?? '');
    const [filterJustifiee, setFilterJustifiee] = useState(filters.est_justifiee ?? '');

    const applyFilters = () => {
        router.get(
            route('absences.index'),
            {
                classe_id: filterClasse || undefined,
                date_debut: filterDateDebut || undefined,
                date_fin: filterDateFin || undefined,
                est_justifiee: filterJustifiee || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setFilterClasse('');
        setFilterDateDebut('');
        setFilterDateFin('');
        setFilterJustifiee('');
        router.get(route('absences.index'), {}, { replace: true });
    };

    const deleteAbsence = (id: number) => {
        if (!confirm('Supprimer cette absence ?')) return;
        router.delete(route('absences.destroy', id));
    };

    const hasFilters = filterClasse || filterDateDebut || filterDateFin || filterJustifiee;

    return (
        <AppLayout title="Absences">
            <Head title="Absences" />

            {flash?.success ? (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <Check size={16} /> {flash.success}
                </div>
            ) : null}

            <div className="space-y-6">
                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800">Gestion des absences</h1>
                        <p className="text-sm text-gray-500">{absences.total} absences au total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons filters={{ classe_id: filterClasse, date_debut: filterDateDebut, date_fin: filterDateFin, est_justifiee: filterJustifiee }} />
                        <Link href={route('absences.create')}>
                            <Button className="bg-[#1a56a0]">
                                <Plus size={16} className="mr-2" /> Enregistrer une absence
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-xs text-gray-500">Total absences</p>
                        <p className="mt-1 text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-xs text-gray-500">Justifiées</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">{stats.justifiees}</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4">
                        <p className="text-xs text-gray-500">Non justifiées</p>
                        <p className="mt-1 text-2xl font-bold text-red-600">{stats.non_justifiees}</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="rounded-xl border bg-white p-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="relative">
                            <Input
                                list="classes-filter-options"
                                value={filterClasse ? (classes.find((c) => String(c.id) === filterClasse)?.nom ?? '') : 'Toutes les classes'}
                                onChange={(e) => {
                                    const nextValue = e.target.value;
                                    if (nextValue === 'Toutes les classes' || nextValue.trim() === '') {
                                        setFilterClasse('');
                                        return;
                                    }
                                    const matchedClasse = classes.find((c) => c.nom.toLowerCase() === nextValue.toLowerCase());
                                    setFilterClasse(matchedClasse ? String(matchedClasse.id) : '');
                                }}
                                placeholder="Toutes les classes"
                                className="w-full"
                            />
                            <datalist id="classes-filter-options">
                                <option value="Toutes les classes" />
                                {classes.map((c) => (
                                    <option key={c.id} value={c.nom} />
                                ))}
                            </datalist>
                        </div>

                        <Input
                            type="date"
                            value={filterDateDebut}
                            onChange={(e) => setFilterDateDebut(e.target.value)}
                            placeholder="Date début"
                        />
                        <Input
                            type="date"
                            value={filterDateFin}
                            onChange={(e) => setFilterDateFin(e.target.value)}
                            placeholder="Date fin"
                        />

                        <Select value={filterJustifiee || 'all'} onValueChange={(v) => setFilterJustifiee(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Toutes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Justifiée : toutes</SelectItem>
                                <SelectItem value="true">Justifiées</SelectItem>
                                <SelectItem value="false">Non justifiées</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Button className="flex-1 bg-[#1a56a0]" onClick={applyFilters}>Filtrer</Button>
                            {hasFilters ? (
                                <Button variant="outline" onClick={resetFilters} className="px-3">
                                    <X size={14} />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="rounded-xl border bg-white">
                    {absences.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <CalendarX size={40} className="mb-3" />
                            <p className="text-sm">Aucune absence trouvée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Élève</th>
                                        <th className="px-4 py-3 font-medium">Classe</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Motif</th>
                                        <th className="px-4 py-3 font-medium">Justifiée</th>
                                        <th className="px-4 py-3 font-medium">Parent notifié</th>
                                        <th className="px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {absences.data.map((absence) => (
                                        <tr key={absence.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                                {new Date(absence.date_absence).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={route('eleves.show', absence.inscription.eleve.id)}
                                                    className="font-medium text-gray-800 hover:text-[#1a56a0]"
                                                >
                                                    {absence.inscription.eleve.nom} {absence.inscription.eleve.prenoms}
                                                </Link>
                                                <p className="text-xs text-gray-400">{absence.inscription.eleve.matricule}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {absence.inscription.classe.nom}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {TYPE_LABELS[absence.type] ?? absence.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {MOTIF_LABELS[absence.motif] ?? absence.motif}
                                            </td>
                                            <td className="px-4 py-3">
                                                {absence.est_justifiee ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                        <Check size={12} /> Oui
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-red-500">Non</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {absence.parent_notifie ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                                        <Check size={12} /> Oui
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Non</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setEditingAbsence(absence)}
                                                        className="rounded px-2 py-1 text-xs text-[#1a56a0] hover:bg-blue-50"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAbsence(absence.id)}
                                                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {absences.last_page > 1 ? (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-xs text-gray-500">
                                {absences.from}–{absences.to} sur {absences.total}
                            </p>
                            <div className="flex gap-1">
                                {absences.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url ?? '#'}
                                        className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs ${link.active ? 'bg-[#1a56a0] text-white' : 'border text-gray-600 hover:bg-gray-50'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        preserveScroll
                                    >
                                        {link.label === '&laquo; Previous' ? <ChevronLeft size={12} /> : link.label === 'Next &raquo;' ? <ChevronRight size={12} /> : link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {editingAbsence ? (
                <EditDialog absence={editingAbsence} onClose={() => setEditingAbsence(null)} />
            ) : null}
        </AppLayout>
    );
}