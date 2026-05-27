import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    AlertCircle, Award, BookOpen, Briefcase, CheckCircle2, ChevronDown,
    GraduationCap, ImagePlus, MoreHorizontal, Pencil, Plus,
    School, Search, ShieldCheck, Trash2, UserCheck, Users, X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Classe = { id: number; nom: string };
type PersonnelItem = {
    id: number; matricule_interne: string | null; nom: string; prenoms: string; nom_complet: string;
    categorie: string; type: string; poste: string | null; specialite: string | null;
    telephone: string; whatsapp: string | null; email: string | null; sexe: string;
    date_naissance: string | null; lieu_naissance: string | null; nationalite: string | null;
    diplome: string | null; est_certifie_mena: boolean; numero_badge_mena: string | null;
    date_embauche: string | null; type_contrat: string | null; salaire_base: number;
    statut: string; anciennete: number | null; photo_url: string | null;
    classes_affectees: Classe[]; documents: Array<{ id: number; libelle: string }>;
};
type Props = {
    personnel: { data: PersonnelItem[]; links: any[]; total: number; from: number; to: number };
    stats: { total: number; enseignants: number; personnel_ecole: number; actifs: number; certifies_mena: number };
    filters: { search?: string | null; categorie?: string | null };
    options: { categories: Record<string, string>; types: Record<string, string>; typesContrat: Record<string, string>; statuts: Record<string, string>; sexes: Record<string, string>; diplomes: Record<string, string>; matieres: string[] };
    classes: Classe[];
};

// ─── Constantes ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
    enseignant: 'Enseignant(e)', directeur: 'Directeur/trice', caissier: 'Caissier(ière)',
    secretaire: 'Secrétaire', agent_entretien: 'Agent d\'entretien', surveillant: 'Surveillant(e)',
};
const STATUT_CFG: Record<string, { label: string; cls: string }> = {
    actif:    { label: 'Actif',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    suspendu: { label: 'Suspendu',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    parti:    { label: 'Parti',     cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' },
};
const AVATAR_PALETTE = ['bg-indigo-500','bg-violet-500','bg-blue-500','bg-teal-500','bg-emerald-600','bg-rose-500','bg-amber-500','bg-cyan-600'];
const avatarColor = (name: string) => AVATAR_PALETTE[(name.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];

const SEL = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';
const today = new Date().toISOString().slice(0, 10);

// ─── Petits composants ────────────────────────────────────────────────────────

function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) {
    const sz = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
    const initials = name.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase() || '?';
    if (photoUrl) return <img src={photoUrl} alt={name} className={`${sz} rounded-full object-cover`} />;
    return <div className={`${sz} ${avatarColor(name)} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}>{initials}</div>;
}

function StatusBadge({ statut }: { statut: string }) {
    const cfg = STATUT_CFG[statut] ?? { label: statut, cls: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-gray-400">
                {label}{required ? <span className="ml-0.5 text-red-400">*</span> : null}
            </label>
            {children}
            {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
        </div>
    );
}

function FlashBanner() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300'}`}>
            {flash.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            {flash.success ?? flash.error}
        </div>
    );
}

// ─── Carte Enseignant ─────────────────────────────────────────────────────────

function EnseignantCard({ item, onEdit, onDelete }: { item: PersonnelItem; onEdit: () => void; onDelete: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            {/* Bande couleur haut */}
            <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-blue-500" />

            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* En-tête: avatar + nom + statut */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Avatar name={item.nom_complet} photoUrl={item.photo_url} size="lg" />
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-gray-100">{item.nom_complet}</p>
                            <p className="text-xs text-slate-400 dark:text-gray-500">{item.matricule_interne ?? '—'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge statut={item.statut} />
                        {item.est_certifie_mena ? (
                            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                <Award size={10} /> MENA
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Spécialité / Diplôme */}
                <div className="space-y-1">
                    {item.specialite ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-gray-300">
                            <BookOpen size={13} className="shrink-0 text-indigo-400" />
                            <span>{item.specialite}</span>
                        </div>
                    ) : null}
                    {item.diplome ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
                            <GraduationCap size={12} className="shrink-0" />
                            <span>{item.diplome}</span>
                        </div>
                    ) : null}
                </div>

                {/* Classes assignées */}
                {item.classes_affectees.length > 0 ? (
                    <div>
                        <p className="mb-1.5 text-xs font-medium text-slate-400 dark:text-gray-500">Classes assignées</p>
                        <div className="flex flex-wrap gap-1.5">
                            {item.classes_affectees.slice(0, 5).map((c) => (
                                <span key={c.id} className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{c.nom}</span>
                            ))}
                            {item.classes_affectees.length > 5 ? (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-gray-700 dark:text-gray-400">+{item.classes_affectees.length - 5}</span>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 dark:text-gray-500 italic">Aucune classe assignée</p>
                )}

                {/* Contrat + ancienneté */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-gray-700 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Briefcase size={11} />
                        {item.type_contrat ?? '—'}
                        {item.anciennete ? ` · ${item.anciennete} an${item.anciennete > 1 ? 's' : ''}` : ''}
                    </span>
                    <span>{item.telephone}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-gray-700">
                <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 text-xs">
                    <Pencil size={12} /> Modifier
                </Button>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-700">
                        <MoreHorizontal size={16} />
                    </button>
                    {menuOpen ? (
                        <div className="absolute right-0 bottom-8 z-20 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button onClick={() => { setMenuOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 size={13} /> Supprimer
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// ─── Ligne Personnel École ────────────────────────────────────────────────────

function AdminRow({ item, onEdit, onDelete }: { item: PersonnelItem; onEdit: () => void; onDelete: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <tr className="border-t border-slate-100 hover:bg-slate-50/60 dark:border-gray-700 dark:hover:bg-gray-800/60">
            {/* Employé */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Avatar name={item.nom_complet} photoUrl={item.photo_url} size="sm" />
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-gray-100">{item.nom_complet}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">{item.poste || TYPE_LABELS[item.type] || item.type}</p>
                    </div>
                </div>
            </td>
            {/* Type */}
            <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-gray-700 dark:text-gray-300">
                    {TYPE_LABELS[item.type] ?? item.type}
                </span>
            </td>
            {/* Contact */}
            <td className="px-4 py-3 text-sm text-slate-600 dark:text-gray-400">
                <p>{item.telephone}</p>
                {item.email ? <p className="truncate text-xs text-slate-400 dark:text-gray-500">{item.email}</p> : null}
            </td>
            {/* Contrat */}
            <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
                <p>{item.type_contrat ?? '—'}</p>
                {item.anciennete ? <p>{item.anciennete} an{item.anciennete > 1 ? 's' : ''}</p> : null}
            </td>
            {/* Statut */}
            <td className="px-4 py-3"><StatusBadge statut={item.statut} /></td>
            {/* Actions */}
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700">
                        <Pencil size={14} />
                    </button>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700">
                            <MoreHorizontal size={14} />
                        </button>
                        {menuOpen ? (
                            <div className="absolute right-0 z-20 min-w-[130px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                <button onClick={() => { setMenuOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <Trash2 size={13} /> Supprimer
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─── Dialogue de suppression ──────────────────────────────────────────────────

function DeleteDialog({ person, onConfirm, onCancel }: { person: PersonnelItem; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-gray-100">Supprimer ce membre</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{person.nom_complet}</p>
                    </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-gray-400">Cette action est irréversible. Le dossier sera archivé et ne sera plus visible dans les listes actives.</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>Annuler</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>Supprimer définitivement</Button>
                </div>
            </div>
        </div>
    );
}

// ─── Panneau de formulaire ────────────────────────────────────────────────────

function FormPanel({ mode, person, classes, options, onClose }: {
    mode: 'create' | 'edit';
    person: PersonnelItem | null;
    classes: Classe[];
    options: Props['options'];
    onClose: () => void;
}) {
    const isEdit = mode === 'edit';
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(person?.photo_url ?? null);

    const form = useForm<any>({
        nom: person?.nom ?? '',
        prenoms: person?.prenoms ?? '',
        sexe: person?.sexe ?? 'M',
        date_naissance: person?.date_naissance ?? '',
        lieu_naissance: person?.lieu_naissance ?? '',
        nationalite: person?.nationalite ?? 'Ivoirienne',
        telephone: person?.telephone ?? '',
        whatsapp: person?.whatsapp ?? '',
        email: person?.email ?? '',
        categorie: person?.categorie ?? 'enseignant',
        type: person?.type ?? 'enseignant',
        poste: person?.poste ?? '',
        specialite: person?.specialite ?? '',
        diplome: person?.diplome ?? '',
        est_certifie_mena: person?.est_certifie_mena ?? false,
        numero_badge_mena: person?.numero_badge_mena ?? '',
        date_embauche: person?.date_embauche ?? today,
        type_contrat: person?.type_contrat ?? 'CDI',
        salaire_base: person?.salaire_base ?? 0,
        statut: person?.statut ?? 'actif',
        photo: null as File | null,
        documents: [] as any[],
        classes_ids: (person?.classes_affectees ?? []).map((c) => c.id),
        _method: isEdit ? 'PATCH' : '',
    });

    const isEnseignant = form.data.categorie === 'enseignant';

    const handleCategorieChange = (cat: string) => {
        form.setData((prev: any) => ({
            ...prev,
            categorie: cat,
            type: cat === 'enseignant' ? 'enseignant' : 'secretaire',
        }));
    };

    const submit = () => {
        if (isEdit && person) {
            form.transform((d: any) => ({ ...d, _method: 'PATCH' }));
            form.post(route('personnel.update', person.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            form.post(route('personnel.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { form.reset(); onClose(); },
            });
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-gray-700">
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-gray-100">
                            {isEdit ? 'Modifier la fiche' : 'Nouveau membre'}
                        </h2>
                        {isEdit && person ? <p className="text-xs text-slate-400 dark:text-gray-500">{person.nom_complet}</p> : null}
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable form */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

                    {/* Sélecteur de catégorie */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-gray-700 dark:bg-gray-800">
                        {[
                            { key: 'enseignant', label: 'Enseignant(e)', icon: GraduationCap },
                            { key: 'personnel_ecole', label: 'Personnel d\'école', icon: School },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleCategorieChange(key)}
                                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${form.data.categorie === key ? 'bg-white shadow text-blue-700 dark:bg-gray-700 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}
                            >
                                <Icon size={15} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Identité */}
                    <section>
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                            <UserCheck size={12} /> Identité
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label="Nom" required error={form.errors.nom}>
                                <Input value={form.data.nom} onChange={(e) => form.setData('nom', e.target.value)} placeholder="KOUAMÉ" />
                            </FormField>
                            <FormField label="Prénoms" required error={form.errors.prenoms}>
                                <Input value={form.data.prenoms} onChange={(e) => form.setData('prenoms', e.target.value)} placeholder="Jean-Baptiste" />
                            </FormField>
                            <FormField label="Sexe" required>
                                <select className={SEL} value={form.data.sexe} onChange={(e) => form.setData('sexe', e.target.value)}>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </FormField>
                            <FormField label="Date de naissance">
                                <Input type="date" value={form.data.date_naissance} onChange={(e) => form.setData('date_naissance', e.target.value)} />
                            </FormField>
                            <FormField label="Lieu de naissance">
                                <Input value={form.data.lieu_naissance} onChange={(e) => form.setData('lieu_naissance', e.target.value)} placeholder="Abidjan" />
                            </FormField>
                            <FormField label="Nationalité">
                                <Input value={form.data.nationalite} onChange={(e) => form.setData('nationalite', e.target.value)} placeholder="Ivoirienne" />
                            </FormField>
                        </div>

                        {/* Photo */}
                        <div className="mt-3">
                            <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-gray-400">Photo de profil</p>
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-200 bg-slate-50 dark:border-gray-600 dark:bg-gray-800">
                                    {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="text-slate-300" />}
                                </div>
                                <div>
                                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        form.setData('photo', f);
                                        setPhotoPreview(f ? URL.createObjectURL(f) : (person?.photo_url ?? null));
                                    }} />
                                    <Button type="button" size="sm" variant="outline" onClick={() => photoInputRef.current?.click()}>Choisir une photo</Button>
                                    <p className="mt-1 text-xs text-slate-400">JPG, PNG · max 2 Mo</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Contact */}
                    <section>
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                            <Users size={12} /> Contact
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label="Téléphone" required error={form.errors.telephone}>
                                <Input value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)} placeholder="+225 07 00 00 00 00" />
                            </FormField>
                            <FormField label="WhatsApp">
                                <Input value={form.data.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} placeholder="+225 07 00 00 00 00" />
                            </FormField>
                            <div className="sm:col-span-2">
                                <FormField label="Email" error={form.errors.email}>
                                    <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="jean.kouame@ecole.ci" />
                                </FormField>
                            </div>
                        </div>
                    </section>

                    {/* ── Profil professionnel */}
                    <section>
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                            <Briefcase size={12} /> Profil professionnel
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {isEnseignant ? (
                                <>
                                    <div className="sm:col-span-2">
                                        <FormField label="Spécialité / Matières enseignées">
                                            <select className={SEL} value={form.data.specialite} onChange={(e) => form.setData('specialite', e.target.value)}>
                                                <option value="">Sélectionner une matière</option>
                                                {options.matieres.map((matiere) => <option key={matiere} value={matiere}>{matiere}</option>)}
                                            </select>
                                        </FormField>
                                    </div>
                                    <FormField label="Diplôme">
                                        <select className={SEL} value={form.data.diplome} onChange={(e) => form.setData('diplome', e.target.value)}>
                                            <option value="">Non renseigné</option>
                                            {Object.keys(options.diplomes).map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </FormField>
                                    <div>
                                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm dark:border-gray-600 dark:text-gray-300">
                                            <Checkbox
                                                checked={form.data.est_certifie_mena}
                                                onCheckedChange={(v) => form.setData('est_certifie_mena', Boolean(v))}
                                            />
                                            <Award size={14} className="text-amber-500" /> Certifié(e) MENA
                                        </label>
                                    </div>
                                    {form.data.est_certifie_mena ? (
                                        <div className="sm:col-span-2">
                                            <FormField label="Numéro de badge MENA">
                                                <Input value={form.data.numero_badge_mena} onChange={(e) => form.setData('numero_badge_mena', e.target.value)} placeholder="MENA-2024-XXXXX" />
                                            </FormField>
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <FormField label="Fonction / Titre du poste">
                                        <select className={SEL} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)}>
                                            {['directeur', 'caissier', 'secretaire', 'agent_entretien', 'surveillant'].map((t) => (
                                                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label="Intitulé personnalisé du poste">
                                        <Input value={form.data.poste} onChange={(e) => form.setData('poste', e.target.value)} placeholder="Ex : Secrétaire de direction" />
                                    </FormField>
                                </>
                            )}

                            <FormField label="Date d'embauche" required error={form.errors.date_embauche}>
                                <Input type="date" value={form.data.date_embauche} onChange={(e) => form.setData('date_embauche', e.target.value)} />
                            </FormField>
                            <FormField label="Type de contrat" required>
                                <select className={SEL} value={form.data.type_contrat} onChange={(e) => form.setData('type_contrat', e.target.value)}>
                                    {Object.keys(options.typesContrat).map((k) => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Salaire de base (FCFA)" required error={form.errors.salaire_base}>
                                <Input type="number" min={0} value={form.data.salaire_base} onChange={(e) => form.setData('salaire_base', Number(e.target.value))} />
                            </FormField>
                            <FormField label="Statut" required>
                                <select className={SEL} value={form.data.statut} onChange={(e) => form.setData('statut', e.target.value)}>
                                    <option value="actif">Actif</option>
                                    <option value="suspendu">Suspendu</option>
                                    <option value="parti">Parti</option>
                                </select>
                            </FormField>
                        </div>
                    </section>

                    {/* ── Classes (enseignants) */}
                    {isEnseignant && classes.length > 0 ? (
                        <section>
                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                <BookOpen size={12} /> Classes assignées
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {classes.map((c) => (
                                    <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition ${form.data.classes_ids.includes(c.id) ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-gray-600 dark:text-gray-400'}`}>
                                        <Checkbox
                                            checked={form.data.classes_ids.includes(c.id)}
                                            onCheckedChange={(checked) => {
                                                form.setData('classes_ids', checked
                                                    ? [...form.data.classes_ids, c.id]
                                                    : form.data.classes_ids.filter((id: number) => id !== c.id)
                                                );
                                            }}
                                        />
                                        {c.nom}
                                    </label>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {/* ── Documents (création uniquement) */}
                    {!isEdit ? (
                        <section>
                            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                <Briefcase size={12} /> Documents du dossier
                            </p>
                            <div className="space-y-3">
                                {(form.data.documents ?? []).map((doc: any, i: number) => (
                                    <div key={i} className="relative rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                        <button type="button" onClick={() => {
                                            const next = [...form.data.documents];
                                            next.splice(i, 1);
                                            form.setData('documents', next);
                                        }} className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                        <div className="space-y-2">
                                            <Input placeholder="Libellé du document" value={doc.libelle} onChange={(e) => {
                                                const next = [...form.data.documents];
                                                next[i] = { ...next[i], libelle: e.target.value };
                                                form.setData('documents', next);
                                            }} />
                                            <Input placeholder="Description (optionnel)" value={doc.description} onChange={(e) => {
                                                const next = [...form.data.documents];
                                                next[i] = { ...next[i], description: e.target.value };
                                                form.setData('documents', next);
                                            }} />
                                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                                const next = [...form.data.documents];
                                                next[i] = { ...next[i], fichier: e.target.files?.[0] ?? null };
                                                form.setData('documents', next);
                                            }} />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => form.setData('documents', [...form.data.documents, { libelle: '', description: '', fichier: null }])}>
                                    <Plus size={13} /> Ajouter un document
                                </Button>
                            </div>
                        </section>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-gray-700">
                    {Object.keys(form.errors).length > 0 ? (
                        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            Veuillez corriger les erreurs dans le formulaire.
                        </p>
                    ) : null}
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
                        <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={form.processing} onClick={submit}>
                            {form.processing ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer la fiche')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PersonnelIndex({ personnel, stats, filters, options, classes }: Props) {
    const activeCategorie = filters.categorie ?? 'all';
    const [search, setSearch] = useState(filters.search ?? '');
    const [panelOpen, setPanelOpen]   = useState(false);
    const [panelMode, setPanelMode]   = useState<'create' | 'edit'>('create');
    const [editTarget, setEditTarget] = useState<PersonnelItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PersonnelItem | null>(null);

    const applyFilter = (cat: string) => {
        router.get(route('personnel.index'), { search: search || undefined, categorie: cat === 'all' ? undefined : cat }, { preserveState: true, replace: true });
    };

    const applySearch = (s: string) => {
        setSearch(s);
        router.get(route('personnel.index'), { search: s || undefined, categorie: activeCategorie === 'all' ? undefined : activeCategorie }, { preserveState: true, replace: true });
    };

    const openCreate = () => { setPanelMode('create'); setEditTarget(null); setPanelOpen(true); };
    const openEdit   = (item: PersonnelItem) => { setPanelMode('edit'); setEditTarget(item); setPanelOpen(true); };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('personnel.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const TABS = [
        { key: 'all',           label: 'Tous',              count: stats.total,           icon: Users },
        { key: 'enseignant',    label: 'Enseignants',       count: stats.enseignants,     icon: GraduationCap },
        { key: 'personnel_ecole', label: 'Personnel d\'école', count: stats.personnel_ecole, icon: School },
    ];

    const isEnseignantView = activeCategorie === 'enseignant';

    return (
        <AppLayout title="Personnel">
            <Head title="Personnel" />
            <div className="space-y-5">

                {/* ── Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Personnel</h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">Gérez les enseignants et le personnel administratif de l'établissement.</p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        <Plus size={15} /> Ajouter un membre
                    </Button>
                </div>

                <FlashBanner />

                {/* ── Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Enseignants', value: stats.enseignants, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { label: 'Personnel école', value: stats.personnel_ecole, icon: School, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                        { label: 'Actifs', value: stats.actifs, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Certifiés MENA', value: stats.certifies_mena, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                            <div className={`rounded-lg p-2 ${s.bg}`}><s.icon size={16} className={s.color} /></div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-gray-100">{s.value}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs + Search */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    {/* Tabs */}
                    <div className="flex gap-1">
                        {TABS.map(({ key, label, count, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => applyFilter(key)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeCategorie === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                <Icon size={14} /> {label}
                                <span className={`rounded-full px-1.5 py-0.5 text-xs ${activeCategorie === key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300'}`}>{count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xs w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input className="pl-8" placeholder="Nom, téléphone, matricule…" value={search} onChange={(e) => applySearch(e.target.value)} />
                    </div>
                </div>

                {/* ── Vue Enseignants : grille de cartes */}
                {isEnseignantView ? (
                    personnel.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400 dark:border-gray-600 dark:bg-gray-800">
                            <GraduationCap size={40} strokeWidth={1.5} />
                            <p className="mt-3 text-sm">Aucun enseignant trouvé</p>
                            <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-1.5"><Plus size={13} /> Ajouter un enseignant</Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {personnel.data.map((item) => (
                                <EnseignantCard key={item.id} item={item} onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
                            ))}
                        </div>
                    )
                ) : (
                    /* ── Vue Personnel d'école / Tous : tableau */
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        {personnel.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-gray-500">
                                <Users size={40} strokeWidth={1.5} />
                                <p className="mt-3 text-sm">Aucun personnel trouvé</p>
                                <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-1.5"><Plus size={13} /> Ajouter</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 dark:bg-gray-700/50 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3">Employé</th>
                                            <th className="px-4 py-3">Fonction</th>
                                            <th className="px-4 py-3">Contact</th>
                                            <th className="px-4 py-3">Contrat</th>
                                            <th className="px-4 py-3">Statut</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personnel.data.map((item) => (
                                            <AdminRow key={item.id} item={item} onEdit={() => openEdit(item)} onDelete={() => setDeleteTarget(item)} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* Pagination info */}
                        {personnel.data.length > 0 ? (
                            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-gray-700 dark:text-gray-400">
                                {personnel.from} – {personnel.to} sur {personnel.total} résultats
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* ── Panneau formulaire */}
            {panelOpen ? (
                <FormPanel mode={panelMode} person={editTarget} classes={classes} options={options} onClose={() => setPanelOpen(false)} />
            ) : null}

            {/* ── Dialogue de suppression */}
            {deleteTarget ? (
                <DeleteDialog person={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
            ) : null}
        </AppLayout>
    );
}
