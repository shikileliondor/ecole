import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import FeedbackAlert from '@/Components/ui/feedback-alert';
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
    | 'referentiels'
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
        slogan?: string;
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
    niveaux: Array<Item & { libelle: string; cycle: string; ordre?: number; description?: string }>;
    classes: Array<Item & { nom: string; niveau_id?: number; annee_scolaire_id?: number; capacite_max?: number; salle?: string; statut?: string; niveau?: { libelle: string }; anneeScolaire?: { libelle: string } }>;
    matieres: Array<Item & { libelle: string; code: string; coefficient: number; ordre_bulletin: number; est_notee: boolean; type_evaluation: string }>;
    typesFrais: Array<Item & { libelle: string; montant: number; frequence?: string; est_obligatoire?: boolean; niveau?: { libelle: string }; classe?: { nom: string } }>;
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
    const deviseInitiale =
        props.etablissement.devise && props.etablissement.devise.length <= 10
            ? props.etablissement.devise
            : 'XOF';
    const sloganInitial =
        props.etablissement.slogan ??
        (props.etablissement.devise && props.etablissement.devise.length > 10
            ? props.etablissement.devise
            : '');

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
        devise: deviseInitiale,
        slogan: sloganInitial,
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
    const [selectedPeriodeForComposition, setSelectedPeriodeForComposition] = useState<number | null>(null);
    const compositionParPeriodeForm = useForm({
        periode_academique_id: '',
        libelle: '',
        type: 'simple',
        bareme: Number(config('evaluations').bareme_principal ?? 20),
        seuil_validation: String(config('evaluations').seuil_validation ?? '10'),
        regle_moyenne: String(config('evaluations').regle_moyenne ?? 'ponderee_coefficient'),
        mode_arrondi: String(config('evaluations').mode_arrondi ?? 'dixieme_superieur'),
        appreciations_auto: String(config('evaluations').appreciations_auto ?? '>=16: Très bien\n>=14: Bien\n>=12: Assez bien\n>=10: Passable\n<10: Insuffisant'),
    });
    const [editingNiveauId, setEditingNiveauId] = useState<number | null>(null);
    const [editingClasseId, setEditingClasseId] = useState<number | null>(null);
    const [editingMatiereId, setEditingMatiereId] = useState<number | null>(null);
    const niveauForm = useForm({ libelle: '', cycle: 'CP', ordre: 1, description: '' });
    const classeForm = useForm({ nom: '', niveau_id: '', annee_scolaire_id: '', capacite_max: 40, salle: '', statut: 'active' });
    const matiereForm = useForm({ libelle: '', code: '', coefficient: 1, ordre_bulletin: 1, est_notee: true, type_evaluation: 'note' });
    const modeForm = useForm({ libelle: '' });
    const typeFraisForm = useForm({
        libelle: '',
        montant: 0,
        niveau_id: '',
        classe_id: '',
        frequence: 'unique',
        est_obligatoire: true,
    });
    const statutForm = useForm({ libelle: '' });
    const permissionForm = useForm({ name: '' });
    const roleForm = useForm({ name: '', permissions: [] as string[] });
    const modeleForm = useForm({ type_document: props.typesDocument[0] ?? 'bulletin', nom: '', description: '', template_html: '', est_defaut: false });

    const tabs = useMemo(
        () => [
            { id: 'general', label: 'Général' },
            { id: 'academique', label: 'Académique' },
            { id: 'referentiels', label: 'Référentiels' },
            { id: 'inscriptions', label: 'Inscriptions' },
            { id: 'finance', label: 'Finance' },
            { id: 'evaluations', label: 'Évaluations' },
            { id: 'absences', label: 'Absences & discipline' },
            { id: 'utilisateurs', label: 'Utilisateurs & accès' },
            { id: 'documents', label: 'Documents' },
        ] satisfies Array<{ id: TabId; label: string }>,
        [],
    );
    const anneeActive = props.annees.find((annee) => annee.est_active);

    const resetNiveauForm = () => {
        setEditingNiveauId(null);
        niveauForm.reset();
        niveauForm.setData({ libelle: '', cycle: 'CP', ordre: 1, description: '' });
    };

    const resetClasseForm = () => {
        setEditingClasseId(null);
        classeForm.reset();
        classeForm.setData({
            nom: '',
            niveau_id: '',
            annee_scolaire_id: anneeActive ? String(anneeActive.id) : '',
            capacite_max: 40,
            salle: '',
            statut: 'active',
        });
    };

    const resetMatiereForm = () => {
        setEditingMatiereId(null);
        matiereForm.reset();
        matiereForm.setData({ libelle: '', code: '', coefficient: 1, ordre_bulletin: 1, est_notee: true, type_evaluation: 'note' });
    };

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
                                    <Input placeholder="Devise monétaire (XOF)" value={generalForm.data.devise} onChange={(e) => generalForm.setData('devise', e.target.value)} />
                                    <Input placeholder="Slogan de l'établissement" value={generalForm.data.slogan} onChange={(e) => generalForm.setData('slogan', e.target.value)} />
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
                                    <FeedbackAlert type="error" message={String(Object.values(generalForm.errors)[0])} />
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
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.annees.destroy', annee.id))}>Supprimer</Button>
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
                                <Table headers={['Période', 'Année scolaire', 'Début', 'Fin', 'Action']}>
                                    {props.periodes.map((periode) => (
                                        <tr key={periode.id}>
                                            <td className="px-4 py-3">{periode.libelle}</td>
                                            <td className="px-4 py-3">{periode.anneeScolaire?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">{formatDate(periode.date_debut)}</td>
                                            <td className="px-4 py-3">{formatDate(periode.date_fin)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedPeriodeForComposition(periode.id);
                                                            compositionParPeriodeForm.setData('periode_academique_id', String(periode.id));
                                                            compositionParPeriodeForm.setData('libelle', `Composition ${periode.libelle}`);
                                                        }}
                                                    >
                                                        Ajouter composition
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.periodes.destroy', periode.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                            {selectedPeriodeForComposition ? (
                                <form
                                    className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        compositionParPeriodeForm.post(route('notes-bulletins.compositions.store'), {
                                            onSuccess: () => {
                                                compositionParPeriodeForm.setData('libelle', '');
                                                setSelectedPeriodeForComposition(null);
                                            },
                                        });
                                    }}
                                >
                                    <Input
                                        placeholder="Libellé composition"
                                        value={compositionParPeriodeForm.data.libelle}
                                        onChange={(e) => compositionParPeriodeForm.setData('libelle', e.target.value)}
                                    />
                                    <select className="rounded-md border border-slate-200 p-2 text-sm" value={compositionParPeriodeForm.data.type} onChange={(e) => compositionParPeriodeForm.setData('type', e.target.value)}>
                                        <option value="simple">Simple</option>
                                        <option value="passage">Passage</option>
                                    </select>
                                    <Input type="number" min={1} max={100} value={compositionParPeriodeForm.data.bareme} onChange={(e) => compositionParPeriodeForm.setData('bareme', Number(e.target.value || 20))} />
                                    <Input value={compositionParPeriodeForm.data.seuil_validation} onChange={(e) => compositionParPeriodeForm.setData('seuil_validation', e.target.value)} />
                                    <select className="rounded-md border border-slate-200 p-2 text-sm" value={compositionParPeriodeForm.data.regle_moyenne} onChange={(e) => compositionParPeriodeForm.setData('regle_moyenne', e.target.value)}>
                                        <option value="simple">Moyenne simple</option>
                                        <option value="ponderee_coefficient">Moyenne pondérée</option>
                                    </select>
                                    <select className="rounded-md border border-slate-200 p-2 text-sm" value={compositionParPeriodeForm.data.mode_arrondi} onChange={(e) => compositionParPeriodeForm.setData('mode_arrondi', e.target.value)}>
                                        <option value="unite_inferieure">Unité inférieure</option>
                                        <option value="unite_superieure">Unité supérieure</option>
                                        <option value="demi_point">Demi-point</option>
                                        <option value="dixieme_inferieur">Dixième inférieur</option>
                                        <option value="dixieme_superieur">Dixième supérieur</option>
                                    </select>
                                    <div className="md:col-span-2">
                                        <Textarea
                                            rows={3}
                                            value={compositionParPeriodeForm.data.appreciations_auto}
                                            onChange={(e) => compositionParPeriodeForm.setData('appreciations_auto', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setSelectedPeriodeForComposition(null)}>Annuler</Button>
                                        <Button type="submit">Créer la composition du trimestre</Button>
                                    </div>
                                </form>
                            ) : null}
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

                {activeTab === 'referentiels' ? (
                    <div className="space-y-4">
                        <Section title="Niveaux" subtitle="Structure pédagogique utilisée dans les classes, inscriptions et frais.">
                            <form
                                className="grid gap-2 md:grid-cols-5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingNiveauId) {
                                        niveauForm.patch(route('parametres.niveaux.update', editingNiveauId), { onSuccess: () => resetNiveauForm() });
                                        return;
                                    }
                                    niveauForm.post(route('parametres.niveaux.store'), { onSuccess: () => resetNiveauForm() });
                                }}
                            >
                                <Input placeholder="CP1" value={niveauForm.data.libelle} onChange={(e) => niveauForm.setData('libelle', e.target.value)} />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={niveauForm.data.cycle} onChange={(e) => niveauForm.setData('cycle', e.target.value)}>
                                    <option value="CP">CP</option>
                                    <option value="CE">CE</option>
                                    <option value="CM">CM</option>
                                </select>
                                <Input type="number" min={1} value={niveauForm.data.ordre} onChange={(e) => niveauForm.setData('ordre', Number(e.target.value || 1))} />
                                <Input placeholder="Description (optionnel)" value={niveauForm.data.description} onChange={(e) => niveauForm.setData('description', e.target.value)} />
                                <div className="flex gap-2">
                                    <Button type="submit">{editingNiveauId ? 'Mettre à jour' : 'Ajouter'}</Button>
                                    {editingNiveauId ? <Button type="button" variant="outline" onClick={resetNiveauForm}>Annuler</Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Libellé', 'Cycle', 'Ordre', 'Actions']}>
                                    {props.niveaux.map((niveau) => (
                                        <tr key={niveau.id}>
                                            <td className="px-4 py-3">{niveau.libelle}</td>
                                            <td className="px-4 py-3">{niveau.cycle}</td>
                                            <td className="px-4 py-3">{String(niveau.ordre ?? '-')}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingNiveauId(niveau.id);
                                                        niveauForm.setData({
                                                            libelle: String(niveau.libelle ?? ''),
                                                            cycle: String(niveau.cycle ?? 'CP'),
                                                            ordre: Number(niveau.ordre ?? 1),
                                                            description: String(niveau.description ?? ''),
                                                        });
                                                    }}>Modifier</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.niveaux.destroy', niveau.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Classes" subtitle="Classes par niveau et année scolaire, utilisées dans tous les modules.">
                            <form
                                className="grid gap-2 md:grid-cols-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingClasseId) {
                                        classeForm.patch(route('parametres.classes.update', editingClasseId), { onSuccess: () => resetClasseForm() });
                                        return;
                                    }
                                    classeForm.post(route('parametres.classes.store'), { onSuccess: () => resetClasseForm() });
                                }}
                            >
                                <Input placeholder="6e A" value={classeForm.data.nom} onChange={(e) => classeForm.setData('nom', e.target.value)} />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={classeForm.data.niveau_id} onChange={(e) => classeForm.setData('niveau_id', e.target.value)}>
                                    <option value="">Niveau</option>
                                    {props.niveaux.map((niveau) => <option key={niveau.id} value={String(niveau.id)}>{niveau.libelle}</option>)}
                                </select>
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={classeForm.data.annee_scolaire_id} onChange={(e) => classeForm.setData('annee_scolaire_id', e.target.value)}>
                                    <option value="">Année scolaire</option>
                                    {props.annees.map((annee) => <option key={annee.id} value={String(annee.id)}>{annee.libelle}</option>)}
                                </select>
                                <Input type="number" min={1} value={classeForm.data.capacite_max} onChange={(e) => classeForm.setData('capacite_max', Number(e.target.value || 40))} />
                                <Input placeholder="Salle (optionnel)" value={classeForm.data.salle} onChange={(e) => classeForm.setData('salle', e.target.value)} />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={classeForm.data.statut} onChange={(e) => classeForm.setData('statut', e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <div className="md:col-span-2 flex gap-2 justify-end">
                                    <Button type="submit">{editingClasseId ? 'Mettre à jour' : 'Ajouter'}</Button>
                                    {editingClasseId ? <Button type="button" variant="outline" onClick={resetClasseForm}>Annuler</Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Classe', 'Niveau', 'Année', 'Statut', 'Actions']}>
                                    {props.classes.map((classe) => (
                                        <tr key={classe.id}>
                                            <td className="px-4 py-3">{classe.nom}</td>
                                            <td className="px-4 py-3">{classe.niveau?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">{classe.anneeScolaire?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">{classe.statut === 'inactive' ? 'Inactive' : 'Active'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingClasseId(classe.id);
                                                        classeForm.setData({
                                                            nom: String(classe.nom ?? ''),
                                                            niveau_id: classe.niveau_id ? String(classe.niveau_id) : '',
                                                            annee_scolaire_id: classe.annee_scolaire_id ? String(classe.annee_scolaire_id) : '',
                                                            capacite_max: Number(classe.capacite_max ?? 40),
                                                            salle: String(classe.salle ?? ''),
                                                            statut: String(classe.statut ?? 'active'),
                                                        });
                                                    }}>Modifier</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.classes.destroy', classe.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Matières" subtitle="Matières utilisées pour la saisie des notes et bulletins.">
                            <form
                                className="grid gap-2 md:grid-cols-5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingMatiereId) {
                                        matiereForm.patch(route('parametres.matieres.update', editingMatiereId), { onSuccess: () => resetMatiereForm() });
                                        return;
                                    }
                                    matiereForm.post(route('parametres.matieres.store'), { onSuccess: () => resetMatiereForm() });
                                }}
                            >
                                <Input placeholder="Mathématiques" value={matiereForm.data.libelle} onChange={(e) => matiereForm.setData('libelle', e.target.value)} />
                                <Input placeholder="MATH" value={matiereForm.data.code} onChange={(e) => matiereForm.setData('code', e.target.value)} />
                                <Input type="number" min={1} value={matiereForm.data.coefficient} onChange={(e) => matiereForm.setData('coefficient', Number(e.target.value || 1))} />
                                <Input type="number" min={1} value={matiereForm.data.ordre_bulletin} onChange={(e) => matiereForm.setData('ordre_bulletin', Number(e.target.value || 1))} />
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={matiereForm.data.type_evaluation} onChange={(e) => matiereForm.setData('type_evaluation', e.target.value)}>
                                    <option value="note">Notée</option>
                                    <option value="appreciation">Appréciation</option>
                                </select>
                                <label className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2 flex items-center gap-2">
                                    <Checkbox checked={matiereForm.data.est_notee} onCheckedChange={(checked) => matiereForm.setData('est_notee', Boolean(checked))} />
                                    Matière notée
                                </label>
                                <div className="md:col-span-3 flex justify-end gap-2">
                                    <Button type="submit">{editingMatiereId ? 'Mettre à jour' : 'Ajouter'}</Button>
                                    {editingMatiereId ? <Button type="button" variant="outline" onClick={resetMatiereForm}>Annuler</Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Matière', 'Code', 'Coef.', 'Ordre', 'Type', 'Actions']}>
                                    {props.matieres.map((matiere) => (
                                        <tr key={matiere.id}>
                                            <td className="px-4 py-3">{matiere.libelle}</td>
                                            <td className="px-4 py-3">{matiere.code}</td>
                                            <td className="px-4 py-3">{String(matiere.coefficient)}</td>
                                            <td className="px-4 py-3">{String(matiere.ordre_bulletin)}</td>
                                            <td className="px-4 py-3">{matiere.type_evaluation}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingMatiereId(matiere.id);
                                                        matiereForm.setData({
                                                            libelle: String(matiere.libelle ?? ''),
                                                            code: String(matiere.code ?? ''),
                                                            coefficient: Number(matiere.coefficient ?? 1),
                                                            ordre_bulletin: Number(matiere.ordre_bulletin ?? 1),
                                                            est_notee: Boolean(matiere.est_notee ?? true),
                                                            type_evaluation: String(matiere.type_evaluation ?? 'note'),
                                                        });
                                                    }}>Modifier</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.matieres.destroy', matiere.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>
                    </div>
                ) : null}

                {activeTab === 'inscriptions' ? (
                    <div className="space-y-4">
                        <Section title="Référentiels d'inscription" subtitle="Statuts métier visibles par les gestionnaires.">
                            <form className="grid gap-2 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); statutForm.post(route('parametres.statuts-inscription.store')); }}>
                                <Input placeholder="Préinscrit" value={statutForm.data.libelle} onChange={(e) => statutForm.setData('libelle', e.target.value)} />
                                <Button type="submit">Ajouter le statut</Button>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Statut', 'Action']}>
                                    {props.statutsInscription.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.libelle}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.statuts-inscription.destroy', item.id))}>Supprimer</Button>
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
                            <form className="grid gap-2 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); modeForm.post(route('parametres.modes-paiement.store')); }}>
                                <Input placeholder="Orange Money" value={modeForm.data.libelle} onChange={(e) => modeForm.setData('libelle', e.target.value)} />
                                <Button type="submit">Ajouter</Button>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Libellé', 'Action']}>
                                    {props.modesPaiement.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.libelle}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.modes-paiement.destroy', item.id))}>Supprimer</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Frais configurés" subtitle="Référentiel des frais scolaires déjà disponibles.">
                            <form
                                className="mb-4 grid gap-2 md:grid-cols-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    typeFraisForm.post(route('parametres.types-frais.store'), {
                                        onSuccess: () => typeFraisForm.reset('libelle', 'montant', 'niveau_id', 'classe_id'),
                                    });
                                }}
                            >
                                <Input placeholder="Scolarité 6e" value={typeFraisForm.data.libelle} onChange={(e) => typeFraisForm.setData('libelle', e.target.value)} />
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Montant (FCFA)"
                                    value={typeFraisForm.data.montant}
                                    onChange={(e) => typeFraisForm.setData('montant', Number(e.target.value || 0))}
                                />
                                <select
                                    className="rounded-md border border-slate-200 p-2 text-sm"
                                    value={typeFraisForm.data.classe_id}
                                    onChange={(e) => typeFraisForm.setData('classe_id', e.target.value)}
                                >
                                    <option value="">Toutes classes</option>
                                    {props.classes.map((classe) => (
                                        <option key={classe.id} value={String(classe.id)}>
                                            {classe.nom}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="rounded-md border border-slate-200 p-2 text-sm"
                                    value={typeFraisForm.data.niveau_id}
                                    onChange={(e) => typeFraisForm.setData('niveau_id', e.target.value)}
                                    disabled={typeFraisForm.data.classe_id !== ''}
                                >
                                    <option value="">Tous niveaux</option>
                                    {props.niveaux.map((niveau) => (
                                        <option key={niveau.id} value={String(niveau.id)}>
                                            {niveau.libelle}
                                        </option>
                                    ))}
                                </select>
                                <select className="rounded-md border border-slate-200 p-2 text-sm" value={typeFraisForm.data.frequence} onChange={(e) => typeFraisForm.setData('frequence', e.target.value)}>
                                    <option value="unique">Unique</option>
                                    <option value="trimestriel">Trimestriel</option>
                                    <option value="mensuel">Mensuel</option>
                                </select>
                                <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 text-sm">
                                    <Checkbox checked={typeFraisForm.data.est_obligatoire} onCheckedChange={(checked) => typeFraisForm.setData('est_obligatoire', Boolean(checked))} />
                                    Frais obligatoire
                                </label>
                                <div className="md:col-span-3 flex justify-end">
                                    <Button type="submit">Ajouter le frais</Button>
                                </div>
                            </form>
                            <Table headers={['Type de frais', 'Portée', 'Fréquence', 'Montant', 'Action']}>
                                {props.typesFrais.map((frais) => (
                                    <tr key={frais.id}>
                                        <td className="px-4 py-3">{frais.libelle}</td>
                                        <td className="px-4 py-3">{frais.classe?.nom ? `Classe ${frais.classe.nom}` : (frais.niveau?.libelle ?? 'Tous niveaux')}</td>
                                        <td className="px-4 py-3">{frais.frequence ?? '-'}</td>
                                        <td className="px-4 py-3">{formatMoney(Number(frais.montant))} FCFA</td>
                                        <td className="px-4 py-3">
                                            <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.types-frais.destroy', frais.id))}>Supprimer</Button>
                                        </td>
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
                            <div className="mt-3">
                                <Table headers={['Permission', 'Action']}>
                                    {props.permissions.map((permission) => (
                                        <tr key={permission.id}>
                                            <td className="px-4 py-3">{permission.name}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.permissions.destroy', permission.id))}>Supprimer</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
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
                                <Table headers={['Rôle', 'Permissions associées', 'Action']}>
                                    {props.roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="px-4 py-3 font-medium">{role.name}</td>
                                            <td className="px-4 py-3">{role.permissions.map((permission) => permission.name).join(', ') || '-'}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.roles.destroy', role.id))}>Supprimer</Button>
                                            </td>
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
                                <Table headers={['Type', 'Nom', 'Description', 'Défaut', 'Action']}>
                                    {props.modelesImpression.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.type_document}</td>
                                            <td className="px-4 py-3">{item.nom}</td>
                                            <td className="px-4 py-3">{item.description || '-'}</td>
                                            <td className="px-4 py-3">{item.est_defaut ? 'Oui' : 'Non'}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.modeles-impression.destroy', item.id))}>Supprimer</Button>
                                            </td>
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
