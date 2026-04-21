# Cahier des charges technique (état actuel du projet)

## 1) Contexte produit
- Application web de **gestion scolaire primaire** (orientation Côte d’Ivoire) construite avec **Laravel 12 + Inertia + React/TypeScript**.
- Le périmètre aujourd’hui est centré sur le module **Élèves**: inscription, listing filtré, fiche détaillée, transfert, suppression, export PDF.
- Le projet inclut déjà le socle pour des modules élargis (notes, paiements, absences, personnel, salaires, rôles/permissions), mais plusieurs parcours restent à finaliser côté routes/controllers.

## 2) Objectifs métier déjà couverts
### 2.1 Gestion des élèves
- Créer un élève avec:
  - identité complète,
  - parent/tuteur principal,
  - affectation en classe,
  - création automatique de l’inscription active.
- Rechercher/filtrer les élèves par nom, matricule, classe, niveau, sexe, statut.
- Consulter la fiche élève (infos générales + notes par trimestre + paiements + absences).
- Modifier, transférer et supprimer un élève.
- Exporter la liste filtrée au format PDF.

### 2.2 Multi-établissement
- Les données principales sont scoppées par `etablissement_id` (utilisateur connecté), ce qui prépare un fonctionnement multi-écoles.

### 2.3 Sécurité applicative
- Authentification Laravel Breeze (login/register/reset password/email verification).
- Rôles/permissions avec Spatie installés au niveau base de données.
- Routes métiers protégées par middleware `auth`.

## 3) Architecture technique implémentée
- **Backend**: Laravel 12, PHP 8.2, Eloquent ORM, FormRequest, Service Layer.
- **Frontend**: React + TypeScript via InertiaJS, UI composants partagés (shadcn/ui).
- **PDF**: `barryvdh/laravel-dompdf` utilisé pour l’export des élèves.
- **RBAC**: `spatie/laravel-permission` migré et disponible.

## 4) Contrat fonctionnel (routes disponibles)
### 4.1 Routes actives
- `/dashboard` (auth)
- CRUD élève + transfert + export PDF:
  - `eleves.index`, `eleves.create`, `eleves.store`, `eleves.show`, `eleves.edit`, `eleves.update`, `eleves.destroy`, `eleves.transferer`, `eleves.export.pdf`
- Profil utilisateur: `profile.edit/update/destroy`
- Auth Breeze standard

### 4.2 Écarts détectés entre UI et backend
Le front de la fiche élève appelle des routes non déclarées dans `routes/web.php`:
- `paiements.store`
- `paiements.recu`
- `absences.store`
- `bulletins.download`

=> Ces features sont **préparées au niveau UI et base** mais pas encore branchées entièrement côté backend.

## 5) Logique métier déjà codée
## 5.1 Service `EleveService`
- Filtrage paginé des élèves avec eager loading.
- Calcul statistiques (total élèves, garçons/filles, boursiers, nouveaux du mois).
- Fiche élève enrichie (inscriptions, notes, paiements, absences, parents).
- Création transactionnelle:
  - élève,
  - upload photo,
  - parent principal,
  - pivot élève-parent,
  - inscription annuelle active.
- Mise à jour élève + parent principal.
- Transfert (changement statut élève + inscription active).
- Export de liste pour PDF.

## 5.2 Règles validation FormRequest
- `StoreEleveRequest` et `UpdateEleveRequest` centralisent les règles.
- Defaults métier injectés: `pays_naissance = Côte d'Ivoire`, `nationalite = Ivoirienne`.
- Validation parent/tuteur et téléphone.

## 5.3 Modèles structurants
- `Eleve`: constantes (sexe/statut/situation familiale), matricule auto-généré, soft delete, scopes utiles.
- `Inscription`: statut/type, attributs calculés (montant dû/payé/restant, absences).
- `User`: types (`staff|parent`), statut (`actif|bloque`), dernière connexion auto-maj, traits Spatie rôles.

## 6) Migrations – inventaire fonctionnel
## 6.1 Socle Laravel
- `users`, `password_reset_tokens`, `sessions`
- `cache`, `cache_locks`
- `jobs`, `job_batches`, `failed_jobs`

## 6.2 Sécurité & autorisations
- Migrations Spatie:
  - `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

## 6.3 Domaine école
- `etablissements`
- `annees_scolaires`
- `niveaux`
- `classes`
- `eleves` (+ soft deletes)
- `parents_tuteurs`
- `eleve_parents` (pivot M:N)
- `inscriptions`
- `matieres`
- `notes`
- `types_frais`
- `paiements`
- `personnel` (+ soft deletes)
- `salaires`
- `absences`
- extension `users`: `etablissement_id`, `personnel_id`, `parent_id`, `type`, `dernier_connexion`, `statut`

## 7) Ce qui est déjà en place pour aider un assistant de développement (ChatGPT)
## 7.1 Éléments qui rendent le code “compréhensible machine”
- **Nommage métier explicite** (français cohérent: `eleve`, `inscription`, `statut`, etc.).
- **Constantes de domaine** dans les modèles (évite les magic strings).
- **Service Layer** séparé du contrôleur (logique métier centralisée).
- **FormRequest** pour règles et messages (validation explicite).
- **Types TypeScript** (`resources/js/types/eleve.ts`) qui documentent les payloads front/back.
- **Relations Eloquent riches** (eager loading, scopes) qui exposent clairement le graphe de données.
- **Migrations complètes** décrivant le modèle relationnel et les contraintes.

## 7.2 Limites qui freinent encore un assistant IA
- README non documenté métier (encore template Laravel).
- Absence de docs API/flux (pas d’OpenAPI, pas de schémas d’événements).
- Routes backend manquantes pour des actions déjà présentes dans l’UI.
- Peu de tests métier visibles pour valider les hypothèses automatiquement.

## 8) Recommandations prioritaires (pour un assistant dev plus fiable)
1. **Documenter le domaine**
   - Ajouter un README projet orienté produit (acteurs, règles, workflows).
   - Ajouter un glossaire métier (statuts, cycles, trimestres, types de frais).

2. **Compléter les API manquantes**
   - Implémenter routes + contrôleurs pour paiements, absences, bulletins.
   - Harmoniser les noms de routes avec les appels front existants.

3. **Renforcer la vérifiabilité**
   - Ajouter tests feature (inscription élève, transfert, export, permissions).
   - Ajouter tests unitaires sur calculs (stats, finance, moyennes).

4. **Stabiliser le contrat de données**
   - Introduire des DTO/Resources API côté Laravel.
   - Versionner les schémas JSON critiques.

5. **Préparer l’IA de manière explicite**
   - Créer `docs/architecture.md`, `docs/domain-model.md`, `docs/flows/*.md`.
   - Ajouter une section “Prompt context” avec conventions de code, routes, modèles et dépendances.

## 9) Conclusion opérationnelle
Le projet a déjà une **bonne base structurée** (domaine riche, migrations solides, patterns Laravel propres) permettant à ChatGPT d’agir comme assistant dev.
Pour passer d’un assistant “utile” à “fiable en production”, il faut surtout:
- combler les routes/features incomplètes,
- écrire la documentation métier,
- ajouter des tests automatisés.
