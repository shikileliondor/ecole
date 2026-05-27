<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\Personnel;
use App\Models\PeriodeAcademique;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $anneeActive = AnneeScolaire::query()
            ->where('etablissement_id', $etablissementId)
            ->where('est_active', true)
            ->first();

        $inscriptionsBase = Inscription::query()
            ->whereHas('classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->where('statut', Inscription::STATUTS['inscrit'])
            ->when($anneeActive !== null, fn ($query) => $query->where('annee_scolaire_id', $anneeActive->id));

        $elevesInscrits = (clone $inscriptionsBase)->count();

        $paiementsBase = Paiement::query()
            ->whereHas('inscription.classe', function ($query) use ($etablissementId, $anneeActive): void {
                $query->where('etablissement_id', $etablissementId);
            })
            ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)));

        $totalAttendu = (clone $paiementsBase)->sum('montant_attendu');
        $totalPaye = (clone $paiementsBase)->sum('montant_paye');
        $recouvrement = $totalAttendu > 0 ? (int) round(($totalPaye / $totalAttendu) * 100) : 0;

        $recettesMois = (int) (clone $paiementsBase)
            ->whereMonth('date_paiement', now()->month)
            ->whereYear('date_paiement', now()->year)
            ->sum('montant_paye');

        $absencesJour = Absence::query()
            ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
            ->whereDate('date_absence', now()->toDateString())
            ->count();

        $classesActives = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->active()
            ->when($anneeActive !== null, fn ($query) => $query->where('annee_scolaire_id', $anneeActive->id))
            ->count();

        $enseignants = Personnel::query()
            ->where('etablissement_id', $etablissementId)
            ->actif()
            ->enseignants()
            ->count();

        $impayesEnCours = (int) (clone $paiementsBase)->sum('montant_restant');

        $bulletinsTrimestre = (int) (clone $inscriptionsBase)
            ->whereHas('notes')
            ->distinct('id')
            ->count('id');

        $monthLabels = [1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Jun', 7 => 'Jul', 8 => 'Aoû', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'];
        $startMonth = now()->copy()->startOfMonth()->subMonths(5);

        $inscriptionsRaw = Inscription::query()
            ->whereHas('classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->where('annee_scolaire_id', $anneeActive->id))
            ->whereDate('date_inscription', '>=', $startMonth)
            ->get()
            ->groupBy(fn (Inscription $inscription) => optional($inscription->date_inscription)?->format('Y-m'))
            ->map(fn ($items) => $items->count());

        $inscriptionData = collect(range(0, 5))->map(function (int $offset) use ($startMonth, $inscriptionsRaw, $monthLabels): array {
            $date = $startMonth->copy()->addMonths($offset);
            $key = $date->format('Y-m');

            return [
                'mois' => $monthLabels[(int) $date->format('n')] ?? $date->format('M'),
                'total' => (int) ($inscriptionsRaw[$key] ?? 0),
            ];
        })->values();

        $niveauData = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with('niveau:id,libelle,ordre')
            ->withCount([
                'inscriptions as eleves_count' => function ($query) use ($anneeActive): void {
                    $query->where('statut', Inscription::STATUTS['inscrit']);
                    if ($anneeActive !== null) {
                        $query->where('annee_scolaire_id', $anneeActive->id);
                    }
                },
            ])
            ->get()
            ->groupBy(fn (Classe $classe) => (string) $classe->niveau?->libelle)
            ->map(fn ($classes, $niveau) => [
                'niveau' => $niveau,
                'ordre' => (int) ($classes->first()?->niveau?->ordre ?? 999),
                'eleves' => (int) $classes->sum('eleves_count'),
            ])
            ->sortBy('ordre')
            ->values()
            ->map(fn (array $item) => [
                'niveau' => $item['niveau'],
                'eleves' => $item['eleves'],
            ])
            ->values();

        $payments = Paiement::query()
            ->with(['inscription.eleve:id,nom,prenoms', 'inscription.classe:id,nom'])
            ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
            ->orderByDesc('date_paiement')
            ->limit(5)
            ->get()
            ->map(fn (Paiement $payment) => [
                'eleve' => trim(($payment->inscription?->eleve?->prenoms ?? '') . ' ' . ($payment->inscription?->eleve?->nom ?? '')), 
                'classe' => $payment->inscription?->classe?->nom ?? '—',
                'montant' => number_format((int) $payment->montant_paye, 0, ',', ' ') . ' FCFA',
                'mode' => (string) $payment->mode_libelle,
                'date' => $payment->date_paiement?->format('d/m/Y') ?? '—',
            ])
            ->values();

        $criticalUnpaid = Paiement::query()
            ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
            ->with(['inscription.eleve:id,nom,prenoms', 'inscription.classe:id,nom'])
            ->get()
            ->groupBy('inscription_id')
            ->map(fn ($payments) => [
                'payment' => $payments->first(),
                'montant_restant_total' => (int) $payments->sum('montant_restant'),
            ])
            ->filter(fn (array $row) => $row['montant_restant_total'] > 0)
            ->sortByDesc('montant_restant_total')
            ->take(4)
            ->map(fn (array $payment) => [
                'eleve' => trim(($payment['payment']?->inscription?->eleve?->prenoms ?? '') . ' ' . ($payment['payment']?->inscription?->eleve?->nom ?? '')),
                'classe' => $payment['payment']?->inscription?->classe?->nom ?? '—',
                'montant' => number_format((int) $payment['montant_restant_total'], 0, ',', ' ') . ' FCFA',
            ])
            ->values();

        $absencePieData = [
            [
                'name' => 'Justifiées',
                'value' => Absence::query()
                    ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
                    ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
                    ->where('est_justifiee', true)
                    ->count(),
                'color' => '#1a56a0',
            ],
            [
                'name' => 'Non justifiées',
                'value' => Absence::query()
                    ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
                    ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
                    ->where('est_justifiee', false)
                    ->count(),
                'color' => '#f97316',
            ],
        ];

        $events = PeriodeAcademique::query()
            ->with('anneeScolaire:id,etablissement_id')
            ->whereHas('anneeScolaire', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->whereDate('date_debut', '>=', Carbon::today())
            ->orderBy('date_debut')
            ->limit(4)
            ->get()
            ->map(fn ($periode) => [
                'titre' => (string) $periode->libelle,
                'date' => $periode->date_debut?->format('d/m/Y') ?? '—',
                'type' => 'Académique',
            ])
            ->values();

        $activities = collect()
            ->merge((clone $inscriptionsBase)->latest('date_inscription')->limit(3)->get()->map(fn (Inscription $inscription) => [
                'icon' => 'inscription',
                'texte' => 'Nouvelle inscription: ' . trim(($inscription->eleve?->prenoms ?? '') . ' ' . ($inscription->eleve?->nom ?? '')),
                'time' => optional($inscription->date_inscription)?->diffForHumans() ?? '—',
            ]))
            ->merge(Paiement::query()
                ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
                ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
                ->latest('date_paiement')
                ->limit(3)
                ->get()
                ->map(fn (Paiement $paiement) => [
                    'icon' => 'paiement',
                    'texte' => 'Paiement validé - ' . number_format((int) $paiement->montant_paye, 0, ',', ' ') . ' FCFA',
                    'time' => optional($paiement->date_paiement)?->diffForHumans() ?? '—',
                ]))
            ->take(4)
            ->values();

        return Inertia::render('Dashboard/Index', [
            'scope' => 'all',
            'schoolYearLabel' => $anneeActive?->libelle,
            'metrics' => [
                'elevesInscrits' => $elevesInscrits,
                'recouvrement' => $recouvrement,
                'recettesMois' => number_format($recettesMois, 0, ',', ' ') . ' FCFA',
                'absencesJour' => $absencesJour,
                'classesActives' => $classesActives,
                'enseignants' => $enseignants,
                'impayesEnCours' => number_format($impayesEnCours, 0, ',', ' ') . ' FCFA',
                'bulletinsTrimestre' => $bulletinsTrimestre,
            ],
            'inscriptionData' => $inscriptionData,
            'niveauData' => $niveauData,
            'payments' => $payments,
            'criticalUnpaid' => $criticalUnpaid,
            'absencePieData' => $absencePieData,
            'events' => $events,
            'activities' => $activities,
        ]);
    }
}
