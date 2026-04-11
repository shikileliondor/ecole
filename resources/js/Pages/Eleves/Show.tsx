import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, ChevronLeft, Download, FileText, Pencil, Plus, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import EleveAvatar from '@/Components/Eleves/EleveAvatar';
import NiveauBadge from '@/Components/Eleves/NiveauBadge';
import StatutBadge from '@/Components/Eleves/StatutBadge';
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

const tabs = ['Informations', 'Notes', 'Paiements', 'Absences', 'Historique'] as const;

export default function ElevesShow({ eleve, inscription_active, notes_par_trimestre, paiements, absences, stats_financieres, type_frais = [] }: Props) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Informations');
    const [trimestre, setTrimestre] = useState<1 | 2 | 3>(1);
    const [showPaiementDialog, setShowPaiementDialog] = useState(false);
    const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
    const [showTransfertDialog, setShowTransfertDialog] = useState(false);
    const [ecoleDestination, setEcoleDestination] = useState('');

    const paiementsForm = useForm({ inscription_id: inscription_active.id, type_frais_id: '', montant_paye: 0, mode_paiement: 'especes', reference_transaction: '', date_paiement: new Date().toISOString().slice(0, 10), note_caissier: '' });
    const absenceForm = useForm({ inscription_id: inscription_active.id, date_absence: new Date().toISOString().slice(0, 10), type: 'journee', motif: 'sans_motif', est_justifiee: false, parent_notifie: false, justificatif: null as File | null });

    const age = useMemo(() => new Date().getFullYear() - new Date(eleve.date_naissance).getFullYear(), [eleve.date_naissance]);
    const notesCourantes = notes_par_trimestre[trimestre] ?? [];

    const moyenneTrimestre = useMemo(() => {
        const notesValides = notesCourantes.filter((n) => n.note !== null && n.matiere?.coefficient);
        const totalCoef = notesValides.reduce((acc, note) => acc + (note.matiere?.coefficient ?? 0), 0);
        const somme = notesValides.reduce((acc, note) => acc + ((note.note ?? 0) * (note.matiere?.coefficient ?? 0)), 0);
        return totalCoef > 0 ? somme / totalCoef : null;
    }, [notesCourantes]);

    const mention = (value: number | null) => {
        if (value === null) return '—';
        if (value >= 16) return 'TB';
        if (value >= 14) return 'B';
        if (value >= 12) return 'AB';
        if (value >= 10) return 'Passable';
        return 'Insuffisant';
    };

    const montant = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
    const parents = eleve.parentsTuteurs ?? eleve.parents ?? [];

    return (
        <AppLayout title={`${eleve.nom} ${eleve.prenoms}`}>
            <Head title={`${eleve.nom} ${eleve.prenoms}`} />
            <div className="space-y-6">
                <section className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4"><EleveAvatar photo={eleve.photo} nom={eleve.nom} prenoms={eleve.prenoms} size="lg" /><div><h1 className="text-xl font-medium">{eleve.nom} {eleve.prenoms}</h1><div className="mt-1 flex items-center gap-2"><span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">{eleve.matricule}</span>{inscription_active?.classe?.niveau?.libelle ? <NiveauBadge niveau={inscription_active.classe.niveau.libelle} /> : null}<StatutBadge statut={eleve.statut} /></div></div></div>
                        <div className="flex gap-2"><Link href={route('eleves.edit', eleve.id)}><Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Modifier</Button></Link><Button variant="outline" onClick={() => setShowTransfertDialog(true)}><ArrowRightLeft className="mr-2 h-4 w-4" />Transférer</Button><Link href={route('eleves.index')}><Button variant="ghost"><ChevronLeft className="mr-2 h-4 w-4" />Retour</Button></Link></div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Âge</p><p className="text-xl font-semibold">{age} ans</p></div>
                    <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Situation financière</p>{stats_financieres.est_a_jour ? <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" />À jour</p> : <p className="text-red-600">{montant(stats_financieres.solde)} restants</p>}</div>
                    <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Absences ce trimestre</p><p className="text-xl font-semibold">{absences.length}</p></div>
                    <div className="rounded-xl border bg-white p-4"><p className="text-sm text-gray-500">Moyenne T1</p><p className="text-xl font-semibold">{notes_par_trimestre[1]?.length ? `${(notes_par_trimestre[1].reduce((a, n) => a + (n.note ?? 0), 0) / notes_par_trimestre[1].length).toFixed(2)}/20` : '—'}</p></div>
                </section>

                <section className="rounded-xl border bg-white p-4">
                    <div className="mb-4 flex flex-wrap gap-2">{tabs.map((tab) => <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} className={activeTab === tab ? 'bg-[#1a56a0] text-white' : ''} onClick={() => setActiveTab(tab)}>{tab}</Button>)}</div>

                    {activeTab === 'Informations' ? <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border p-4 text-sm"><h3 className="mb-3 font-medium">Infos élève</h3><p><strong>Identité:</strong> {eleve.nom} {eleve.prenoms}, {eleve.sexe === 'M' ? 'Garçon' : 'Fille'}</p><p><strong>Naissance:</strong> {eleve.date_naissance} à {eleve.lieu_naissance} ({eleve.pays_naissance})</p><p><strong>Scolarité:</strong> {eleve.situation_familiale ?? '—'} · {eleve.est_boursier ? 'Boursier' : 'Non boursier'}</p><p><strong>Établissement:</strong> {inscription_active?.annee_scolaire?.libelle ?? 'Année active'} · {inscription_active?.classe?.nom}</p></div><div className="space-y-3">{parents.map((parent) => <div key={parent.id} className="rounded-xl border p-4 text-sm"><div className="mb-2 flex items-center justify-between"><p className="font-medium">{parent.nom} {parent.prenoms} ({parent.lien})</p>{parent.pivot?.est_principal ? <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">Principal</span> : null}</div><p>Profession: {parent.profession ?? '—'}</p><p>Téléphone: {parent.telephone_1}</p>{parent.whatsapp ? <a className="text-green-600" href={`https://wa.me/${parent.whatsapp.replace(/\D/g, '')}`}>WhatsApp</a> : null}<p>Email: {parent.email ?? '—'}</p><p>Accès portail: <span className={parent.can_portal_access ? 'text-green-600' : 'text-gray-500'}>{parent.can_portal_access ? 'Actif' : 'Inactif'}</span></p><p>Peut récupérer: {parent.pivot?.peut_recuperer ? <CheckCircle2 className="inline h-4 w-4 text-green-600" /> : <XCircle className="inline h-4 w-4 text-red-600" />}</p></div>)}</div></div> : null}

                    {activeTab === 'Notes' ? <div>
                        <div className="mb-3 flex gap-2">{([1, 2, 3] as const).map((t) => <Button key={t} variant={trimestre === t ? 'default' : 'outline'} className={trimestre === t ? 'bg-[#1a56a0] text-white' : ''} onClick={() => setTrimestre(t)}>{`T${t}`}</Button>)}</div>
                        {notesCourantes.length === 0 ? <p className="text-sm text-gray-500">Notes pas encore saisies</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Matière</th><th>Code</th><th>Coef</th><th>Note /20</th><th>Appréciation</th><th>Rang</th></tr></thead><tbody>{notesCourantes.map((note) => <tr key={note.id} className="border-t"><td className="px-3 py-2">{note.matiere?.libelle}</td><td>{note.matiere?.code}</td><td>{note.matiere?.coefficient}</td><td>{note.note ?? '—'}</td><td>{note.appreciation ?? '—'}</td><td>{note.rang_classe ?? '—'}</td></tr>)}</tbody><tfoot><tr className="border-t font-medium"><td className="px-3 py-2">Moyenne générale</td><td>—</td><td>—</td><td>{moyenneTrimestre ? moyenneTrimestre.toFixed(2) : '—'}</td><td>{mention(moyenneTrimestre)}</td><td>{notesCourantes[0]?.rang_classe ?? '—'}</td></tr></tfoot></table></div>}
                        <Button className="mt-3" variant="outline" disabled={!notesCourantes.every((n) => n.est_validee)} onClick={() => window.open(route('bulletins.download', { inscription: inscription_active.id, trimestre }), '_blank')}><Download className="mr-2 h-4 w-4" />Télécharger bulletin T{trimestre}</Button>
                    </div> : null}

                    {activeTab === 'Paiements' ? <div>
                        <div className="grid gap-3 md:grid-cols-3"><div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Montant dû</p><p className="font-medium">{montant(stats_financieres.total_du)}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Montant payé</p><p className="font-medium text-green-600">{montant(stats_financieres.total_paye)}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-gray-500">Solde restant</p><p className={`font-medium ${stats_financieres.solde === 0 ? 'text-green-600' : 'text-red-600'}`}>{montant(stats_financieres.solde)}</p></div></div>
                        <div className="my-3 h-2 rounded-full bg-gray-100"><div className={`h-full rounded-full ${stats_financieres.total_paye >= stats_financieres.total_du ? 'bg-green-500' : stats_financieres.total_paye >= stats_financieres.total_du * 0.5 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.round((stats_financieres.total_paye / Math.max(1, stats_financieres.total_du)) * 100))}%` }} /></div>
                        <Button className="mb-3 bg-[#1a56a0]" onClick={() => setShowPaiementDialog(true)}><Plus className="mr-2 h-4 w-4" />Enregistrer un paiement</Button>
                        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Type frais</th><th>Attendu</th><th>Payé</th><th>Mode</th><th>Référence</th><th>Date</th><th>Statut</th><th>Reçu</th></tr></thead><tbody>{paiements.map((p) => <tr key={p.id} className="border-t"><td className="px-3 py-2">{p.type_frais?.libelle ?? '—'}</td><td>{montant(p.montant_attendu)}</td><td>{montant(p.montant_paye)}</td><td>{p.mode_paiement}</td><td>{p.reference_transaction ?? '—'}</td><td>{p.date_paiement}</td><td>{p.statut}</td><td><Button variant="ghost" size="icon-sm" onClick={() => window.open(route('paiements.recu', p.id), '_blank')}><FileText className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div>
                    </div> : null}

                    {activeTab === 'Absences' ? <div>
                        <div className="mb-3 grid grid-cols-3 gap-3"><div className="rounded-lg border p-3 text-sm">Justifiées: <span className="text-green-600">{absences.filter((a) => a.est_justifiee).length}</span></div><div className="rounded-lg border p-3 text-sm">Non justifiées: <span className="text-red-600">{absences.filter((a) => !a.est_justifiee).length}</span></div><div className="rounded-lg border p-3 text-sm">Total: {absences.length}</div></div>
                        <Button className="mb-3 bg-[#1a56a0]" onClick={() => setShowAbsenceDialog(true)}><Plus className="mr-2 h-4 w-4" />Signaler une absence</Button>
                        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Date</th><th>Type</th><th>Motif</th><th>Justifiée</th><th>Parent notifié</th></tr></thead><tbody>{absences.map((a) => <tr key={a.id} className="border-t"><td className="px-3 py-2">{a.date_absence}</td><td>{a.type === 'matin' ? 'Matin' : a.type === 'apres_midi' ? 'Après-midi' : 'Journée entière'}</td><td>{a.motif}</td><td>{a.est_justifiee ? <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Oui</span> : <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">Non</span>}</td><td>{a.parent_notifie ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />}</td></tr>)}</tbody></table></div>
                    </div> : null}

                    {activeTab === 'Historique' ? <div className="space-y-4">{(eleve.inscriptions ?? [inscription_active]).map((inscription, idx) => <div key={inscription.id} className="flex gap-3"><div className="flex flex-col items-center"><div className="h-4 w-4 rounded-full bg-[#1a56a0]" />{idx < (eleve.inscriptions ?? [inscription_active]).length - 1 ? <div className="h-12 w-0.5 bg-gray-200" /> : null}</div><div className="rounded-lg border p-3"><p className="font-medium">{inscription.annee_scolaire?.libelle ?? 'Année scolaire'}</p><p>Classe fréquentée: {inscription.classe?.nom ?? '—'}</p><p>Moyenne générale: —</p><span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Admis</span></div></div>)}</div> : null}
                </section>
            </div>

            <Dialog open={showTransfertDialog} onOpenChange={setShowTransfertDialog}><DialogContent><DialogHeader><DialogTitle>Transférer l'élève</DialogTitle></DialogHeader><Input value={ecoleDestination} onChange={(e) => setEcoleDestination(e.target.value)} placeholder="École de destination" /><DialogFooter><Button variant="outline" onClick={() => setShowTransfertDialog(false)}>Annuler</Button><Button className="bg-[#1a56a0]" disabled={!ecoleDestination} onClick={() => router.post(route('eleves.transferer', eleve.id), { ecole_destination: ecoleDestination })}>Confirmer</Button></DialogFooter></DialogContent></Dialog>

            <Dialog open={showPaiementDialog} onOpenChange={setShowPaiementDialog}><DialogContent><DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader><Select value={paiementsForm.data.type_frais_id || 'none'} onValueChange={(value) => { const selected = type_frais.find((f) => String(f.id) === value); paiementsForm.setData('type_frais_id', value === 'none' ? '' : value); paiementsForm.setData('montant_paye', selected?.montant ?? 0); }}><SelectTrigger className="w-full"><SelectValue placeholder="Type de frais" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{type_frais.map((tf) => <SelectItem key={tf.id} value={String(tf.id)}>{tf.libelle} ({montant(tf.montant)})</SelectItem>)}</SelectContent></Select><Input type="number" value={paiementsForm.data.montant_paye} onChange={(e) => paiementsForm.setData('montant_paye', Number(e.target.value))} placeholder="Montant à payer" /><Select value={paiementsForm.data.mode_paiement} onValueChange={(value) => paiementsForm.setData('mode_paiement', value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="especes">Espèces</SelectItem><SelectItem value="orange_money">Orange Money</SelectItem><SelectItem value="wave">Wave</SelectItem><SelectItem value="mtn_momo">MTN MoMo</SelectItem><SelectItem value="moov_money">Moov Money</SelectItem></SelectContent></Select>{paiementsForm.data.mode_paiement !== 'especes' ? <Input value={paiementsForm.data.reference_transaction} onChange={(e) => paiementsForm.setData('reference_transaction', e.target.value)} placeholder="Référence transaction" /> : null}<Input type="date" value={paiementsForm.data.date_paiement} onChange={(e) => paiementsForm.setData('date_paiement', e.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setShowPaiementDialog(false)}>Annuler</Button><Button className="bg-[#1a56a0]" onClick={() => paiementsForm.post(route('paiements.store'))}>Enregistrer</Button></DialogFooter></DialogContent></Dialog>

            <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}><DialogContent><DialogHeader><DialogTitle>Signaler une absence</DialogTitle></DialogHeader><Input type="date" value={absenceForm.data.date_absence} onChange={(e) => absenceForm.setData('date_absence', e.target.value)} /><Select value={absenceForm.data.type} onValueChange={(value) => absenceForm.setData('type', value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="matin">Matin</SelectItem><SelectItem value="apres_midi">Après-midi</SelectItem><SelectItem value="journee">Journée entière</SelectItem></SelectContent></Select><Select value={absenceForm.data.motif} onValueChange={(value) => absenceForm.setData('motif', value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="maladie">Maladie</SelectItem><SelectItem value="sans_motif">Sans motif</SelectItem><SelectItem value="deces_famille">Décès famille</SelectItem><SelectItem value="autre">Autre</SelectItem></SelectContent></Select><div className="flex items-center justify-between text-sm"><span>Justifiée</span><Switch checked={absenceForm.data.est_justifiee} onCheckedChange={(checked) => absenceForm.setData('est_justifiee', checked)} /></div>{absenceForm.data.est_justifiee ? <Input type="file" onChange={(e) => absenceForm.setData('justificatif', e.target.files?.[0] ?? null)} /> : null}<div className="flex items-center justify-between text-sm"><span>Parent notifié</span><Switch checked={absenceForm.data.parent_notifie} onCheckedChange={(checked) => absenceForm.setData('parent_notifie', checked)} /></div><DialogFooter><Button variant="outline" onClick={() => setShowAbsenceDialog(false)}>Annuler</Button><Button className="bg-[#1a56a0]" onClick={() => absenceForm.post(route('absences.store'))}>Enregistrer</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}
