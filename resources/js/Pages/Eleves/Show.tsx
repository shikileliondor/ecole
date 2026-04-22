import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ArrowRightLeft, ChevronLeft, Pencil } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import type { Absence, Classe, Eleve, Inscription, Note, Paiement, TypeFrais } from '@/types/eleve';

type Props = {
    eleve: Eleve;
    inscription_active: Inscription & { classe: Classe };
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

const tabs = ['Informations', 'Notes', 'Paiements', 'Absences', 'Historique'] as const;

export default function ElevesShow({ eleve, inscription_active, notes_par_trimestre, absences, stats_financieres }: Props) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Informations');
    const [showTransfertDialog, setShowTransfertDialog] = useState(false);
    const [ecoleDestination, setEcoleDestination] = useState('');

    const { auth } = usePage<AuthProps>().props;

    const age = useMemo(() => new Date().getFullYear() - new Date(eleve.date_naissance).getFullYear(), [eleve.date_naissance]);

    const moyenneT1 = useMemo(() => {
        const notes = notes_par_trimestre[1] ?? [];
        if (!notes.length) {
            return '—';
        }

        const total = notes.reduce((acc, note) => acc + (note.note ?? 0), 0);
        return `${(total / notes.length).toFixed(2)}/20`;
    }, [notes_par_trimestre]);

    const dateNaissance = useMemo(
        () =>
            new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(new Date(eleve.date_naissance)),
        [eleve.date_naissance],
    );

    const adminName = auth?.user?.name || 'Kouame Aka';
    const adminRole = auth?.roles?.[0]?.replace('_', ' ') || 'Super Admin';

    const infoRowsLeft = [
        { label: 'Nom complet', value: `${eleve.nom} ${eleve.prenoms}` },
        { label: 'Genre', value: eleve.sexe === 'M' ? 'Garçon' : 'Fille' },
        { label: 'Date de naissance', value: dateNaissance },
        { label: 'Lieu de naissance', value: `${eleve.lieu_naissance}, ${eleve.pays_naissance}` },
    ];

    const infoRowsRight = [
        { label: 'Établissement', value: 'Groupe Scolaire La Lumière' },
        { label: 'Année scolaire', value: inscription_active?.annee_scolaire?.libelle ?? '2025-2026' },
        { label: 'Classe', value: inscription_active?.classe?.nom ?? 'CE1 B', isBadge: true },
        { label: 'Bourse', value: eleve.est_boursier ? 'Boursier' : 'Non-boursier' },
    ];

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
                                <p className="text-xs font-medium text-[#6b7280]">{adminRole}</p>
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
                                        <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#1a56db]">{inscription_active?.classe?.niveau?.libelle ?? 'CE1'}</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]"><span className="h-2 w-2 rounded-full bg-[#22c55e]" />Actif</span>
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
                        </article>
                        <article className="rounded-[18px] border border-[#f0f0f0] bg-white p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">Absences ce trimestre</p>
                            <p className="fraunces mt-2 text-[28px] font-bold leading-none text-[#111827]">{absences.length}</p>
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

                        <div className="px-8 py-7">
                            {activeTab === 'Informations' ? (
                                <div className="grid gap-10 md:grid-cols-2">
                                    <div>
                                        <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#9ca3af]">IDENTITÉ</h3>
                                        <div className="mt-3">
                                            {infoRowsLeft.map((row) => (
                                                <div className="flex border-b border-[#f3f4f6] py-[10px]" key={row.label}>
                                                    <p className="w-[120px] text-[13px] text-[#9ca3af]">{row.label}</p>
                                                    <p className="text-[13px] font-semibold text-[#111827]">{row.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[#9ca3af]">SCOLARITÉ</h3>
                                        <div className="mt-3">
                                            {infoRowsRight.map((row) => (
                                                <div className="flex border-b border-[#f3f4f6] py-[10px]" key={row.label}>
                                                    <p className="w-[120px] text-[13px] text-[#9ca3af]">{row.label}</p>
                                                    {row.isBadge ? (
                                                        <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-[12px] font-semibold text-[#1a56db]">{row.value}</span>
                                                    ) : (
                                                        <p className="text-[13px] font-semibold text-[#111827]">{row.value}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[#6b7280]">Ce contenu sera affiché dans un prochain lot d'améliorations.</p>
                            )}
                        </div>
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
