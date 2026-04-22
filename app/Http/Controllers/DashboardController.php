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
use Illuminate\Support\Facades\DB;
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
            ->selectRaw('YEAR(date_inscription) as year, MONTH(date_inscription) as month, COUNT(*) as total')
            ->whereHas('classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->where('annee_scolaire_id', $anneeActive->id))
            ->whereDate('date_inscription', '>=', $startMonth)
            ->groupByRaw('YEAR(date_inscription), MONTH(date_inscription)')
            ->get()
            ->keyBy(fn ($row) => sprintf('%04d-%02d', (int) $row->year, (int) $row->month));

        $inscriptionData = collect(range(0, 5))->map(function (int $offset) use ($startMonth, $inscriptionsRaw, $monthLabels): array {
            $date = $startMonth->copy()->addMonths($offset);
            $key = $date->format('Y-m');

            return [
                'mois' => $monthLabels[(int) $date->format('n')] ?? $date->format('M'),
                'total' => (int) ($inscriptionsRaw[$key]->total ?? 0),
            ];
        })->values();

        $niveauData = DB::table('niveaux')
            ->join('classes', 'classes.niveau_id', '=', 'niveaux.id')
            ->leftJoin('inscriptions', function ($join) use ($anneeActive): void {
                $join->on('inscriptions.classe_id', '=', 'classes.id')
                    ->where('inscriptions.statut', '=', Inscription::STATUTS['inscrit']);

                if ($anneeActive !== null) {
                    $join->where('inscriptions.annee_scolaire_id', '=', $anneeActive->id);
                }
            })
            ->where('classes.etablissement_id', $etablissementId)
            ->selectRaw('niveaux.libelle as niveau, COUNT(inscriptions.id) as eleves')
            ->groupBy('niveaux.id', 'niveaux.libelle', 'niveaux.ordre')
            ->orderBy('niveaux.ordre')
            ->get()
            ->map(fn ($row) => [
                'niveau' => $row->niveau,
                'eleves' => (int) $row->eleves,
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
            ->selectRaw('inscription_id, SUM(montant_restant) as montant_restant_total')
            ->whereHas('inscription.classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->when($anneeActive !== null, fn ($query) => $query->whereHas('inscription', fn ($sub) => $sub->where('annee_scolaire_id', $anneeActive->id)))
            ->groupBy('inscription_id')
            ->havingRaw('SUM(montant_restant) > 0')
            ->orderByDesc('montant_restant_total')
            ->limit(4)
            ->with(['inscription.eleve:id,nom,prenoms', 'inscription.classe:id,nom'])
            ->get()
            ->map(fn (Paiement $payment) => [
                'eleve' => trim(($payment->inscription?->eleve?->prenoms ?? '') . ' ' . ($payment->inscription?->eleve?->nom ?? '')),
                'classe' => $payment->inscription?->classe?->nom ?? '—',
                'montant' => number_format((int) $payment->montant_restant_total, 0, ',', ' ') . ' FCFA',
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
