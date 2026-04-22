# Architecture sécurisée cible (Laravel + React)

## 1) Principe global

- **Backend Laravel = source de vérité** pour l’authentification, les rôles, les autorisations, la validation métier et l’audit.
- **Frontend React = couche UI/UX uniquement**. Aucune décision d’autorisation finale ne doit dépendre du client.
- **Principe du moindre privilège** : chaque endpoint renvoie uniquement les champs nécessaires à l’écran concerné.

## 2) Authentification recommandée

Pour un ERP SaaS web orienté navigateur :

- Utiliser **Laravel Sanctum en mode cookie de session**.
- Configurer les cookies en **HttpOnly + Secure + SameSite**.
- Interdire le stockage des secrets d’auth dans `localStorage`/`sessionStorage`.
- Garder la protection **CSRF active** pour toutes les requêtes stateful.

> Résultat attendu : réduction forte du risque de vol de token en cas de XSS.

## 3) Répartition des responsabilités

### React

- Gestion des formulaires, vues, interactions utilisateur.
- Affichage conditionnel ergonomique (ex. masquer certains boutons) **sans en faire un mécanisme de sécurité**.
- Gestion uniforme des erreurs HTTP (401/403/419/422/429) via un client API commun.

### Laravel

- Validation stricte et systématique via `FormRequest`.
- Autorisation via `Policies`/`Gates` + middlewares (`auth:sanctum`, `can:*`).
- RBAC explicite (`admin`, `enseignant`, `eleve`) et permissions fines.
- Journalisation des événements de sécurité (auth, accès sensibles, actions critiques).
- `RateLimiter`/lockout sur authentification et endpoints sensibles.

## 4) Flux réseau sécurisé

- **HTTPS only** (avec redirection HTTP → HTTPS).
- **HSTS** activé en production.
- Reverse proxy (Nginx/Traefik) avec en-têtes de sécurité.
- CORS en **allowlist explicite** (origines front connues uniquement).
- Séparation stricte des environnements (`dev`, `staging`, `prod`).

## 5) Patterns de design sécurisés

### A. Auth & rôles côté Laravel

- Hash des mots de passe via `Hash::make()` (Argon2id/bcrypt selon config).
- Limitation de tentative de connexion + MFA recommandée pour comptes privilégiés.
- Routes sensibles protégées par `auth:sanctum` + contrôle de capacité (`can:*`).
- Policies par ressource : ex. un enseignant ne voit que les notes de ses classes assignées.

### B. Validation & hygiène d’entrée

- `FormRequest` pour toutes les mutations (create/update/import).
- Règles strictes : types, bornes, formats, `exists`, `in`, règles métier.
- Normalisation serveur : `trim`, cast, normalisation des formats avant persistance.
- Éviter `dangerouslySetInnerHTML` côté React sauf cas exceptionnel contrôlé.

### C. API

- Réponses via `API Resources` / transformers dédiés.
- Interdire les retours bruts de modèles complets (ex. `User::all()`).
- Pagination obligatoire (`paginate()` / `cursorPaginate()`) sur listes.
- Filtres et tris explicitement whitelistés.
- Logs d’audit sur :
  - tentatives de connexion ;
  - consultation de données sensibles ;
  - actions administrateur à fort impact.

### D. Front React

- Aucun secret persistant dans le navigateur.
- Intercepteur API minimal pour gérer les erreurs d’auth/session proprement.
- Messages UI génériques pour la sécurité ; détails réservés aux logs serveur.
- Ne jamais pré-remplir ni exposer visuellement des secrets.

## 6) Checklist sécurité pré-production

## Auth / session

- [ ] Sanctum cookie-based opérationnel.
- [ ] Cookies configurés en HttpOnly + Secure + SameSite.
- [ ] Rate limit sur login/reset password.
- [ ] MFA activée pour comptes à privilèges.
- [ ] Expiration de session + rotation de session après login.

## API

- [ ] 100% des routes sensibles derrière auth + permissions.
- [ ] Réponses minimales via API Resources.
- [ ] Aucun secret dans payload, erreurs ou traces publiques.
- [ ] Pagination active et filtres validés côté serveur.
- [ ] Journal d’audit activé.

## Données / base

- [ ] Usage ORM/Eloquent et requêtes paramétrées.
- [ ] Chiffrement des champs critiques au repos si requis.
- [ ] Sauvegardes chiffrées + test de restauration validé.
- [ ] Utilisateur DB en moindre privilège.

## Frontend

- [ ] Aucun token/secret dans localStorage/sessionStorage.
- [ ] Aucune autorisation finale déléguée au client.
- [ ] Aucun secret dans bundle JS et source maps de production.
- [ ] Messages d’erreur non verbeux côté utilisateur.

## Infrastructure

- [ ] `APP_DEBUG=false` en production.
- [ ] CSP + X-Frame-Options + Referrer-Policy + HSTS configurés.
- [ ] CORS restrictif (origines explicites).
- [ ] TLS moderne et redirection HTTP → HTTPS.
- [ ] Monitoring + alerting sécurité.

## 7) Plan de mise en œuvre (ordre recommandé)

1. Durcir la configuration Laravel (`APP_DEBUG`, cookies, Sanctum, CORS, headers).
2. Mettre en place RBAC complet (rôles/permissions + policies).
3. Revoir les endpoints API (resources minimales + pagination + filtres whitelistés).
4. Sécuriser la chaîne formulaire/validation serveur.
5. Auditer le front React (suppression stockage sensible + gestion d’erreurs).
6. Renforcer logs, monitoring et tests sécurité.
7. Faire une revue pré-production et valider la checklist go-live.
