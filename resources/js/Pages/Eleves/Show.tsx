import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type React from 'react';
import { ArrowRightLeft, ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import type { Absence, Classe, Eleve, Inscription, Note, Paiement, TypeFrais } from '@/types/eleve';

type Props = {
    eleve: Eleve;
    inscription_active: (Inscription & { classe: Classe }) | null;
    notes_par_trimestre: { 1: Note[]; 2: Note[]; 3: Note[] };
    paiements: Paiement[];
    absences: Absence[];
    stats_financieres: { total_du: number; total_paye: number; solde: number; est_a_jour: boolean };
    type_frais?: TypeFrais[];
};

type AuthProps = {
    auth: {
        user?: {
            name?: string;
        };
        roles?: string[];
    };
};

type Tab = (typeof tabs)[number];

const tabs = ['Informations', 'Notes', 'Paiements', 'Absences', 'Historique'] as const;

const emptyText = 'Non renseigné';

const formatDate = (date?: string | null) => {
    if (!date) {
        return emptyText;
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
};

const formatCurrency = (amount?: number | null) => `${Number(amount ?? 0).toLocaleString('fr-FR')} FCFA`;

const formatStatus = (status?: string | null) => (status ? status.replace('_', ' ') : emptyText);

const Badge = ({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray' }) => {
    const tones = {
        blue: 'bg-[#dbeafe] text-[#1a56db]',
        green: 'bg-[#dcfce7] text-[#16a34a]',
        orange: 'bg-[#ffedd5] text-[#ea580c]',
        red: 'bg-[#fee2e2] text-[#dc2626]',
        gray: 'bg-[#f3f4f6] text-[#6b7280]',
    };

    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${tones[tone]}`}>{children}</span>;
};

const EmptyState = ({ label }: { label: string }) => (
    <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-[#f9fafb] px-5 py-8 text-center text-sm font-medium text-[#6b7280]">{label}</div>
);

export default function ElevesShow({ eleve, inscription_active, notes_par_trimestre, paiements, absences, stats_financieres }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('Informations');
    const [showTransfertDialog, setShowTransfertDialog] = useState(false);
    const [ecoleDestination, setEcoleDestination] = useState('');

    const { auth } = usePage<AuthProps>().props;

    const age = useMemo(() => new Date().getFullYear() - new Date(eleve.date_naissance).getFullYear(), [eleve.date_naissance]);

    const allPaiements = useMemo(
        () => eleve.inscriptions?.flatMap((inscription) => inscription.paiements ?? []) ?? paiements,
        [eleve.inscriptions, paiements],
    );

    const allAbsences = useMemo(
        () => eleve.inscriptions?.flatMap((inscription) => inscription.absences ?? []) ?? absences,
        [absences, eleve.inscriptions],
    );

    const paymentTotals = useMemo(() => ({
        totalDu: allPaiements.reduce((total, paiement) => total + (paiement.montant_attendu ?? 0), 0),
        totalPaye: allPaiements.reduce((total, paiement) => total + (paiement.montant_paye ?? 0), 0),
        solde: allPaiements.reduce((total, paiement) => total + (paiement.montant_restant ?? 0), 0),
    }), [allPaiements]);

    const moyenneT1 = useMemo(() => {
        const notes = notes_par_trimestre[1] ?? [];
        if (!notes.length) {
            return '—';
        }

        const total = notes.reduce((acc, note) => acc + (note.note ?? 0), 0);
        return `${(total / notes.length).toFixed(2)}/20`;
    }, [notes_par_trimestre]);

    const dateNaissance = useMemo(() => formatDate(eleve.date_naissance), [eleve.date_naissance]);

    const adminName = auth?.user?.name || 'Kouame Aka';
    const adminRole = auth?.roles?.[0]?.replace('_', ' ') || 'Super Admin';
    const etablissementName = inscription_active?.classe?.etablissement?.nom ?? eleve.etablissement?.nom ?? emptyText;

    const infoRowsLeft = [
        { label: 'Nom complet', value: `${eleve.nom} ${eleve.prenoms}` },
        { label: 'Matricule', value: eleve.matricule },
        { label: 'Genre', value: eleve.sexe === 'M' ? 'Garçon' : 'Fille' },
        { label: 'Date de naissance', value: dateNaissance },
        { label: 'Lieu de naissance', value: `${eleve.lieu_naissance}, ${eleve.pays_naissance}` },
        { label: 'Nationalité', value: eleve.nationalite ?? emptyText },
        { label: 'Situation familiale', value: formatStatus(eleve.situation_familiale) },
        { label: "N° extrait d'acte", value: eleve.extrait_naissance_numero ?? emptyText },
    ];

    const infoRowsRight = [
        { label: 'Établissement', value: etablissementName },
        { label: 'Année scolaire', value: inscription_active?.annee_scolaire?.libelle ?? emptyText },
        { label: 'Classe', value: inscription_active?.classe?.nom ?? emptyText, isBadge: true },
        { label: 'Niveau', value: inscription_active?.classe?.niveau?.libelle ?? emptyText, isBadge: true },
        { label: 'Date inscription', value: formatDate(inscription_active?.date_inscription) },
        { label: 'Type', value: formatStatus(inscription_active?.type) },
        { label: 'Statut', value: formatStatus(inscription_active?.statut), isBadge: true },
        { label: 'Bourse', value: eleve.est_boursier ? 'Boursier' : 'Non-boursier' },
    ];

    const parents = eleve.parents_tuteurs ?? eleve.parentsTuteurs ?? eleve.parents ?? [];

    const renderInformation = () => (
        <div className="space-y-8">
            <div className="grid gap-10 md:grid-cols-2">
                <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#9ca3af]">IDENTITÉ</h3>
                    <div className="mt-3">
                        {infoRowsLeft.map((row) => (
                            <div className="flex border-b border-[#f3f4f6] py-[10px]" key={row.label}>
                                <p className="w-[150px] shrink-0 text-[13px] text-[#9ca3af]">{row.label}</p>
                                <p className="text-[13px] font-semibold capitalize text-[#111827]">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#9ca3af]">SCOLARITÉ</h3>
                    <div className="mt-3">
                        {infoRowsRight.map((row) => (
                            <div className="flex border-b border-[#f3f4f6] py-[10px]" key={row.label}>
                                <p className="w-[150px] shrink-0 text-[13px] text-[#9ca3af]">{row.label}</p>
                                {row.isBadge ? <Badge>{row.value}</Badge> : <p className="text-[13px] font-semibold capitalize text-[#111827]">{row.value}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#9ca3af]">PARENTS & TUTEURS</h3>
                {parents.length ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {parents.map((parent) => (
                            <article className="rounded-2xl border border-[#f3f4f6] p-4" key={parent.id}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-[#111827]">{`${parent.nom} ${parent.prenoms}`}</p>
                                        <p className="mt-1 text-xs font-medium capitalize text-[#6b7280]">{parent.lien}</p>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-1">
                                        {parent.pivot?.est_principal ? <Badge tone="green">Principal</Badge> : null}
                                        {parent.est_payeur ? <Badge tone="blue">Payeur</Badge> : null}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1 text-xs text-[#6b7280]">
                                    <p><span className="font-semibold text-[#111827]">Téléphone :</span> {parent.telephone_1}{parent.telephone_2 ? ` / ${parent.telephone_2}` : ''}</p>
                                    <p><span className="font-semibold text-[#111827]">WhatsApp :</span> {parent.whatsapp ?? emptyText}</p>
                                    <p><span className="font-semibold text-[#111827]">Email :</span> {parent.email ?? emptyText}</p>
                                    <p><span className="font-semibold text-[#111827]">Profession :</span> {parent.profession ?? emptyText}</p>
                                    <p><span className="font-semibold text-[#111827]">Adresse :</span> {parent.adresse_quartier ?? emptyText}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : <EmptyState label="Aucun parent ou tuteur rattaché à cet élève." />}
            </div>
        </div>
    );

    const renderNotes = () => (
        <div className="space-y-5">
            {[1, 2, 3].map((trimestre) => {
                const notes = notes_par_trimestre[trimestre as 1 | 2 | 3] ?? [];

                return (
                    <article className="rounded-2xl border border-[#f3f4f6] p-5" key={trimestre}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-[0.07em] text-[#111827]">Trimestre {trimestre}</h3>
                            <Badge tone={notes.length ? 'blue' : 'gray'}>{notes.length} note{notes.length > 1 ? 's' : ''}</Badge>
                        </div>
                        {notes.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs uppercase tracking-[0.06em] text-[#9ca3af]">
                                        <tr className="border-b border-[#f3f4f6]">
                                            <th className="py-3 font-semibold">Matière</th>
                                            <th className="py-3 font-semibold">Note</th>
                                            <th className="py-3 font-semibold">Rang</th>
                                            <th className="py-3 font-semibold">Appréciation</th>
                                            <th className="py-3 font-semibold">Validation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notes.map((note) => (
                                            <tr className="border-b border-[#f9fafb]" key={note.id}>
                                                <td className="py-3 font-semibold text-[#111827]">{note.matiere?.libelle ?? emptyText}</td>
                                                <td className="py-3 text-[#111827]">{note.note !== null ? `${note.note}/20` : emptyText}</td>
                                                <td className="py-3 text-[#6b7280]">{note.rang_classe ?? emptyText}</td>
                                                <td className="py-3 text-[#6b7280]">{note.appreciation ?? emptyText}</td>
                                                <td className="py-3"><Badge tone={note.est_validee ? 'green' : 'orange'}>{note.est_validee ? 'Validée' : 'En attente'}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState label={`Aucune note enregistrée pour le trimestre ${trimestre}.`} />}
                    </article>
                );
            })}
        </div>
    );

    const renderPaiements = () => (
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
                <article className="rounded-2xl bg-[#f8fafc] p-4"><p className="text-xs font-semibold uppercase text-[#9ca3af]">Total dû</p><p className="mt-1 text-xl font-bold text-[#111827]">{formatCurrency(paymentTotals.totalDu)}</p></article>
                <article className="rounded-2xl bg-[#f0fdf4] p-4"><p className="text-xs font-semibold uppercase text-[#16a34a]">Total payé</p><p className="mt-1 text-xl font-bold text-[#111827]">{formatCurrency(paymentTotals.totalPaye)}</p></article>
                <article className="rounded-2xl bg-[#fff7ed] p-4"><p className="text-xs font-semibold uppercase text-[#ea580c]">Solde</p><p className="mt-1 text-xl font-bold text-[#111827]">{formatCurrency(paymentTotals.solde)}</p></article>
            </div>
            {allPaiements.length ? (
                <div className="overflow-x-auto rounded-2xl border border-[#f3f4f6]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f9fafb] text-xs uppercase tracking-[0.06em] text-[#9ca3af]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Reçu</th>
                                <th className="px-4 py-3 font-semibold">Frais</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Attendu</th>
                                <th className="px-4 py-3 font-semibold">Payé</th>
                                <th className="px-4 py-3 font-semibold">Reste</th>
                                <th className="px-4 py-3 font-semibold">Mode</th>
                                <th className="px-4 py-3 font-semibold">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPaiements.map((paiement) => (
                                <tr className="border-t border-[#f3f4f6]" key={paiement.id}>
                                    <td className="px-4 py-3 font-semibold text-[#111827]">{paiement.recu_numero}</td>
                                    <td className="px-4 py-3 text-[#6b7280]">{paiement.type_frais?.libelle ?? emptyText}</td>
                                    <td className="px-4 py-3 text-[#6b7280]">{formatDate(paiement.date_paiement)}</td>
                                    <td className="px-4 py-3 text-[#111827]">{formatCurrency(paiement.montant_attendu)}</td>
                                    <td className="px-4 py-3 text-[#111827]">{formatCurrency(paiement.montant_paye)}</td>
                                    <td className="px-4 py-3 text-[#111827]">{formatCurrency(paiement.montant_restant)}</td>
                                    <td className="px-4 py-3 capitalize text-[#6b7280]">{formatStatus(paiement.mode_paiement)}</td>
                                    <td className="px-4 py-3"><Badge tone={paiement.statut === 'paye' ? 'green' : paiement.statut === 'partiel' ? 'orange' : 'red'}>{formatStatus(paiement.statut)}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <EmptyState label="Aucun paiement enregistré pour cet élève." />}
        </div>
    );

    const renderAbsences = () => (
        allAbsences.length ? (
            <div className="overflow-x-auto rounded-2xl border border-[#f3f4f6]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f9fafb] text-xs uppercase tracking-[0.06em] text-[#9ca3af]">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Période</th>
                            <th className="px-4 py-3 font-semibold">Motif</th>
                            <th className="px-4 py-3 font-semibold">Justification</th>
                            <th className="px-4 py-3 font-semibold">Parent notifié</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allAbsences.map((absence) => (
                            <tr className="border-t border-[#f3f4f6]" key={absence.id}>
                                <td className="px-4 py-3 font-semibold text-[#111827]">{formatDate(absence.date_absence)}</td>
                                <td className="px-4 py-3 capitalize text-[#6b7280]">{formatStatus(absence.type)}</td>
                                <td className="px-4 py-3 capitalize text-[#6b7280]">{formatStatus(absence.motif)}</td>
                                <td className="px-4 py-3"><Badge tone={absence.est_justifiee ? 'green' : 'orange'}>{absence.est_justifiee ? 'Justifiée' : 'Non justifiée'}</Badge></td>
                                <td className="px-4 py-3"><Badge tone={absence.parent_notifie ? 'green' : 'gray'}>{absence.parent_notifie ? 'Oui' : 'Non'}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : <EmptyState label="Aucune absence enregistrée pour cet élève." />
    );

    const renderHistorique = () => (
        eleve.inscriptions?.length ? (
            <div className="space-y-3">
                {eleve.inscriptions.map((inscription) => (
                    <article className="rounded-2xl border border-[#f3f4f6] p-5" key={inscription.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-base font-bold text-[#111827]">{inscription.annee_scolaire?.libelle ?? emptyText}</p>
                                <p className="mt-1 text-sm text-[#6b7280]">{inscription.classe?.nom ?? emptyText} • {inscription.classe?.niveau?.libelle ?? emptyText}</p>
                            </div>
                            <Badge tone={inscription.statut === 'inscrit' ? 'green' : 'gray'}>{formatStatus(inscription.statut)}</Badge>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                            <p><span className="block text-xs font-semibold uppercase text-[#9ca3af]">Date</span><span className="font-semibold text-[#111827]">{formatDate(inscription.date_inscription)}</span></p>
                            <p><span className="block text-xs font-semibold uppercase text-[#9ca3af]">Type</span><span className="font-semibold capitalize text-[#111827]">{formatStatus(inscription.type)}</span></p>
                            <p><span className="block text-xs font-semibold uppercase text-[#9ca3af]">Paiements</span><span className="font-semibold text-[#111827]">{inscription.paiements?.length ?? 0}</span></p>
                            <p><span className="block text-xs font-semibold uppercase text-[#9ca3af]">Absences</span><span className="font-semibold text-[#111827]">{inscription.absences?.length ?? 0}</span></p>
                        </div>
                    </article>
                ))}
            </div>
        ) : <EmptyState label="Aucun historique de scolarité disponible." />
    );

    const renderActiveTab = () => {
        if (activeTab === 'Informations') {
            return renderInformation();
        }
        if (activeTab === 'Notes') {
            return renderNotes();
        }
        if (activeTab === 'Paiements') {
            return renderPaiements();
        }
        if (activeTab === 'Absences') {
            return renderAbsences();
        }

        return renderHistorique();
    };

    return (
        <AppLayout title={`${eleve.nom} ${eleve.prenoms}`}>
            <Head title={`${eleve.nom} ${eleve.prenoms}`} />

            <div className="student-show min-h-screen bg-[#f7f8fc] -m-6">
                <header className="sticky top-0 z-20 h-[60px] border-b border-[#f0f0f0] bg-white px-6">
                    <div className="mx-auto flex h-full w-full max-w-[960px] items-center justify-between">
                        <div className="text-[13px] text-[#6b7280]">
                            Accueil <span className="mx-1">/</span>
                            <span className="font-bold text-[#111827]">{`${eleve.nom} ${eleve.prenoms}`}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#1a56db] to-[#0e3fa3] text-sm font-bold text-white">
                                {adminName
                                    .split(' ')
                                    .map((chunk) => chunk[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                            <div className="leading-tight">
                                <p className="text-sm font-semibold text-[#111827]">{adminName}</p>
                                <p className="text-xs font-medium capitalize text-[#6b7280]">{adminRole}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[960px] px-6 py-8">
                    <section className="rounded-[24px] bg-white px-8 py-7">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="fraunces flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-[24px] font-bold text-white shadow-[0_15px_40px_rgba(34,197,94,0.35)]">
                                    {`${eleve.nom[0] ?? ''}${eleve.prenoms[0] ?? ''}`.toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="fraunces text-[26px] font-bold leading-none text-[#111827]">{`${eleve.nom} ${eleve.prenoms}`}</h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-[8px] bg-[#f3f4f6] px-3 py-1 text-xs font-medium text-[#6b7280]">{eleve.matricule}</span>
                                        <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#1a56db]">{inscription_active?.classe?.niveau?.libelle ?? '—'}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]"><span className="h-2 w-2 rounded-full bg-[#22c55e]" />{formatStatus(eleve.statut)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Link href={route('eleves.edit', eleve.id)}>
                                    <Button variant="outline" className="h-10 rounded-xl border-[#e5e7eb] px-4 text-sm font-semibold text-[#111827]">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Button>
                                </Link>
                                <Button variant="outline" className="h-10 rounded-xl border-[#e5e7eb] px-4 text-sm font-semibold text-[#111827]" onClick={() => setShowTransfertDialog(true)}>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Transférer
                                </Button>
                                <Link href={route('eleves.index')}>
                                    <Button className="h-10 rounded-xl bg-gradient-to-r from-[#1a56db] to-[#0e3fa3] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(26,86,219,0.3)] hover:opacity-95">
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Retour
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mt-4 grid gap-[14px] md:grid-cols-2 xl:grid-cols-4">
                        <article className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#1a56db] to-[#0e3fa3] p-5 text-white">
                            <span className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/15" />
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80">Âge</p>
                            <p className="fraunces mt-2 text-[28px] font-bold leading-none">{`${age} ans`}</p>
                        </article>
                        <article className="rounded-[18px] border border-[#f0f0f0] bg-white p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">Situation financière</p>
                            <p className="fraunces mt-2 text-[28px] font-bold leading-none text-[#111827]">{stats_financieres.est_a_jour ? 'À jour' : 'En retard'}</p>
                            <p className="mt-2 text-xs font-medium text-[#6b7280]">Solde : {formatCurrency(paymentTotals.solde)}</p>
                        </article>
                        <article className="rounded-[18px] border border-[#f0f0f0] bg-white p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">Absences</p>
                            <p className="fraunces mt-2 text-[28px] font-bold leading-none text-[#111827]">{allAbsences.length}</p>
                        </article>
                        <article className="rounded-[18px] border border-[#f0f0f0] bg-white p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">Moyenne T1</p>
                            <p className="fraunces mt-2 text-[28px] font-bold leading-none text-[#111827]">{moyenneT1}</p>
                        </article>
                    </section>

                    <section className="mt-4 rounded-[20px] bg-white">
                        <div className="border-b border-[#f3f4f6] px-8 pt-4">
                            <div className="flex flex-wrap gap-7">
                                {tabs.map((tab) => (
                                    <button
                                        type="button"
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`border-b-[2.5px] pb-3 text-[15px] ${
                                            activeTab === tab
                                                ? 'border-[#1a56db] font-bold text-[#1a56db]'
                                                : 'border-transparent font-medium text-[#6b7280]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-8 py-7">{renderActiveTab()}</div>
                    </section>
                </main>
            </div>

            <Dialog open={showTransfertDialog} onOpenChange={setShowTransfertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transférer l'élève</DialogTitle>
                    </DialogHeader>
                    <Input value={ecoleDestination} onChange={(e) => setEcoleDestination(e.target.value)} placeholder="École de destination" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTransfertDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            className="bg-[#1a56a0]"
                            disabled={!ecoleDestination}
                            onClick={() => router.post(route('eleves.transferer', eleve.id), { ecole_destination: ecoleDestination })}
                        >
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
