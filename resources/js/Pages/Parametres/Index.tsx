import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Textarea } from '@/Components/ui/textarea';
import Section from './components/Section';
import Table from './components/Table';
import TabButton from './components/TabButton';
import { AlertCircle, CheckCircle2, ImagePlus, X } from 'lucide-react';

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
    | 'documents'
    | 'communication_sms';

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
        logo_url?: string;
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

const SEL = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

const formatDate = (value: string): string => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
};

const formatMoney = (amount: number): string => new Intl.NumberFormat('fr-FR').format(amount ?? 0);

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">
            {children}
            {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
    );
}

function FlashBanner() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${flash.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
            {flash.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            {flash.success ?? flash.error}
        </div>
    );
}

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

    // ── Logo preview ─────────────────────────────────────────────────────────
    const [logoPreview, setLogoPreview] = useState<string | null>(props.etablissement.logo_url ?? null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // ── Forms ─────────────────────────────────────────────────────────────────
    const generalForm = useForm<{
        nom: string; sigle: string; contact_email: string; contact_telephone: string;
        contact_whatsapp: string; site_web: string; localisation_ville: string;
        localisation_commune: string; localisation_quartier: string; adresse: string;
        pays: string; code_postal: string; devise: string; slogan: string;
        langue_defaut: string; fuseau_horaire: string; format_date: string;
        directeur_nom: string; agrement_mena: string; annee_creation: string;
        logo: File | null;
    }>({
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
        logo: null,
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
            cachet: String(config('documents').cachet ?? "Cachet de l'établissement"),
            variables: String(config('documents').variables ?? '{{eleve_nom}}, {{classe}}, {{annee_scolaire}}, {{moyenne_generale}}'),
        },
    });
    const communicationSmsConfigForm = useForm({
        donnees: {
            modele_relance_finance: String(config('communication_sms').modele_relance_finance ?? "Bonjour, ceci est un rappel de paiement. Merci de régulariser la situation de votre enfant."),
            modele_confirmation_paiement: String(config('communication_sms').modele_confirmation_paiement ?? 'Bonjour, nous confirmons la réception de votre paiement. Merci pour votre confiance.'),
            modele_rappel_inscription: String(config('communication_sms').modele_rappel_inscription ?? "Bonjour, la période d'inscription/réinscription est ouverte. Merci de finaliser les démarches."),
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
    const typeFraisForm = useForm({ libelle: '', montant: 0, niveau_id: '', classe_id: '', frequence: 'unique', est_obligatoire: true });
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
            { id: 'communication_sms', label: 'Communication SMS' },
        ] satisfies Array<{ id: TabId; label: string }>,
        [],
    );

    const anneeActive = props.annees.find((a) => a.est_active);

    const resetNiveauForm = () => {
        setEditingNiveauId(null);
        niveauForm.setData({ libelle: '', cycle: 'CP', ordre: 1, description: '' });
    };

    const resetClasseForm = () => {
        setEditingClasseId(null);
        classeForm.setData({ nom: '', niveau_id: '', annee_scolaire_id: anneeActive ? String(anneeActive.id) : '', capacite_max: 40, salle: '', statut: 'active' });
    };

    const resetMatiereForm = () => {
        setEditingMatiereId(null);
        matiereForm.setData({ libelle: '', code: '', coefficient: 1, ordre_bulletin: 1, est_notee: true, type_evaluation: 'note' });
    };

    return (
        <AppLayout title="Paramètres">
            <Head title="Paramètres" />

            <div className="space-y-6">
                {/* Header + tabs */}
                <header className="rounded-xl border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Centre de configuration</h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                        Configurez votre ERP scolaire avant l'utilisation des modules Inscriptions, Notes, Paiements, Utilisateurs et Bulletins.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 rounded-lg bg-slate-100 p-2 dark:bg-gray-700">
                        {tabs.map((tab) => (
                            <TabButton key={tab.id} active={activeTab === tab.id} label={tab.label} onClick={() => setActiveTab(tab.id)} />
                        ))}
                    </div>
                </header>

                <FlashBanner />

                {/* ── GÉNÉRAL ─────────────────────────────────────────────── */}
                {activeTab === 'general' ? (
                    <div className="space-y-4">
                        <Section title="Informations de l'établissement" subtitle="Identité, contact et localisation affichés dans tout le système et sur les exports PDF.">
                            <form
                                className="space-y-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    generalForm.transform((data) => ({
                                        ...data,
                                        annee_creation: data.annee_creation ? Number(data.annee_creation) : null,
                                        _method: 'PATCH',
                                    }));
                                    generalForm.post(route('parametres.general.update'), {
                                        forceFormData: true,
                                        preserveScroll: true,
                                        onSuccess: () => generalForm.setData('logo', null),
                                    });
                                }}
                            >
                                {/* Logo */}
                                <div>
                                    <Label>Logo de l'établissement</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-gray-600 dark:bg-gray-700">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <ImagePlus size={28} className="text-slate-400 dark:text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                ref={logoInputRef}
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    generalForm.setData('logo', file);
                                                    setLogoPreview(file ? URL.createObjectURL(file) : (props.etablissement.logo_url ?? null));
                                                }}
                                            />
                                            <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                                                Choisir une image
                                            </Button>
                                            {generalForm.data.logo ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        generalForm.setData('logo', null);
                                                        setLogoPreview(props.etablissement.logo_url ?? null);
                                                        if (logoInputRef.current) logoInputRef.current.value = '';
                                                    }}
                                                    className="ml-2 text-xs text-red-500 hover:underline"
                                                >
                                                    Annuler
                                                </button>
                                            ) : null}
                                            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">PNG, JPG ou WebP · max 2 Mo</p>
                                        </div>
                                    </div>
                                    <FieldError message={generalForm.errors.logo} />
                                </div>

                                {/* Identité */}
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Identité</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label required>Nom de l'établissement</Label>
                                            <Input value={generalForm.data.nom} onChange={(e) => generalForm.setData('nom', e.target.value)} placeholder="École Primaire Excellence" />
                                            <FieldError message={generalForm.errors.nom} />
                                        </div>
                                        <div>
                                            <Label>Sigle</Label>
                                            <Input value={generalForm.data.sigle} onChange={(e) => generalForm.setData('sigle', e.target.value)} placeholder="EPE" />
                                            <FieldError message={generalForm.errors.sigle} />
                                        </div>
                                        <div>
                                            <Label>Slogan</Label>
                                            <Input value={generalForm.data.slogan} onChange={(e) => generalForm.setData('slogan', e.target.value)} placeholder="L'excellence par le travail" />
                                        </div>
                                        <div>
                                            <Label>Directeur(trice)</Label>
                                            <Input value={generalForm.data.directeur_nom} onChange={(e) => generalForm.setData('directeur_nom', e.target.value)} placeholder="M. KOUAMÉ Jean" />
                                        </div>
                                        <div>
                                            <Label>Agrément MENA</Label>
                                            <Input value={generalForm.data.agrement_mena} onChange={(e) => generalForm.setData('agrement_mena', e.target.value)} placeholder="N°12345/MENA/DPE" />
                                        </div>
                                        <div>
                                            <Label>Année de création</Label>
                                            <Input type="number" min={1900} max={2100} value={generalForm.data.annee_creation} onChange={(e) => generalForm.setData('annee_creation', e.target.value)} placeholder="2005" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Contact</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label required>Téléphone principal</Label>
                                            <Input value={generalForm.data.contact_telephone} onChange={(e) => generalForm.setData('contact_telephone', e.target.value)} placeholder="+225 07 00 00 00 00" />
                                            <FieldError message={generalForm.errors.contact_telephone} />
                                        </div>
                                        <div>
                                            <Label>WhatsApp</Label>
                                            <Input value={generalForm.data.contact_whatsapp} onChange={(e) => generalForm.setData('contact_whatsapp', e.target.value)} placeholder="+225 07 00 00 00 00" />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input type="email" value={generalForm.data.contact_email} onChange={(e) => generalForm.setData('contact_email', e.target.value)} placeholder="contact@ecole.ci" />
                                            <FieldError message={generalForm.errors.contact_email} />
                                        </div>
                                        <div>
                                            <Label>Site web</Label>
                                            <Input value={generalForm.data.site_web} onChange={(e) => generalForm.setData('site_web', e.target.value)} placeholder="https://ecole.ci" />
                                            <FieldError message={generalForm.errors.site_web} />
                                        </div>
                                    </div>
                                </div>

                                {/* Localisation */}
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Localisation</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label required>Ville</Label>
                                            <Input value={generalForm.data.localisation_ville} onChange={(e) => generalForm.setData('localisation_ville', e.target.value)} placeholder="Abidjan" />
                                            <FieldError message={generalForm.errors.localisation_ville} />
                                        </div>
                                        <div>
                                            <Label>Commune</Label>
                                            <Input value={generalForm.data.localisation_commune} onChange={(e) => generalForm.setData('localisation_commune', e.target.value)} placeholder="Cocody" />
                                        </div>
                                        <div>
                                            <Label>Quartier / Zone</Label>
                                            <Input value={generalForm.data.localisation_quartier} onChange={(e) => generalForm.setData('localisation_quartier', e.target.value)} placeholder="Riviera 3" />
                                        </div>
                                        <div>
                                            <Label>Adresse complète</Label>
                                            <Input value={generalForm.data.adresse} onChange={(e) => generalForm.setData('adresse', e.target.value)} placeholder="Boulevard de France, lot 12" />
                                        </div>
                                        <div>
                                            <Label>Pays</Label>
                                            <Input value={generalForm.data.pays} onChange={(e) => generalForm.setData('pays', e.target.value)} placeholder="Côte d'Ivoire" />
                                        </div>
                                        <div>
                                            <Label>Code postal / BP</Label>
                                            <Input value={generalForm.data.code_postal} onChange={(e) => generalForm.setData('code_postal', e.target.value)} placeholder="BP 1234" />
                                        </div>
                                    </div>
                                </div>

                                {/* Préférences */}
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-gray-500">Préférences système</p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <Label>Devise</Label>
                                            <Input value={generalForm.data.devise} onChange={(e) => generalForm.setData('devise', e.target.value)} placeholder="XOF" />
                                        </div>
                                        <div>
                                            <Label>Langue</Label>
                                            <Input value={generalForm.data.langue_defaut} onChange={(e) => generalForm.setData('langue_defaut', e.target.value)} placeholder="fr" />
                                        </div>
                                        <div>
                                            <Label>Fuseau horaire</Label>
                                            <Input value={generalForm.data.fuseau_horaire} onChange={(e) => generalForm.setData('fuseau_horaire', e.target.value)} placeholder="Africa/Abidjan" />
                                        </div>
                                        <div>
                                            <Label>Format de date</Label>
                                            <Input value={generalForm.data.format_date} onChange={(e) => generalForm.setData('format_date', e.target.value)} placeholder="DD/MM/YYYY" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={generalForm.processing}>
                                        {generalForm.processing ? 'Enregistrement…' : 'Enregistrer les paramètres'}
                                    </Button>
                                </div>
                                {Object.keys(generalForm.errors).length > 0 ? (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
                                        <p className="font-medium">Veuillez corriger les erreurs ci-dessus.</p>
                                    </div>
                                ) : null}
                            </form>
                        </Section>
                    </div>
                ) : null}

                {/* ── ACADÉMIQUE ───────────────────────────────────────────── */}
                {activeTab === 'academique' ? (
                    <div className="space-y-4">
                        <Section title="Années scolaires" subtitle="Définissez une seule année active pour piloter l'ERP.">
                            <form
                                className="grid gap-3 md:grid-cols-4"
                                onSubmit={(e) => { e.preventDefault(); anneeForm.post(route('parametres.annees.store'), { preserveScroll: true, onSuccess: () => anneeForm.reset() }); }}
                            >
                                <div>
                                    <Label required>Libellé</Label>
                                    <Input placeholder="2026-2027" value={anneeForm.data.libelle} onChange={(e) => anneeForm.setData('libelle', e.target.value)} />
                                    <FieldError message={anneeForm.errors.libelle} />
                                </div>
                                <div>
                                    <Label required>Date de début</Label>
                                    <Input type="date" value={anneeForm.data.date_debut} onChange={(e) => anneeForm.setData('date_debut', e.target.value)} />
                                </div>
                                <div>
                                    <Label required>Date de fin</Label>
                                    <Input type="date" value={anneeForm.data.date_fin} onChange={(e) => anneeForm.setData('date_fin', e.target.value)} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={anneeForm.processing} className="w-full">
                                        Ajouter l'année
                                    </Button>
                                </div>
                            </form>
                            <div className="mt-4">
                                <Table headers={['Libellé', 'Début', 'Fin', 'Statut', 'Actions']}>
                                    {props.annees.map((annee) => (
                                        <tr key={annee.id}>
                                            <td className="px-4 py-3 font-medium">{annee.libelle}</td>
                                            <td className="px-4 py-3">{formatDate(annee.date_debut)}</td>
                                            <td className="px-4 py-3">{formatDate(annee.date_fin)}</td>
                                            <td className="px-4 py-3">
                                                {annee.est_active ? (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Active</span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-gray-700 dark:text-gray-400">Inactive</span>
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
                            <form className="grid gap-3 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); periodeForm.post(route('parametres.periodes.store'), { preserveScroll: true }); }}>
                                <div>
                                    <Label required>Année scolaire</Label>
                                    <select className={SEL} value={periodeForm.data.annee_scolaire_id} onChange={(e) => periodeForm.setData('annee_scolaire_id', e.target.value)}>
                                        <option value="">Sélectionner…</option>
                                        {props.annees.map((a) => <option key={a.id} value={String(a.id)}>{a.libelle}</option>)}
                                    </select>
                                    <FieldError message={periodeForm.errors.annee_scolaire_id} />
                                </div>
                                <div>
                                    <Label required>Libellé</Label>
                                    <Input placeholder="Trimestre 1" value={periodeForm.data.libelle} onChange={(e) => periodeForm.setData('libelle', e.target.value)} />
                                </div>
                                <div>
                                    <Label required>Début</Label>
                                    <Input type="date" value={periodeForm.data.date_debut} onChange={(e) => periodeForm.setData('date_debut', e.target.value)} />
                                </div>
                                <div>
                                    <Label required>Fin</Label>
                                    <Input type="date" value={periodeForm.data.date_fin} onChange={(e) => periodeForm.setData('date_fin', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Ordre</Label>
                                    <Input type="number" min={1} value={periodeForm.data.ordre} onChange={(e) => periodeForm.setData('ordre', Number(e.target.value))} />
                                </div>
                                <div className="md:col-span-5 flex justify-end">
                                    <Button type="submit" disabled={periodeForm.processing}>Ajouter la période</Button>
                                </div>
                            </form>
                            <FieldError message={periodeForm.errors.date_debut} />
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
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setSelectedPeriodeForComposition(periode.id);
                                                        compositionParPeriodeForm.setData('periode_academique_id', String(periode.id));
                                                        compositionParPeriodeForm.setData('libelle', `Composition ${periode.libelle}`);
                                                    }}>
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
                                    className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-700/30 md:grid-cols-4"
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
                                    <div>
                                        <Label>Libellé</Label>
                                        <Input placeholder="Composition Trimestre 1" value={compositionParPeriodeForm.data.libelle} onChange={(e) => compositionParPeriodeForm.setData('libelle', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Type</Label>
                                        <select className={SEL} value={compositionParPeriodeForm.data.type} onChange={(e) => compositionParPeriodeForm.setData('type', e.target.value)}>
                                            <option value="simple">Simple</option>
                                            <option value="passage">Passage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Barème</Label>
                                        <Input type="number" min={1} max={100} value={compositionParPeriodeForm.data.bareme} onChange={(e) => compositionParPeriodeForm.setData('bareme', Number(e.target.value || 20))} />
                                    </div>
                                    <div>
                                        <Label>Seuil de validation</Label>
                                        <Input value={compositionParPeriodeForm.data.seuil_validation} onChange={(e) => compositionParPeriodeForm.setData('seuil_validation', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Règle moyenne</Label>
                                        <select className={SEL} value={compositionParPeriodeForm.data.regle_moyenne} onChange={(e) => compositionParPeriodeForm.setData('regle_moyenne', e.target.value)}>
                                            <option value="simple">Moyenne simple</option>
                                            <option value="ponderee_coefficient">Moyenne pondérée</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Mode arrondi</Label>
                                        <select className={SEL} value={compositionParPeriodeForm.data.mode_arrondi} onChange={(e) => compositionParPeriodeForm.setData('mode_arrondi', e.target.value)}>
                                            <option value="unite_inferieure">Unité inférieure</option>
                                            <option value="unite_superieure">Unité supérieure</option>
                                            <option value="demi_point">Demi-point</option>
                                            <option value="dixieme_inferieur">Dixième inférieur</option>
                                            <option value="dixieme_superieur">Dixième supérieur</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Appréciations automatiques</Label>
                                        <Textarea rows={3} value={compositionParPeriodeForm.data.appreciations_auto} onChange={(e) => compositionParPeriodeForm.setData('appreciations_auto', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setSelectedPeriodeForComposition(null)}>Annuler</Button>
                                        <Button type="submit" disabled={compositionParPeriodeForm.processing}>Créer la composition</Button>
                                    </div>
                                </form>
                            ) : null}
                        </Section>

                        <Section title="Vue d'ensemble des référentiels" subtitle="Ces référentiels alimentent classes, notes, bulletins et inscriptions.">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-slate-200 p-4 dark:border-gray-700">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Niveaux</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">{props.niveaux.length}</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-4 dark:border-gray-700">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Classes</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">{props.classes.length}</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-4 dark:border-gray-700">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Matières</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-gray-100">{props.matieres.length}</p>
                                </div>
                            </div>
                        </Section>
                    </div>
                ) : null}

                {/* ── RÉFÉRENTIELS ─────────────────────────────────────────── */}
                {activeTab === 'referentiels' ? (
                    <div className="space-y-4">
                        <Section title="Niveaux" subtitle="Structure pédagogique : CP, CE, CM et cycles supérieurs.">
                            <form
                                className="grid gap-3 md:grid-cols-5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingNiveauId) {
                                        niveauForm.patch(route('parametres.niveaux.update', editingNiveauId), { preserveScroll: true, onSuccess: () => resetNiveauForm() });
                                    } else {
                                        niveauForm.post(route('parametres.niveaux.store'), { preserveScroll: true, onSuccess: () => resetNiveauForm() });
                                    }
                                }}
                            >
                                <div>
                                    <Label required>Libellé</Label>
                                    <Input placeholder="CP1" value={niveauForm.data.libelle} onChange={(e) => niveauForm.setData('libelle', e.target.value)} />
                                    <FieldError message={niveauForm.errors.libelle} />
                                </div>
                                <div>
                                    <Label required>Cycle</Label>
                                    <select className={SEL} value={niveauForm.data.cycle} onChange={(e) => niveauForm.setData('cycle', e.target.value)}>
                                        <option value="CP">CP</option>
                                        <option value="CE">CE</option>
                                        <option value="CM">CM</option>
                                    </select>
                                </div>
                                <div>
                                    <Label required>Ordre</Label>
                                    <Input type="number" min={1} value={niveauForm.data.ordre} onChange={(e) => niveauForm.setData('ordre', Number(e.target.value || 1))} />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input placeholder="Optionnel" value={niveauForm.data.description} onChange={(e) => niveauForm.setData('description', e.target.value)} />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button type="submit" disabled={niveauForm.processing}>{editingNiveauId ? 'Mettre à jour' : 'Ajouter'}</Button>
                                    {editingNiveauId ? <Button type="button" variant="outline" onClick={resetNiveauForm}><X size={14} /></Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Libellé', 'Cycle', 'Ordre', 'Actions']}>
                                    {props.niveaux.map((niveau) => (
                                        <tr key={niveau.id}>
                                            <td className="px-4 py-3 font-medium">{niveau.libelle}</td>
                                            <td className="px-4 py-3">{niveau.cycle}</td>
                                            <td className="px-4 py-3">{String(niveau.ordre ?? '-')}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingNiveauId(niveau.id);
                                                        niveauForm.setData({ libelle: String(niveau.libelle ?? ''), cycle: String(niveau.cycle ?? 'CP'), ordre: Number(niveau.ordre ?? 1), description: String(niveau.description ?? '') });
                                                    }}>Modifier</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.niveaux.destroy', niveau.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Classes" subtitle="Classes par niveau et année scolaire.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingClasseId) {
                                        classeForm.patch(route('parametres.classes.update', editingClasseId), { preserveScroll: true, onSuccess: () => resetClasseForm() });
                                    } else {
                                        classeForm.post(route('parametres.classes.store'), { preserveScroll: true, onSuccess: () => resetClasseForm() });
                                    }
                                }}
                            >
                                <div>
                                    <Label required>Nom de la classe</Label>
                                    <Input placeholder="6e A" value={classeForm.data.nom} onChange={(e) => classeForm.setData('nom', e.target.value)} />
                                    <FieldError message={classeForm.errors.nom} />
                                </div>
                                <div>
                                    <Label required>Niveau</Label>
                                    <select className={SEL} value={classeForm.data.niveau_id} onChange={(e) => classeForm.setData('niveau_id', e.target.value)}>
                                        <option value="">Sélectionner un niveau</option>
                                        {props.niveaux.map((n) => <option key={n.id} value={String(n.id)}>{n.libelle}</option>)}
                                    </select>
                                    <FieldError message={classeForm.errors.niveau_id} />
                                </div>
                                <div>
                                    <Label required>Année scolaire</Label>
                                    <select className={SEL} value={classeForm.data.annee_scolaire_id} onChange={(e) => classeForm.setData('annee_scolaire_id', e.target.value)}>
                                        <option value="">Sélectionner une année</option>
                                        {props.annees.map((a) => <option key={a.id} value={String(a.id)}>{a.libelle}</option>)}
                                    </select>
                                    <FieldError message={classeForm.errors.annee_scolaire_id} />
                                </div>
                                <div>
                                    <Label>Capacité max</Label>
                                    <Input type="number" min={1} value={classeForm.data.capacite_max} onChange={(e) => classeForm.setData('capacite_max', Number(e.target.value || 40))} />
                                </div>
                                <div>
                                    <Label>Salle</Label>
                                    <Input placeholder="Salle 01 (optionnel)" value={classeForm.data.salle} onChange={(e) => classeForm.setData('salle', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Statut</Label>
                                    <select className={SEL} value={classeForm.data.statut} onChange={(e) => classeForm.setData('statut', e.target.value)}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-2">
                                    <Button type="submit" disabled={classeForm.processing}>{editingClasseId ? 'Mettre à jour' : 'Ajouter la classe'}</Button>
                                    {editingClasseId ? <Button type="button" variant="outline" onClick={resetClasseForm}>Annuler</Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Classe', 'Niveau', 'Année', 'Statut', 'Actions']}>
                                    {props.classes.map((classe) => (
                                        <tr key={classe.id}>
                                            <td className="px-4 py-3 font-medium">{classe.nom}</td>
                                            <td className="px-4 py-3">{classe.niveau?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">{classe.anneeScolaire?.libelle ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classe.statut === 'inactive' ? 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                                    {classe.statut === 'inactive' ? 'Inactive' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingClasseId(classe.id);
                                                        classeForm.setData({ nom: String(classe.nom ?? ''), niveau_id: classe.niveau_id ? String(classe.niveau_id) : '', annee_scolaire_id: classe.annee_scolaire_id ? String(classe.annee_scolaire_id) : '', capacite_max: Number(classe.capacite_max ?? 40), salle: String(classe.salle ?? ''), statut: String(classe.statut ?? 'active') });
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
                                className="grid gap-3 md:grid-cols-5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (editingMatiereId) {
                                        matiereForm.patch(route('parametres.matieres.update', editingMatiereId), { preserveScroll: true, onSuccess: () => resetMatiereForm() });
                                    } else {
                                        matiereForm.post(route('parametres.matieres.store'), { preserveScroll: true, onSuccess: () => resetMatiereForm() });
                                    }
                                }}
                            >
                                <div>
                                    <Label required>Libellé</Label>
                                    <Input placeholder="Mathématiques" value={matiereForm.data.libelle} onChange={(e) => matiereForm.setData('libelle', e.target.value)} />
                                    <FieldError message={matiereForm.errors.libelle} />
                                </div>
                                <div>
                                    <Label required>Code</Label>
                                    <Input placeholder="MATH" value={matiereForm.data.code} onChange={(e) => matiereForm.setData('code', e.target.value)} />
                                    <FieldError message={matiereForm.errors.code} />
                                </div>
                                <div>
                                    <Label required>Coefficient</Label>
                                    <Input type="number" min={1} value={matiereForm.data.coefficient} onChange={(e) => matiereForm.setData('coefficient', Number(e.target.value || 1))} />
                                </div>
                                <div>
                                    <Label required>Ordre bulletin</Label>
                                    <Input type="number" min={1} value={matiereForm.data.ordre_bulletin} onChange={(e) => matiereForm.setData('ordre_bulletin', Number(e.target.value || 1))} />
                                </div>
                                <div>
                                    <Label required>Type</Label>
                                    <select className={SEL} value={matiereForm.data.type_evaluation} onChange={(e) => matiereForm.setData('type_evaluation', e.target.value)}>
                                        <option value="note">Notée</option>
                                        <option value="appreciation">Appréciation</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-gray-600">
                                    <Checkbox checked={matiereForm.data.est_notee} onCheckedChange={(checked) => matiereForm.setData('est_notee', Boolean(checked))} id="est_notee" />
                                    <label htmlFor="est_notee" className="cursor-pointer text-sm text-slate-700 dark:text-gray-300">Matière notée</label>
                                </div>
                                <div className="md:col-span-4 flex justify-end gap-2">
                                    <Button type="submit" disabled={matiereForm.processing}>{editingMatiereId ? 'Mettre à jour' : 'Ajouter la matière'}</Button>
                                    {editingMatiereId ? <Button type="button" variant="outline" onClick={resetMatiereForm}>Annuler</Button> : null}
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Matière', 'Code', 'Coef.', 'Ordre', 'Type', 'Actions']}>
                                    {props.matieres.map((m) => (
                                        <tr key={m.id}>
                                            <td className="px-4 py-3 font-medium">{m.libelle}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{m.code}</td>
                                            <td className="px-4 py-3">{String(m.coefficient)}</td>
                                            <td className="px-4 py-3">{String(m.ordre_bulletin)}</td>
                                            <td className="px-4 py-3">{m.type_evaluation}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setEditingMatiereId(m.id);
                                                        matiereForm.setData({ libelle: String(m.libelle ?? ''), code: String(m.code ?? ''), coefficient: Number(m.coefficient ?? 1), ordre_bulletin: Number(m.ordre_bulletin ?? 1), est_notee: Boolean(m.est_notee ?? true), type_evaluation: String(m.type_evaluation ?? 'note') });
                                                    }}>Modifier</Button>
                                                    <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.matieres.destroy', m.id))}>Supprimer</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>
                    </div>
                ) : null}

                {/* ── INSCRIPTIONS ─────────────────────────────────────────── */}
                {activeTab === 'inscriptions' ? (
                    <div className="space-y-4">
                        <Section title="Statuts d'inscription" subtitle="Statuts métier visibles par les gestionnaires.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => { e.preventDefault(); statutForm.post(route('parametres.statuts-inscription.store'), { preserveScroll: true, onSuccess: () => statutForm.reset() }); }}
                            >
                                <div className="md:col-span-2">
                                    <Label required>Libellé du statut</Label>
                                    <Input placeholder="Préinscrit" value={statutForm.data.libelle} onChange={(e) => statutForm.setData('libelle', e.target.value)} />
                                    <FieldError message={statutForm.errors.libelle} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={statutForm.processing} className="w-full">Ajouter le statut</Button>
                                </div>
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

                        <Section title="Règles d'admission" subtitle="Matricule, boursier par défaut et pièces obligatoires.">
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); inscriptionsConfigForm.patch(route('parametres.config.update', 'inscriptions'), { preserveScroll: true }); }}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Règle de matricule</Label>
                                        <Input value={String(inscriptionsConfigForm.data.donnees.regle_matricule)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, regle_matricule: e.target.value })} placeholder="ANNEE-NIVEAU-COMPTEUR" />
                                    </div>
                                    <div>
                                        <Label>Format de matricule</Label>
                                        <Input value={String(inscriptionsConfigForm.data.donnees.format_matricule)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, format_matricule: e.target.value })} placeholder="{annee}-{niveau}-{compteur:04}" />
                                    </div>
                                    <div>
                                        <Label>Documents requis (un par ligne)</Label>
                                        <Textarea rows={4} value={String(inscriptionsConfigForm.data.donnees.documents_requis)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, documents_requis: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Âges par niveau (un par ligne)</Label>
                                        <Textarea rows={4} value={String(inscriptionsConfigForm.data.donnees.age_par_niveau)} onChange={(e) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, age_par_niveau: e.target.value })} placeholder="CP1: 5-7" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                                    <Checkbox checked={Boolean(inscriptionsConfigForm.data.donnees.boursier_par_defaut)} onCheckedChange={(checked) => inscriptionsConfigForm.setData('donnees', { ...inscriptionsConfigForm.data.donnees, boursier_par_defaut: Boolean(checked) })} />
                                    Cocher « Boursier » par défaut lors d'une inscription
                                </label>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={inscriptionsConfigForm.processing}>Enregistrer</Button>
                                </div>
                            </form>
                        </Section>
                    </div>
                ) : null}

                {/* ── FINANCE ──────────────────────────────────────────────── */}
                {activeTab === 'finance' ? (
                    <div className="space-y-4">
                        <Section title="Modes de paiement" subtitle="Canaux autorisés en caisse et en ligne.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => { e.preventDefault(); modeForm.post(route('parametres.modes-paiement.store'), { preserveScroll: true, onSuccess: () => modeForm.reset() }); }}
                            >
                                <div className="md:col-span-2">
                                    <Label required>Libellé</Label>
                                    <Input placeholder="Orange Money" value={modeForm.data.libelle} onChange={(e) => modeForm.setData('libelle', e.target.value)} />
                                    <FieldError message={modeForm.errors.libelle} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={modeForm.processing} className="w-full">Ajouter</Button>
                                </div>
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

                        <Section title="Types de frais" subtitle="Frais scolaires applicables aux élèves et classes.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    typeFraisForm.post(route('parametres.types-frais.store'), {
                                        preserveScroll: true,
                                        onSuccess: () => typeFraisForm.reset('libelle', 'montant', 'niveau_id', 'classe_id'),
                                    });
                                }}
                            >
                                <div>
                                    <Label required>Libellé</Label>
                                    <Input placeholder="Scolarité — 6e" value={typeFraisForm.data.libelle} onChange={(e) => typeFraisForm.setData('libelle', e.target.value)} />
                                    <FieldError message={typeFraisForm.errors.libelle} />
                                </div>
                                <div>
                                    <Label required>Montant (FCFA)</Label>
                                    <Input type="number" min={1} value={typeFraisForm.data.montant} onChange={(e) => typeFraisForm.setData('montant', Number(e.target.value || 0))} />
                                    <FieldError message={typeFraisForm.errors.montant} />
                                </div>
                                <div>
                                    <Label>Fréquence</Label>
                                    <select className={SEL} value={typeFraisForm.data.frequence} onChange={(e) => typeFraisForm.setData('frequence', e.target.value)}>
                                        <option value="unique">Unique</option>
                                        <option value="trimestriel">Trimestriel</option>
                                        <option value="mensuel">Mensuel</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Classe spécifique</Label>
                                    <select className={SEL} value={typeFraisForm.data.classe_id} onChange={(e) => typeFraisForm.setData('classe_id', e.target.value)}>
                                        <option value="">Toutes les classes</option>
                                        {props.classes.map((c) => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <Label>Niveau spécifique</Label>
                                    <select className={SEL} value={typeFraisForm.data.niveau_id} onChange={(e) => typeFraisForm.setData('niveau_id', e.target.value)} disabled={typeFraisForm.data.classe_id !== ''}>
                                        <option value="">Tous les niveaux</option>
                                        {props.niveaux.map((n) => <option key={n.id} value={String(n.id)}>{n.libelle}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end gap-3">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                                        <Checkbox checked={typeFraisForm.data.est_obligatoire} onCheckedChange={(checked) => typeFraisForm.setData('est_obligatoire', Boolean(checked))} />
                                        Obligatoire
                                    </label>
                                    <Button type="submit" disabled={typeFraisForm.processing} className="ml-auto">Ajouter</Button>
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Type de frais', 'Portée', 'Fréquence', 'Montant', 'Action']}>
                                    {props.typesFrais.map((frais) => (
                                        <tr key={frais.id}>
                                            <td className="px-4 py-3 font-medium">{frais.libelle}</td>
                                            <td className="px-4 py-3">{frais.classe?.nom ? `Classe ${frais.classe.nom}` : (frais.niveau?.libelle ?? 'Tous niveaux')}</td>
                                            <td className="px-4 py-3">{frais.frequence ?? '-'}</td>
                                            <td className="px-4 py-3">{formatMoney(Number(frais.montant))} FCFA</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.types-frais.destroy', frais.id))}>Supprimer</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Règles financières" subtitle="Numérotation des reçus, échéances, remises et pénalités.">
                            <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); financeConfigForm.patch(route('parametres.config.update', 'finance'), { preserveScroll: true }); }}>
                                <div>
                                    <Label>Préfixe des reçus</Label>
                                    <Input value={String(financeConfigForm.data.donnees.prefixe_recu)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, prefixe_recu: e.target.value })} placeholder="REC" />
                                </div>
                                <div>
                                    <Label>Prochain numéro de reçu</Label>
                                    <Input value={String(financeConfigForm.data.donnees.prochain_numero_recu)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, prochain_numero_recu: e.target.value })} placeholder="000001" />
                                </div>
                                <div>
                                    <Label>Politique d'échéance</Label>
                                    <Input value={String(financeConfigForm.data.donnees.politique_echeance)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, politique_echeance: e.target.value })} placeholder="Mensuelle du 05 au 10" />
                                </div>
                                <div>
                                    <Label>Pénalités de retard</Label>
                                    <Input value={String(financeConfigForm.data.donnees.penalites_retard)} onChange={(e) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, penalites_retard: e.target.value })} placeholder="2% après le 15 du mois" />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 md:col-span-2">
                                    <Checkbox checked={Boolean(financeConfigForm.data.donnees.remises_autorisees)} onCheckedChange={(checked) => financeConfigForm.setData('donnees', { ...financeConfigForm.data.donnees, remises_autorisees: Boolean(checked) })} />
                                    Autoriser les remises lors des paiements
                                </label>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button type="submit" disabled={financeConfigForm.processing}>Enregistrer</Button>
                                </div>
                            </form>
                        </Section>
                    </div>
                ) : null}

                {/* ── ÉVALUATIONS ──────────────────────────────────────────── */}
                {activeTab === 'evaluations' ? (
                    <Section title="Paramètres de notation" subtitle="Barèmes, arrondis, seuils et appréciations automatiques.">
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); evalConfigForm.patch(route('parametres.config.update', 'evaluations'), { preserveScroll: true }); }}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Barème principal</Label>
                                    <Input type="number" min={1} value={Number(evalConfigForm.data.donnees.bareme_principal)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, bareme_principal: Number(e.target.value || 20) })} />
                                </div>
                                <div>
                                    <Label>Mode d'arrondi</Label>
                                    <select className={SEL} value={String(evalConfigForm.data.donnees.mode_arrondi)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, mode_arrondi: e.target.value })}>
                                        <option value="dixieme_superieur">Dixième supérieur</option>
                                        <option value="dixieme_inferieur">Dixième inférieur</option>
                                        <option value="demi_point">Demi-point</option>
                                        <option value="unite_superieure">Unité supérieure</option>
                                        <option value="unite_inferieure">Unité inférieure</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Seuil de validation</Label>
                                    <Input value={String(evalConfigForm.data.donnees.seuil_validation)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, seuil_validation: e.target.value })} placeholder="10" />
                                </div>
                                <div>
                                    <Label>Règle de calcul des moyennes</Label>
                                    <select className={SEL} value={String(evalConfigForm.data.donnees.regle_moyenne)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, regle_moyenne: e.target.value })}>
                                        <option value="ponderee_coefficient">Moyenne pondérée par coefficient</option>
                                        <option value="simple">Moyenne simple</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <Label>Appréciations automatiques (format: ≥note: Libellé)</Label>
                                <Textarea rows={6} value={String(evalConfigForm.data.donnees.appreciations_auto)} onChange={(e) => evalConfigForm.setData('donnees', { ...evalConfigForm.data.donnees, appreciations_auto: e.target.value })} />
                                <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">Exemple : &gt;=16: Très bien · &gt;=14: Bien · &lt;10: Insuffisant</p>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={evalConfigForm.processing}>Enregistrer</Button>
                            </div>
                        </form>
                    </Section>
                ) : null}

                {/* ── ABSENCES ─────────────────────────────────────────────── */}
                {activeTab === 'absences' ? (
                    <Section title="Absences et discipline" subtitle="Paramètres partagés avec le suivi de présence et la vie scolaire.">
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); absencesConfigForm.patch(route('parametres.config.update', 'absences'), { preserveScroll: true }); }}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Types d'absence (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.types_absence)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, types_absence: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Motifs (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.motifs)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, motifs: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Statuts de justification (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.statuts_justification)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, statuts_justification: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Types de sanctions (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.sanctions)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, sanctions: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Types d'incidents disciplinaires (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.types_incident)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, types_incident: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Niveaux de gravité (un par ligne)</Label>
                                    <Textarea rows={5} value={String(absencesConfigForm.data.donnees.niveaux_gravite)} onChange={(e) => absencesConfigForm.setData('donnees', { ...absencesConfigForm.data.donnees, niveaux_gravite: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={absencesConfigForm.processing}>Enregistrer</Button>
                            </div>
                        </form>
                    </Section>
                ) : null}

                {/* ── UTILISATEURS ─────────────────────────────────────────── */}
                {activeTab === 'utilisateurs' ? (
                    <div className="space-y-4">
                        <Section title="Permissions" subtitle="Créez les permissions réutilisées par les rôles.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => { e.preventDefault(); permissionForm.post(route('parametres.permissions.store'), { preserveScroll: true, onSuccess: () => permissionForm.reset() }); }}
                            >
                                <div className="md:col-span-2">
                                    <Label required>Nom de la permission</Label>
                                    <Input placeholder="notes.create" value={permissionForm.data.name} onChange={(e) => permissionForm.setData('name', e.target.value)} />
                                    <FieldError message={permissionForm.errors.name} />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={permissionForm.processing} variant="outline" className="w-full">Ajouter la permission</Button>
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Permission', 'Action']}>
                                    {props.permissions.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 font-mono text-xs">{p.name}</td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="outline" onClick={() => router.delete(route('parametres.permissions.destroy', p.id))}>Supprimer</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Section>

                        <Section title="Rôles et profils d'accès" subtitle="Associez des permissions pour créer un profil métier.">
                            <form
                                className="space-y-4"
                                onSubmit={(e) => { e.preventDefault(); roleForm.post(route('parametres.roles.store'), { preserveScroll: true, onSuccess: () => roleForm.reset() }); }}
                            >
                                <div>
                                    <Label required>Nom du rôle</Label>
                                    <Input placeholder="Responsable pédagogique" value={roleForm.data.name} onChange={(e) => roleForm.setData('name', e.target.value)} />
                                    <FieldError message={roleForm.errors.name} />
                                </div>
                                {props.permissions.length > 0 ? (
                                    <div>
                                        <Label>Permissions associées</Label>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {props.permissions.map((p) => (
                                                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm hover:bg-slate-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                                    <Checkbox
                                                        checked={roleForm.data.permissions.includes(p.name)}
                                                        onCheckedChange={(checked) => {
                                                            roleForm.setData('permissions', checked
                                                                ? [...roleForm.data.permissions, p.name]
                                                                : roleForm.data.permissions.filter((x) => x !== p.name));
                                                        }}
                                                    />
                                                    {p.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 dark:text-gray-500">Aucune permission disponible. Créez d'abord des permissions.</p>
                                )}
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={roleForm.processing}>Enregistrer le rôle</Button>
                                </div>
                            </form>
                            <div className="mt-4">
                                <Table headers={['Rôle', 'Permissions associées', 'Action']}>
                                    {props.roles.map((role) => (
                                        <tr key={role.id}>
                                            <td className="px-4 py-3 font-medium">{role.name}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-gray-400">{role.permissions.map((p) => p.name).join(', ') || '—'}</td>
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

                {/* ── DOCUMENTS ────────────────────────────────────────────── */}
                {activeTab === 'documents' ? (
                    <div className="space-y-4">
                        <Section title="Entête et signature des documents" subtitle="Appliqués par défaut sur tous les exports PDF.">
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); documentsConfigForm.patch(route('parametres.config.update', 'documents'), { preserveScroll: true }); }}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Entête (multi-lignes)</Label>
                                        <Textarea rows={4} value={String(documentsConfigForm.data.donnees.entete)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, entete: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Pied de page (multi-lignes)</Label>
                                        <Textarea rows={4} value={String(documentsConfigForm.data.donnees.pied_page)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, pied_page: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Mention de signature</Label>
                                        <Input value={String(documentsConfigForm.data.donnees.signature)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, signature: e.target.value })} placeholder="Le Directeur" />
                                    </div>
                                    <div>
                                        <Label>Mention cachet</Label>
                                        <Input value={String(documentsConfigForm.data.donnees.cachet)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, cachet: e.target.value })} placeholder="Cachet de l'établissement" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Variables disponibles dans les modèles</Label>
                                    <Textarea rows={2} value={String(documentsConfigForm.data.donnees.variables)} onChange={(e) => documentsConfigForm.setData('donnees', { ...documentsConfigForm.data.donnees, variables: e.target.value })} />
                                    <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">Utilisez {'{{'} variable {'}}'}  dans vos modèles HTML.</p>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={documentsConfigForm.processing}>Enregistrer</Button>
                                </div>
                            </form>
                        </Section>

                        <Section title="Modèles PDF" subtitle="Bulletins, reçus et cartes scolaires.">
                            <form
                                className="grid gap-3 md:grid-cols-3"
                                onSubmit={(e) => { e.preventDefault(); modeleForm.post(route('parametres.modeles-impression.store'), { preserveScroll: true, onSuccess: () => modeleForm.reset() }); }}
                            >
                                <div>
                                    <Label required>Type de document</Label>
                                    <select className={SEL} value={modeleForm.data.type_document} onChange={(e) => modeleForm.setData('type_document', e.target.value)}>
                                        {props.typesDocument.map((type) => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <Label required>Nom du modèle</Label>
                                    <Input placeholder="Bulletin standard" value={modeleForm.data.nom} onChange={(e) => modeleForm.setData('nom', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input placeholder="Description courte (optionnel)" value={modeleForm.data.description} onChange={(e) => modeleForm.setData('description', e.target.value)} />
                                </div>
                                <div className="md:col-span-3">
                                    <Label>Template HTML / PDF</Label>
                                    <Textarea rows={5} placeholder="Coller le template HTML ici…" value={modeleForm.data.template_html} onChange={(e) => modeleForm.setData('template_html', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                                        <Checkbox checked={modeleForm.data.est_defaut} onCheckedChange={(checked) => modeleForm.setData('est_defaut', Boolean(checked))} />
                                        Définir comme modèle par défaut
                                    </label>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={modeleForm.processing}>Ajouter le modèle</Button>
                                </div>
                            </form>
                            <div className="mt-3">
                                <Table headers={['Type', 'Nom', 'Description', 'Défaut', 'Action']}>
                                    {props.modelesImpression.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.type_document}</td>
                                            <td className="px-4 py-3 font-medium">{item.nom}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{item.description || '—'}</td>
                                            <td className="px-4 py-3">
                                                {item.est_defaut ? (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Défaut</span>
                                                ) : '—'}
                                            </td>
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

                {activeTab === 'communication_sms' ? (
                    <div className="space-y-4">
                        <Section title="Modèles SMS préconfigurés" subtitle="Ces messages sont disponibles dans le module Communication SMS pour un remplissage rapide.">
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); communicationSmsConfigForm.patch(route('parametres.config.update', 'communication_sms'), { preserveScroll: true }); }}>
                                <div>
                                    <Label>Relance finance</Label>
                                    <Textarea rows={3} maxLength={600} value={String(communicationSmsConfigForm.data.donnees.modele_relance_finance)} onChange={(e) => communicationSmsConfigForm.setData('donnees', { ...communicationSmsConfigForm.data.donnees, modele_relance_finance: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Confirmation paiement</Label>
                                    <Textarea rows={3} maxLength={600} value={String(communicationSmsConfigForm.data.donnees.modele_confirmation_paiement)} onChange={(e) => communicationSmsConfigForm.setData('donnees', { ...communicationSmsConfigForm.data.donnees, modele_confirmation_paiement: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Rappel inscription</Label>
                                    <Textarea rows={3} maxLength={600} value={String(communicationSmsConfigForm.data.donnees.modele_rappel_inscription)} onChange={(e) => communicationSmsConfigForm.setData('donnees', { ...communicationSmsConfigForm.data.donnees, modele_rappel_inscription: e.target.value })} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={communicationSmsConfigForm.processing}>Enregistrer</Button>
                                </div>
                            </form>
                        </Section>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
