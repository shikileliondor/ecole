# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Laravel 12 + React/Inertia.js school management ERP** (Système de Gestion Scolaire). It manages students, enrollments, grades, personnel, finances, and SMS notifications for a French-speaking school.

## Commands

### Development
```bash
composer run dev        # Start all services concurrently: PHP server + queue worker + Vite dev
```
Or individually:
```bash
php artisan serve       # Laravel dev server
php artisan queue:listen --tries=1  # Process background jobs
npm run dev             # Vite frontend dev server
```

### Build & Format
```bash
npm run build           # Production Vite build
./vendor/bin/pint       # PHP code formatting (Laravel Pint)
```

### Testing
```bash
composer run test                              # Run all PHPUnit tests
php artisan test --filter=EleveTest           # Run a single test class
php artisan test tests/Feature/EleveTest.php  # Run a specific file
```
Tests use an in-memory SQLite database (configured in `phpunit.xml`).

### Database
```bash
php artisan migrate          # Run pending migrations
php artisan migrate:fresh --seed  # Reset and reseed DB
composer run setup           # Full setup: migrate + build assets
```

## Architecture

### Stack
- **Backend**: Laravel 12, PHP 8.2+, Eloquent ORM, MySQL
- **Frontend**: React 18, TypeScript 5, Inertia.js v2, Tailwind CSS 3, Radix UI
- **Auth**: Session-based + Spatie/laravel-permission for RBAC
- **Build**: Vite 7 with `@laravel/vite-plugin`
- **Queue/Cache/Sessions**: All use database driver

### Inertia.js Pattern
There is **no separate REST API** for most operations. Laravel controllers return `Inertia::render('PageName', $props)` and the React frontend receives typed props directly. Forms use `useForm` from `@inertiajs/react` and submit to Laravel routes. Use `route()` helper (via Ziggy) for URLs.

### Service Layer
Business logic lives in `app/Services/` rather than controllers. Controllers are thin — they validate, call services, and redirect. Key services:
- `EleveService` — student filtering, statistics, creation
- `InscriptionService` — enrollment management

### Frontend Structure
- `resources/js/Pages/` — Inertia page components (one per route)
- `resources/js/Components/ui/` — Base UI components (Radix UI + Tailwind, shadcn/ui pattern)
- `resources/js/types/` — TypeScript interfaces matching Laravel models/props
- Path alias `@/` resolves to `resources/js/`

### Key Models & Relationships
- `Eleve` (student) → has many `Inscription` → belongs to `Classe` + `AnneeScolaire`
- `Inscription` is the pivot between students, classes, and academic years
- `Personnel` (staff) ↔ `Classe` via `PersonnelClasseAffectation`
- `User` links to either `Personnel` (staff) or `ParentTuteur` (parent), with `user_type` field
- `Eleve` uses SoftDeletes for archiving

### Auth & Permissions
- `User` model uses `HasRoles` trait (Spatie). User roles/permissions are shared to frontend via `HandleInertiaRequests` middleware.
- Middleware aliases: `permission`, `role`, `role_or_permission` (configured in `bootstrap/app.php`)
- Users have a `statut` field (`actif`/`bloque`) and a `user_type` field (`staff`/`parent`)

### Model Conventions
- French naming throughout (models, attributes, routes, UI)
- Models use computed attributes: `nomComplet`, `age`, `classeActuelle`
- Name fields auto-normalize: `nom` uppercase, `prenoms` title case
- Query scopes used extensively (`actifs()`, `boursiers()`, `parClasse()`, etc.)

### Exports
- PDF: Laravel DomPDF (`barryvdh/laravel-dompdf`)
- Word/Excel: Dedicated export methods in controllers (EleveController)

### SMS
- Orange SMS API integration, credentials in `.env` (`ORANGE_SMS_*`)
- Controller: `SmsController` (API), `SmsTestController` (UI testing)