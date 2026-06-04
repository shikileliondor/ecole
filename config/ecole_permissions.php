<?php
declare(strict_types=1);

return [
    'permissions' => [
        'dashboard.voir' => ['module' => 'Tableau de bord', 'label' => 'Voir le tableau de bord'],

        'eleves.voir' => ['module' => 'Élèves', 'label' => 'Voir les élèves'],
        'eleves.creer' => ['module' => 'Élèves', 'label' => 'Créer un élève'],
        'eleves.modifier' => ['module' => 'Élèves', 'label' => 'Modifier un élève'],
        'eleves.supprimer' => ['module' => 'Élèves', 'label' => 'Supprimer un élève'],
        'eleves.exporter' => ['module' => 'Élèves', 'label' => 'Exporter les élèves'],
        'eleves.transferer' => ['module' => 'Élèves', 'label' => 'Transférer un élève'],

        'inscriptions.voir' => ['module' => 'Inscriptions', 'label' => 'Voir les inscriptions'],
        'inscriptions.creer' => ['module' => 'Inscriptions', 'label' => 'Créer une inscription'],
        'inscriptions.modifier' => ['module' => 'Inscriptions', 'label' => 'Modifier une inscription'],

        'classes.voir' => ['module' => 'Classes', 'label' => 'Voir les classes'],
        'emplois.voir' => ['module' => 'Emplois du temps', 'label' => 'Voir les emplois du temps'],
        'emplois.gerer' => ['module' => 'Emplois du temps', 'label' => 'Gérer les emplois du temps'],

        'notes.voir' => ['module' => 'Notes & bulletins', 'label' => 'Voir les notes et bulletins'],
        'notes.gerer' => ['module' => 'Notes & bulletins', 'label' => 'Créer et modifier les notes'],
        'notes.exporter' => ['module' => 'Notes & bulletins', 'label' => 'Exporter les compositions'],

        'absences.voir' => ['module' => 'Absences', 'label' => 'Voir les absences'],
        'absences.creer' => ['module' => 'Absences', 'label' => 'Créer une absence'],
        'absences.modifier' => ['module' => 'Absences', 'label' => 'Modifier une absence'],
        'absences.supprimer' => ['module' => 'Absences', 'label' => 'Supprimer une absence'],
        'absences.exporter' => ['module' => 'Absences', 'label' => 'Exporter les absences'],

        'personnel.voir' => ['module' => 'Personnel', 'label' => 'Voir le personnel'],
        'personnel.creer' => ['module' => 'Personnel', 'label' => 'Créer un membre du personnel'],
        'personnel.modifier' => ['module' => 'Personnel', 'label' => 'Modifier le personnel'],
        'personnel.supprimer' => ['module' => 'Personnel', 'label' => 'Supprimer le personnel'],

        'finances.voir' => ['module' => 'Finances', 'label' => 'Voir les finances'],
        'finances.paiements.gerer' => ['module' => 'Finances', 'label' => 'Gérer les paiements'],
        'finances.paiements.annuler' => ['module' => 'Finances', 'label' => 'Annuler un paiement'],
        'finances.depenses.gerer' => ['module' => 'Finances', 'label' => 'Gérer les dépenses'],
        'finances.salaires.voir' => ['module' => 'Finances', 'label' => 'Voir les salaires'],
        'finances.rapports.voir' => ['module' => 'Finances', 'label' => 'Voir les rapports financiers'],

        'communication.sms.gerer' => ['module' => 'Communication', 'label' => 'Gérer les SMS parents'],
        'communication.email.gerer' => ['module' => 'Communication', 'label' => 'Gérer les emails parents'],

        'parametres.voir' => ['module' => 'Paramètres', 'label' => 'Voir les paramètres'],
        'parametres.modifier' => ['module' => 'Paramètres', 'label' => 'Modifier les paramètres généraux'],
        'parametres.academique.gerer' => ['module' => 'Paramètres', 'label' => 'Gérer les référentiels académiques'],
        'parametres.documents.gerer' => ['module' => 'Paramètres', 'label' => 'Gérer les modèles de documents'],
        'permissions.roles.gerer' => ['module' => 'Permissions', 'label' => 'Gérer les rôles et leurs permissions'],
        'permissions.utilisateurs.voir' => ['module' => 'Permissions', 'label' => 'Voir les utilisateurs et leurs accès'],
        'permissions.utilisateurs.creer' => ['module' => 'Permissions', 'label' => 'Créer les utilisateurs et attribuer un rôle'],
        'permissions.utilisateurs.permissions.gerer' => ['module' => 'Permissions', 'label' => 'Gérer les rôles et exceptions utilisateurs'],
        'permissions.utilisateurs.gerer' => ['module' => 'Permissions', 'label' => 'Gérer complètement les utilisateurs (compatibilité)'],
        'permissions.creer' => ['module' => 'Permissions', 'label' => 'Créer des permissions techniques'],
        'permissions.supprimer' => ['module' => 'Permissions', 'label' => 'Supprimer des permissions techniques'],

        'notifications.gerer' => ['module' => 'Notifications', 'label' => 'Gérer ses notifications'],
        'profile.modifier' => ['module' => 'Profil', 'label' => 'Modifier son profil'],
    ],

    'role_defaults' => [
        'super_admin' => ['*'],
        'directeur' => [
            'dashboard.voir', 'eleves.voir', 'eleves.creer', 'eleves.modifier', 'eleves.exporter',
            'inscriptions.voir', 'inscriptions.creer', 'inscriptions.modifier', 'classes.voir',
            'emplois.voir', 'emplois.gerer', 'notes.voir', 'notes.gerer', 'notes.exporter',
            'absences.voir', 'absences.creer', 'absences.modifier', 'absences.exporter',
            'personnel.voir', 'personnel.creer', 'personnel.modifier', 'finances.voir',
            'finances.rapports.voir', 'communication.sms.gerer', 'communication.email.gerer',
            'parametres.voir', 'parametres.modifier', 'parametres.academique.gerer',
            'parametres.documents.gerer', 'permissions.utilisateurs.voir', 'permissions.utilisateurs.creer',
            'permissions.utilisateurs.permissions.gerer', 'permissions.roles.gerer',
            'notifications.gerer', 'profile.modifier',
        ],
        'enseignant' => [
            'dashboard.voir', 'eleves.voir', 'classes.voir', 'emplois.voir', 'notes.voir',
            'notes.gerer', 'absences.voir', 'absences.creer', 'notifications.gerer', 'profile.modifier',
        ],
        'caissier' => [
            'dashboard.voir', 'eleves.voir', 'inscriptions.voir', 'finances.voir',
            'finances.paiements.gerer', 'finances.rapports.voir', 'notifications.gerer', 'profile.modifier',
        ],
        'secretaire' => [
            'dashboard.voir', 'eleves.voir', 'eleves.creer', 'eleves.modifier', 'eleves.exporter',
            'inscriptions.voir', 'inscriptions.creer', 'inscriptions.modifier', 'classes.voir',
            'absences.voir', 'communication.sms.gerer', 'communication.email.gerer',
            'notifications.gerer', 'profile.modifier',
        ],
        'parent' => ['notifications.gerer', 'profile.modifier'],
    ],
];
