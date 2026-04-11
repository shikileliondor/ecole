export interface Eleve {
    id: number;
    matricule: string;
    nom: string;
    prenoms: string;
    date_naissance: string;
    lieu_naissance: string;
    pays_naissance: string;
    sexe: 'M' | 'F';
    nationalite: string;
    situation_familiale: string | null;
    est_boursier: boolean;
    photo: string | null;
    extrait_naissance_numero: string | null;
    statut: 'actif' | 'transfere' | 'exclu' | 'sorti';
    etablissement_id: number;
    inscription_active?: Inscription;
    inscriptions?: Inscription[];
    parents?: ParentTuteur[];
    parentsTuteurs?: ParentTuteur[];
}

export interface ParentTuteur {
    id: number;
    nom: string;
    prenoms: string;
    lien: string;
    profession: string | null;
    telephone_1: string;
    telephone_2: string | null;
    whatsapp: string | null;
    email: string | null;
    adresse_quartier: string | null;
    est_payeur: boolean;
    can_portal_access: boolean;
    pivot?: { est_principal: boolean; peut_recuperer: boolean };
}

export interface Inscription {
    id: number;
    eleve_id: number;
    classe_id: number;
    annee_scolaire_id: number;
    date_inscription: string;
    type: string;
    statut: string;
    classe?: Classe;
    annee_scolaire?: { id: number; libelle: string };
}

export interface Classe {
    id: number;
    nom: string;
    capacite_max: number;
    niveau?: Niveau;
    inscriptions_count?: number;
    enseignant_titulaire?: { id: number; nom_complet?: string; nom?: string };
}

export interface Niveau {
    id: number;
    libelle: string;
    ordre: number;
    cycle: 'CP' | 'CE' | 'CM';
}

export interface Note {
    id: number;
    matiere_id: number;
    trimestre: number;
    note: number | null;
    appreciation: string | null;
    rang_classe: number | null;
    est_validee: boolean;
    matiere?: Matiere;
}

export interface Matiere {
    id: number;
    libelle: string;
    code: string;
    coefficient: number;
    type_evaluation: string;
}

export interface Paiement {
    id: number;
    montant_attendu: number;
    montant_paye: number;
    montant_restant: number;
    mode_paiement: string;
    reference_transaction: string | null;
    date_paiement: string;
    recu_numero: string;
    statut: 'paye' | 'partiel' | 'impaye';
    type_frais?: TypeFrais;
}

export interface TypeFrais {
    id: number;
    libelle: string;
    montant: number;
}

export interface Absence {
    id: number;
    date_absence: string;
    type: 'matin' | 'apres_midi' | 'journee';
    motif: string;
    est_justifiee: boolean;
    parent_notifie: boolean;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface Stats {
    total_eleves: number;
    total_garcons: number;
    total_filles: number;
    total_boursiers: number;
    nouveaux_ce_mois: number;
}
