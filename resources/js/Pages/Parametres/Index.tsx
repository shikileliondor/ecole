import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Textarea } from '@/Components/ui/textarea';
import Section from './components/Section';
import Table from './components/Table';
import TabButton from './components/TabButton';

type Item = { id: number; [key: string]: unknown };

type TabId =
    | 'general'
    | 'academique'
    | 'inscriptions'
    | 'finance'
    | 'evaluations'
    | 'absences'
    | 'utilisateurs'
    | 'documents';

type Props = {
    etablissement: {
        nom: string;
        sigle?: string;
        site_web?: string;
        contact_email?: string;
        contact_telephone: string;
        contact_whatsapp?: string;
        localisation_ville: string;
        localisation_commune?: string;
        localisation_quartier?: string;
        adresse?: string;
        pays?: string;
        code_postal?: string;
        devise?: string;
        langue_defaut?: string;
        fuseau_horaire?: string;
        format_date?: string;
        directeur_nom?: string;
        agrement_mena?: string;
        annee_creation?: number;
    };
    configs: Record<string, Record<string, unknown>>;
    annees: Array<Item & { libelle: string; date_debut: string; date_fin: string; est_active: boolean }>;
    periodes: Array<Item & { libelle: string; date_debut: string; date_fin: string; ordre: number; annee_scolaire_id: number; anneeScolaire?: { libelle: string } }>;
    niveaux: Array<Item & { libelle: string; cycle: string }>;
    classes: Array<Item & { nom: string; niveau?: { libelle: string } }>;
    matieres: Array<Item & { libelle: string; coefficient: number }>;
    typesFrais: Array<Item & { libelle: string; montant: number; niveau?: { libelle: string } }>;
    modesPaiement: Array<Item & { libelle: string; code?: string; ordre: number; est_actif: boolean }>;
    statutsInscription: Array<Item & { libelle: string; code?: string; ordre: number; est_actif: boolean }>;
    roles: Array<Item & { name: string; permissions: Array<{ name: string }> }>;
    permissions: Array<Item & { name: string }>;
    modelesImpression: Array<Item & { type_document: string; nom: string; description?: string; est_defaut: boolean }>;
    typesDocument: string[];
};
const formatDate = (value: string): string => {
    if (!value) return '-';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR').format(date);
};

const formatMoney = (amount: number): string => new Intl.NumberFormat('fr-FR').format(amount ?? 0);

export default function ParametresIndex(props: Props) {
    const [activeTab, setActiveTab] = useState<TabId>('general');

    const config = (key: string) => props.configs[key] ?? {};

    const generalForm = useForm({
        nom: props.etablissement.nom ?? '',
        sigle: props.etablissement.sigle ?? '',
        contact_email: props.etablissement.contact_email ?? '',
        contact_telephone: props.etablissement.contact_telephone ?? '',
        contact_whatsapp: props.etablissement.contact_whatsapp ?? '',
        site_web: props.etablissement.site_web ?? '',
        localisation_ville: props.etablissement.localisation_ville ?? '',
        localisation_commune: props.etablissement.localisation_commune ?? '',
        localisation_quartier: props.etablissement.localisation_quartier ?? '',
        adresse: props.etablissement.adresse ?? '',
        pays: props.etablissement.pays ?? "Côte d'Ivoire",
        code_postal: props.etablissement.code_postal ?? '',
        devise: props.etablissement.devise ?? 'XOF',
        langue_defaut: props.etablissement.langue_defaut ?? 'fr',
        fuseau_horaire: props.etablissement.fuseau_horaire ?? 'Africa/Abidjan',
        format_date: props.etablissement.format_date ?? 'DD/MM/YYYY',
        directeur_nom: props.etablissement.directeur_nom ?? '',
        agrement_mena: props.etablissement.agrement_mena ?? '',
        annee_creation: props.etablissement.annee_creation ? String(props.etablissement.annee_creation) : '',
    });

    const inscriptionsConfigForm = useForm({
        donnees: {
            regle_matricule: String(config('inscriptions').regle_matricule ?? 'ANNEE-NIVEAU-COMPTEUR'),
            format_matricule: String(config('inscriptions').format_matricule ?? '{annee}-{niveau}-{compteur:04}'),
            boursier_par_defaut: Boolean(config('inscriptions').boursier_par_defaut ?? false),
            age_par_niveau: String(config('inscriptions').age_par_niveau ?? 'CP1: 5-7\nCP2: 6-8'),
            documents_requis: String(config('inscriptions').documents_requis ?? 'Extrait de naissance\nCertificat de scolarité'),
        },
    });

    const financeConfigForm = useForm({
        donnees: {
            prefixe_recu: String(config('finance').prefixe_recu ?? 'REC'),
            prochain_numero_recu: String(config('finance').prochain_numero_recu ?? '000001'),
            politique_echeance: String(config('finance').politique_echeance ?? 'Mensuelle du 05 au 10'),
            remises_autorisees: Boolean(config('finance').remises_autorisees ?? true),
            penalites_retard: String(config('finance').penalites_retard ?? '2% après le 15 du mois'),
        },
    });

    const evalConfigForm = useForm({
        donnees: {
            bareme_principal: Number(config('evaluations').bareme_principal ?? 20),
            mode_arrondi: String(config('evaluations').mode_arrondi ?? 'dixieme_superieur'),
            seuil_validation: String(config('evaluations').seuil_validation ?? '10'),
            regle_moyenne: String(config('evaluations').regle_moyenne ?? 'ponderee_coefficient'),
            appreciations_auto: String(config('evaluations').appreciations_auto ?? '>=16: Très bien\n>=14: Bien\n>=12: Assez bien\n>=10: Passable\n<10: Insuffisant'),
        },
    });

    const absencesConfigForm = useForm({
        donnees: {
            types_absence: String(config('absences').types_absence ?? 'Maladie\nRetard\nAbsence injustifiée\nDispense'),
            motifs: String(config('absences').motifs ?? 'Médical\nFamilial\nTransport\nAdministratif'),
            statuts_justification: String(config('absences').statuts_justification ?? 'En attente\nJustifiée\nNon justifiée'),
            sanctions: String(config('absences').sanctions ?? 'Avertissement\nBlâme\nConvocation parent'),
            types_incident: String(config('absences').types_incident ?? 'Indiscipline\nViolence\nDégradation'),
            niveaux_gravite: String(config('absences').niveaux_gravite ?? 'Faible\nMoyenne\nÉlevée'),
        },
    });

    const documentsConfigForm = useForm({
        donnees: {
            entete: String(config('documents').entete ?? "République de Côte d'Ivoire\nUnion - Discipline - Travail"),
            pied_page: String(config('documents').pied_page ?? 'Document généré par le système scolaire'),
            signature: String(config('documents').signature ?? 'Le Directeur'),
            cachet: String(config('documents').cachet ?? 'Cachet de l\'établissement'),
            variables: String(config('documents').variables ?? '{{eleve_nom}}, {{classe}}, {{annee_scolaire}}, {{moyenne_generale}}'),
        },
    });

    const anneeForm = useForm({ libelle: '', date_debut: '', date_fin: '' });
    const periodeForm = useForm({ annee_scolaire_id: '', libelle: '', date_debut: '', date_fin: '', ordre: 1 });
    const modeForm = useForm({ libelle: '', code: '', ordre: 1 });
    const statutForm = useForm({ libelle: '', code: '', ordre: 1 });
    const permissionForm = useForm({ name: '' });
    const roleForm = useForm({ name: '', permissions: [] as string[] });
    const modeleForm = useForm({ type_document: props.typesDocument[0] ?? 'bulletin', nom: '', description: '', template_html: '', est_defaut: false });

    const tabs = useMemo(
        () => [
            { id: 'general', label: 'Général' },
            { id: 'academique', label: 'Académique' },
            { id: 'inscriptions', label: 'Inscriptions' },
            { id: 'finance', label: 'Finance' },
            { id: 'evaluations', label: 'Évaluations' },
            { id: 'absences', label: 'Absences & discipline' },
            { id: 'utilisateurs', label: 'Utilisateurs & accès' },
            { id: 'documents', label: 'Documents' },
        ] satisfies Array<{ id: TabId; label: string }>,
        [],
    );

    return (
        <AppLayout title="Paramètres">
            <Head title="Paramètres" />

            <div className="space-y-6">
                <header className="rounded-xl border border-slate-200 bg-white p-6">
                    <h1 className="text-2xl font-bold text-slate-900">Centre de configuration</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Configurez votre ERP scolaire avant l'utilisation des modules Inscriptions, Notes, Paiements, Utilisateurs et Bulletins.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 rounded-lg bg-slate-100 p-2">
                        {tabs.map((tab) => (
                            <TabButton key={tab.id} active={activeTab === tab.id} label={tab.label} onClick={() => setActiveTab(tab.id)} />
                        ))}
                    </div>
                </header>

                {activeTab === 'general' ? (
                    <div className="space-y-4">
                        <Section title="Informations de l'établissement" subtitle="Identité, contact et localisation affichés dans tout le système.">
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    generalForm.transform((data) => ({ ...data, annee_creation: data.annee_creation ? Number(data.annee_creation) : null }));
                                    generalForm.patch(route('parametres.general.update'));
                                }}
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Input placeholder="Nom de l'école" value={generalForm.data.nom} onChange={(e) => generalForm.setData('nom', e.target.value)} />
                                    <Input placeholder="Sigle" value={generalForm.data.sigle} onChange={(e) => generalForm.setData('sigle', e.target.value)} />
                                    <Input placeholder="Email" value={generalForm.data.contact_email} onChange={(e) => generalForm.setData('contact_email', e.target.value)} />
                                    <Input placeholder="Téléphone" value={generalForm.data.contact_telephone} onChange={(e) => generalForm.setData('contact_telephone', e.target.value)} />
                                    <Input placeholder="WhatsApp" value={generalForm.data.contact_whatsapp} onChange={(e) => generalForm.setData('contact_whatsapp', e.target.value)} />
                                    <Input placeholder="Site web" value={generalForm.data.site_web} onChange={(e) => generalForm.setData('site_web', e.target.value)} />
                                    <Input placeholder="Ville" value={generalForm.data.localisation_ville} onChange={(e) => generalForm.setData('localisation_ville', e.target.value)} />
                                    <Input placeholder="Commune" value={generalForm.data.localisation_commune} onChange={(e) => generalForm.setData('localisation_commune', e.target.value)} />
                                    <Input placeholder="Quartier / adresse" value={generalForm.data.localisation_quartier} onChange={(e) => generalForm.setData('localisation_quartier', e.target.value)} />
                                    <Input placeholder="Adresse" value={generalForm.data.adresse} onChange={(e) => generalForm.setData('adresse', e.target.value)} />
                                    <Input placeholder="Pays" value={generalForm.data.pays} onChange={(e) => generalForm.setData('pays', e.target.value)} />
                                    <Input placeholder="Code postal / BP" value={generalForm.data.code_postal} onChange={(e) => generalForm.setData('code_postal', e.target.value)} />
                                    <Input placeholder="Devise (XOF)" value={generalForm.data.devise} onChange={(e) => generalForm.setData('devise', e.target.value)} />
                                    <Input placeholder="Langue (fr)" value={generalForm.data.langue_defaut} onChange={(e) => generalForm.setData('langue_defaut', e.target.value)} />
                                    <Input placeholder="Fuseau horaire" value={generalForm.data.fuseau_horaire} onChange={(e) => generalForm.setData('fuseau_horaire', e.target.value)} />
                                    <Input placeholder="Format date" value={generalForm.data.format_date} onChange={(e) => generalForm.setData('format_date', e.target.value)} />
                                    <Input placeholder="Directeur" value={generalForm.data.directeur_nom} onChange={(e) => generalForm.setData('directeur_nom', e.target.value)} />
                                    <Input placeholder="Agrément MENA" value={generalForm.data.agrement_mena} onChange={(e) => generalForm.setData('agrement_mena', e.target.value)} />
                                    <Input placeholder="Année de création" value={generalForm.data.annee_creation} onChange={(e) => generalForm.setData('annee_creation', e.target.value)} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Enregistrer</Button>
                                </div>
                                {Object.keys(generalForm.errors).length > 0 ? (
                                    <p className="text-sm text-red-600">
                                        {Object.values(generalForm.errors)[0]}
                                    </p>
                                ) : null}
                            </form>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'academique' ? (
                    <div className="space-y-4">
                        <Section title="Années scolaires" subtitle="Définissez une seule année active pour piloter l'ERP.">
                            <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); anneeForm.post(route('parametres.annees.store')); }}>
                                <Input placeholder="2026-2027" value={anneeForm.data.libelle} onChange={(e) => anneeForm.setData('libelle', e.target.value)} />
                                <Input type="date" value={anneeForm.data.date_debut} onChange={(e) => anneeForm.setData('date_debut', e.target.value)} />
                                <Input type="date" value={anneeForm.data.date_fin} onChange={(e) => anneeForm.setData('date_fin', e.target.value)} />
                                <Button type="submit">Ajouter l'année</Button>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Libellé', 'Début', 'Fin', 'Statut', 'Actions']}>
                                    {props.annees.map((annee) => (
                                        <tr key={annee.id}>
                                            <td className="px-4 py-3">{annee.libelle}</td>
                                            <td className="px-4 py-3">{formatDate(annee.date_debut)}</td>
                                            <td className="px-4 py-3">{formatDate(annee.date_fin)}</td>
                                            <td className="px-4 py-3">
                                                {annee.est_active ? (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Active</span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {!annee.est_active ? (
                                                        <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.annees.activate', annee.id))}>Activer</Button>
                                                    ) : null}
                                                    <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.annees.close', annee.id))}>Clôturer</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.annees.reopen', annee.id))}>Réouvrir</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Périodes académiques" subtitle="Trimestres, semestres et découpage des évaluations.">
                            <form className="grid gap-2 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); periodeForm.post(route('parametres.periodes.store')); }}>
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={periodeForm.data.annee_scolaire_id} onChange={(e) => periodeForm.setData('annee_scolaire_id', e.target.value)}>
                                    <option value="">Année scolaire</option>
                                    {props.annees.map((annee) => <option key={annee.id} value={String(annee.id)}>{annee.libelle}</option>)}
                                </select>
                                <Input placeholder="Trimestre 1" value={periodeForm.data.libelle} onChange={(e) => periodeForm.setData('libelle', e.target.value)} />
                                <Input type="date" value={periodeForm.data.date_debut} onChange={(e) => periodeForm.setData('date_debut', e.target.value)} />
                                <Input type="date" value={periodeForm.data.date_fin} onChange={(e) => periodeForm.setData('date_fin', e.target.value)} />
                                <Input type="number" min={1} value={periodeForm.data.ordre} onChange={(e) => periodeForm.setData('ordre', Number(e.target.value))} />
                            </form>
                            <div className="mt-2 flex justify-end"><Button type="button" onClick={() => periodeForm.post(route('parametres.periodes.store'))}>Ajouter la période</Button></div>
                            <div className="mt-3">
                                <Table headers={['Ordre', 'Période', 'Année scolaire', 'Début', 'Fin']}>
                                    {props.periodes.map((periode) => (
                                        <tr key={periode.id}>
                                            <td className="px-4 py-3">{periode.ordre}</td>
                                            <td className="px-4 py-3">{periode.libelle}</td>
                                            <td className="px-4 py-3">{periode.anneeScolaire?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">{formatDate(periode.date_debut)}</td>
                                            <td className="px-4 py-3">{formatDate(periode.date_fin)}</td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Référentiels académiques exploités" subtitle="Ces référentiels alimentent classes, notes, bulletins et inscriptions.">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm text-slate-500">Niveaux</p><p className="text-2xl font-semibold">{props.niveaux.length}</p></div>
                                <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm text-slate-500">Classes</p><p className="text-2xl font-semibold">{props.classes.length}</p></div>
                                <div className="rounded-lg border border-slate-200 p-4"><p className="text-sm text-slate-500">Matières</p><p className="text-2xl font-semibold">{props.matieres.length}</p></div>
                            </div>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'inscriptions' ? (
                    <div className="space-y-4">
                        <Section title="Référentiels d'inscription" subtitle="Statuts métier visibles par les gestionnaires.">
                            <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); statutForm.post(route('parametres.statuts-inscription.store')); }}>
                                <Input placeholder="Préinscrit" value={statutForm.data.libelle} onChange={(e) => statutForm.setData('libelle', e.target.value)} />
                                <Input placeholder="preinscrit" value={statutForm.data.code} onChange={(e) => statutForm.setData('code', e.target.value)} />
                                <Input type="number" min={1} value={statutForm.data.ordre} onChange={(e) => statutForm.setData('ordre', Number(e.target.value))} />
                                <Button type="submit">Ajouter le statut</Button>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Statut', 'Code', 'Ordre', 'Actif', 'Action']}>
                                    {props.statutsInscription.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.libelle}</td>
                                            <td className="px-4 py-3">{item.code || '-'}</td>
                                            <td className="px-4 py-3">{item.ordre}</td>
                                            <td className="px-4 py-3">{item.est_actif ? 'Oui' : 'Non'}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.statuts-inscription.toggle', item.id))}>
                                                    {item.est_actif ? 'Désactiver' : 'Activer'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Règles d'admission" subtitle="Règles de matricule, boursier par défaut et pièces obligatoires.">
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); inscriptionsConfigForm.patch(route('parametres.config.update', 'inscriptions')); }}>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Input value={String(inscriptionsConfigForm.data.donnees.regle_matricule)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, regle_matricule: e.target.value })} placeholder="Règle matricule" />
                                    <Input value={String(inscriptionsConfigForm.data.donnees.format_matricule)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, format_matricule: e.target.value })} placeholder="Format matricule" />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-700"><Checkbox checked={Boolean(inscriptionsConfigForm.data.donnees.boursier_par_defaut)} onCheckedChange={(checked) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, boursier_par_defaut: Boolean(checked) })} /> Boursier par défaut</label>
                                <Textarea rows={4} value={String(inscriptionsConfigForm.data.donnees.documents_requis)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, documents_requis: e.target.value })} placeholder="Documents requis (une ligne = un document)" />
                                <Textarea rows={4} value={String(inscriptionsConfigForm.data.donnees.age_par_niveau)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, age_par_niveau: e.target.value })} placeholder="Âges par niveau" />
                                <div className="flex justify-end"><Button type="submit">Enregistrer</Button></div>
                            </form>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'finance' ? (
                    <div className="space-y-4">
                        <Section title="Modes de paiement" subtitle="Canaux autorisés en caisse et en ligne.">
                            <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); modeForm.post(route('parametres.modes-paiement.store')); }}>
                                <Input placeholder="Orange Money" value={modeForm.data.libelle} onChange={(e) => modeForm.setData('libelle', e.target.value)} />
                                <Input placeholder="orange_money" value={modeForm.data.code} onChange={(e) => modeForm.setData('code', e.target.value)} />
                                <Input type="number" min={1} value={modeForm.data.ordre} onChange={(e) => modeForm.setData('ordre', Number(e.target.value))} />
                                <Button type="submit">Ajouter</Button>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Libellé', 'Code', 'Ordre', 'Actif', 'Action']}>
                                    {props.modesPaiement.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.libelle}</td>
                                            <td className="px-4 py-3">{item.code || '-'}</td>
                                            <td className="px-4 py-3">{item.ordre}</td>
                                            <td className="px-4 py-3">{item.est_actif ? 'Oui' : 'Non'}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.modes-paiement.toggle', item.id))}>
                                                    {item.est_actif ? 'Désactiver' : 'Activer'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Frais configurés" subtitle="Référentiel des frais scolaires déjà disponibles.">
                            <Table headers={['Type de frais', 'Niveau', 'Montant']}>
                                {props.typesFrais.map((frais) => (
                                    <tr key={frais.id}>
                                        <td className="px-4 py-3">{frais.libelle}</td>
                                        <td className="px-4 py-3">{frais.niveau?.libelle ?? 'Tous niveaux'}</td>
                                        <td className="px-4 py-3">{formatMoney(Number(frais.montant))} FCFA</td>
                                    </tr>
                                ))}
                            </Table>
                        </Section>

                        <Section title="Règles financières" subtitle="Numérotation des reçus, échéances, remises et pénalités.">
                            <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); financeConfigForm.patch(route('parametres.config.update', 'finance')); }}>
                                <Input value={String(financeConfigForm.data.donnees.prefixe_recu)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, prefixe_recu: e.target.value })} placeholder="Préfixe reçu" />
                                <Input value={String(financeConfigForm.data.donnees.prochain_numero_recu)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, prochain_numero_recu: e.target.value })} placeholder="Prochain numéro" />
                                <Input value={String(financeConfigForm.data.donnees.politique_echeance)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, politique_echeance: e.target.value })} placeholder="Politique d'échéance" />
                                <Input value={String(financeConfigForm.data.donnees.penalites_retard)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, penalites_retard: e.target.value })} placeholder="Pénalités" />
                                <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2"><Checkbox checked={Boolean(financeConfigForm.data.donnees.remises_autorisees)} onCheckedChange={(checked) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, remises_autorisees: Boolean(checked) })} /> Autoriser les remises</label>
                                <div className="md:col-span-2 flex justify-end"><Button type="submit">Enregistrer</Button></div>
                            </form>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'evaluations' ? (
                    <Section title="Paramètres de notation" subtitle="Barèmes, arrondis, seuils et appréciations automatiques.">
                        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); evalConfigForm.patch(route('parametres.config.update', 'evaluations')); }}>
                            <div className="grid gap-3 md:grid-cols-2">
                                <Input type="number" min={1} value={Number(evalConfigForm.data.donnees.bareme_principal)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, bareme_principal: Number(e.target.value || 20) })} placeholder="Barème principal" />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={String(evalConfigForm.data.donnees.mode_arrondi)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, mode_arrondi: e.target.value })}>
                                    <option value="dixieme_superieur">Dixième supérieur</option>
                                    <option value="dixieme_inferieur">Dixième inférieur</option>
                                    <option value="demi_point">Demi-point</option>
                                    <option value="unite_superieure">Unité supérieure</option>
                                    <option value="unite_inferieure">Unité inférieure</option>
                                </select>
                                <Input value={String(evalConfigForm.data.donnees.seuil_validation)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, seuil_validation: e.target.value })} placeholder="Seuil de validation" />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={String(evalConfigForm.data.donnees.regle_moyenne)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, regle_moyenne: e.target.value })}>
                                    <option value="ponderee_coefficient">Moyenne pondérée par coefficient</option>
                                    <option value="simple">Moyenne simple</option>
                                </select>
                            </div>
                            <Textarea rows={6} value={String(evalConfigForm.data.donnees.appreciations_auto)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, appreciations_auto: e.target.value })} />
                            <div className="flex justify-end"><Button type="submit">Enregistrer</Button></div>
                        </form>
                    </Section>
                ) : null}

                {activeTab === 'absences' ? (
                    <Section title="Absences et discipline" subtitle="Paramètres partagés avec le suivi de présence et la vie scolaire.">
                        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); absencesConfigForm.patch(route('parametres.config.update', 'absences')); }}>
                            <div className="grid gap-3 md:grid-cols-2">
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.types_absence)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, types_absence: e.target.value })} placeholder="Types d'absence" />
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.motifs)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, motifs: e.target.value })} placeholder="Motifs" />
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.statuts_justification)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, statuts_justification: e.target.value })} placeholder="Statuts de justification" />
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.sanctions)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, sanctions: e.target.value })} placeholder="Types de sanctions" />
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.types_incident)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, types_incident: e.target.value })} placeholder="Types d'incidents disciplinaires" />
                                <Textarea rows={5} value={String(absencesConfigForm.data.donnees.niveaux_gravite)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, niveaux_gravite: e.target.value })} placeholder="Niveaux de gravité" />
                            </div>
                            <div className="flex justify-end"><Button type="submit">Enregistrer</Button></div>
                        </form>
                    </Section>
                ) : null}

                {activeTab === 'utilisateurs' ? (
                    <div className="space-y-4">
                        <Section title="Permissions" subtitle="Créez les permissions réutilisées par les rôles.">
                            <form className="flex flex-col gap-2 md:flex-row" onSubmit={(e) => { e.preventDefault(); permissionForm.post(route('parametres.permissions.store')); }}>
                                <Input placeholder="notes.create" value={permissionForm.data.name} onChange={(e) => permissionForm.setData('name', e.target.value)} />
                                <Button type="submit" variant="outline">Ajouter permission</Button>
                            </form>
                            <div className="mt-3 grid gap-2 md:grid-cols-3">
                                {props.permissions.map((permission) => (
                                    <div key={permission.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{permission.name}</div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Rôles et profils d'accès" subtitle="Associez des permissions pour créer un profil métier.">
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); roleForm.post(route('parametres.roles.store')); }}>
                                <Input placeholder="Responsable pédagogique" value={roleForm.data.name} onChange={(e) => roleForm.setData('name', e.target.value)} />
                                <div className="grid gap-2 md:grid-cols-2">
                                    {props.permissions.map((permission) => (
                                        <label key={permission.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm">
                                            <Checkbox checked={roleForm.data.permissions.includes(permission.name)} onCheckedChange={(checked) => {
                                                roleForm.setData('permissions', checked
                                                    ? [...roleForm.data.permissions, permission.name]
                                                    : roleForm.data.permissions.filter((p) => p !== permission.name));
                                            }} />
                                            {permission.name}
                                        </label>
                                    ))}
                                </div>
                                <div className="flex justify-end"><Button type="submit">Enregistrer le rôle</Button></div>
                            </form>

                            <div className="mt-4">
                                <Table headers={['Rôle', 'Permissions associées']}>
                                    {props.roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="px-4 py-3 font-medium">{role.name}</td>
                                            <td className="px-4 py-3">{role.permissions.map((permission) => permission.name).join(', ') || '-'}</td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'documents' ? (
                    <div className="space-y-4">
                        <Section title="Paramètres d'entête et de signature" subtitle="Appliqués par défaut dans les PDF.">
                            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); documentsConfigForm.patch(route('parametres.config.update', 'documents')); }}>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Textarea rows={4} value={String(documentsConfigForm.data.donnees.entete)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, entete: e.target.value })} placeholder="Entête" />
                                    <Textarea rows={4} value={String(documentsConfigForm.data.donnees.pied_page)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, pied_page: e.target.value })} placeholder="Pied de page" />
                                    <Input value={String(documentsConfigForm.data.donnees.signature)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, signature: e.target.value })} placeholder="Signature" />
                                    <Input value={String(documentsConfigForm.data.donnees.cachet)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, cachet: e.target.value })} placeholder="Cachet" />
                                </div>
                                <Textarea rows={3} value={String(documentsConfigForm.data.donnees.variables)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, variables: e.target.value })} placeholder="Variables disponibles" />
                                <div className="flex justify-end"><Button type="submit">Enregistrer</Button></div>
                            </form>
                        </Section>

                        <Section title="Modèles PDF" subtitle="Bulletins, reçus et cartes scolaires.">
                            <form className="grid gap-2 md:grid-cols-3" onSubmit={(e) => { e.preventDefault(); modeleForm.post(route('parametres.modeles-impression.store')); }}>
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={modeleForm.data.type_document} onChange={(e) => modeleForm.setData('type_document', e.target.value)}>
                                    {props.typesDocument.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                                <Input placeholder="Nom du modèle" value={modeleForm.data.nom} onChange={(e) => modeleForm.setData('nom', e.target.value)} />
                                <Input placeholder="Description" value={modeleForm.data.description} onChange={(e) => modeleForm.setData('description', e.target.value)} />
                                <div className="md:col-span-3"><Textarea rows={4} placeholder="Template HTML/PDF" value={modeleForm.data.template_html} onChange={(e) => modeleForm.setData('template_html', e.target.value)} /></div>
                                <label className="md:col-span-2 flex items-center gap-2 text-sm"><Checkbox checked={modeleForm.data.est_defaut} onCheckedChange={(checked) => modeleForm.setData('est_defaut', Boolean(checked))} /> Définir par défaut</label>
                                <div className="flex justify-end"><Button type="submit">Ajouter le modèle</Button></div>
                            </form>

                            <div className="mt-3">
                                <Table headers={['Type', 'Nom', 'Description', 'Défaut']}>
                                    {props.modelesImpression.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.type_document}</td>
                                            <td className="px-4 py-3">{item.nom}</td>
                                            <td className="px-4 py-3">{item.description || '-'}</td>
                                            <td className="px-4 py-3">{item.est_defaut ? 'Oui' : 'Non'}</td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
