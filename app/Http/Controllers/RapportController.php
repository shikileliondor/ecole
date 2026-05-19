<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Composition;
use App\Models\CompositionNote;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Models\Personnel;
use App\Models\PeriodeAcademique;
use App\Models\PersonnelDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RapportController extends Controller
{
    public function index(Request $request): Response
    {
        $annees = AnneeScolaire::query()->orderByDesc('date_debut')->get(['id', 'libelle']);
        $periodes = PeriodeAcademique::query()->orderBy('date_debut')->get(['id', 'libelle']);
        $classes = Classe::query()->orderBy('nom')->get(['id', 'nom', 'niveau_id']);
        $niveaux = Niveau::query()->orderBy('ordre')->get(['id', 'libelle']);

        $filters = [
            'annee_id' => $request->integer('annee_id') ?: null,
            'periode_id' => $request->integer('periode_id') ?: null,
            'classe_id' => $request->integer('classe_id') ?: null,
            'niveau_id' => $request->integer('niveau_id') ?: null,
            'type_rapport' => $request->string('type_rapport')->toString() ?: null,
        ];

        $inscriptions = Inscription::query()
            ->when($filters['annee_id'], fn ($q, $id) => $q->where('annee_scolaire_id', $id))
            ->when($filters['classe_id'], fn ($q, $id) => $q->where('classe_id', $id))
            ->when($filters['niveau_id'], fn ($q, $id) => $q->whereHas('classe', fn ($c) => $c->where('niveau_id', $id)));

        $currentMonth = now();
        $kpis = [
            'elevesInscrits' => (clone $inscriptions)->count(),
            'classesActives' => Classe::query()->where('statut', 'active')->count(),
            'enseignants' => Personnel::query()->where('type', 'enseignant')->where('statut', 'actif')->count(),
            'bulletinsGeneres' => Composition::query()->where('est_publie', true)->count(),
            'absencesMois' => Absence::query()->whereYear('date_absence', $currentMonth->year)->whereMonth('date_absence', $currentMonth->month)->count(),
            'nouveauxInscrits' => (clone $inscriptions)->where('type', 'nouvelle_inscription')->count(),
        ];

        $effectifParClasse = (clone $inscriptions)
            ->select('classes.nom', DB::raw('COUNT(*) as total'))
            ->join('classes', 'classes.id', '=', 'inscriptions.classe_id')
            ->groupBy('classes.nom')
            ->orderByDesc('total')
            ->get();

        $effectifParNiveau = (clone $inscriptions)
            ->select('niveaux.libelle', DB::raw('COUNT(*) as total'))
            ->join('classes', 'classes.id', '=', 'inscriptions.classe_id')
            ->join('niveaux', 'niveaux.id', '=', 'classes.niveau_id')
            ->groupBy('niveaux.libelle', 'niveaux.ordre')
            ->orderBy('niveaux.ordre')
            ->get();

        $repartitionSexe = (clone $inscriptions)
            ->select('eleves.sexe', DB::raw('COUNT(*) as total'))
            ->join('eleves', 'eleves.id', '=', 'inscriptions.eleve_id')
            ->groupBy('eleves.sexe')
            ->get();

        $moyennesParClasse = CompositionNote::query()
            ->select('classes.nom', DB::raw('ROUND(AVG(composition_notes.moyenne),2) as moyenne'))
            ->join('classes', 'classes.id', '=', 'composition_notes.classe_id')
            ->groupBy('classes.nom')
            ->orderByDesc('moyenne')
            ->get();

        $absencesParMois = Absence::query()
            ->selectRaw("DATE_FORMAT(date_absence, '%Y-%m') as mois")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $bulletinsParTrimestre = Composition::query()
            ->select('periodes_academiques.libelle', DB::raw('COUNT(compositions.id) as total'))
            ->join('periodes_academiques', 'periodes_academiques.id', '=', 'compositions.periode_academique_id')
            ->where('compositions.est_publie', true)
            ->groupBy('periodes_academiques.libelle')
            ->get();

        return Inertia::render('Rapports/Index', [
            'filters' => $filters,
            'filterOptions' => [
                'annees' => $annees,
                'periodes' => $periodes,
                'classes' => $classes,
                'niveaux' => $niveaux,
                'typesRapport' => ['scolaire', 'pedagogique', 'absences', 'rh'],
            ],
            'kpis' => $kpis,
            'data' => [
                'effectifParClasse' => $effectifParClasse,
                'effectifParNiveau' => $effectifParNiveau,
                'repartitionSexe' => $repartitionSexe,
                'nouveauxInscrits' => (clone $inscriptions)->where('type', 'nouvelle_inscription')->count(),
                'reinscriptions' => (clone $inscriptions)->where('type', 'reinscription')->count(),
                'listeElevesParClasse' => (clone $inscriptions)->with(['eleve:id,nom,prenoms', 'classe:id,nom'])->limit(100)->get(),
                'absencesJustifiees' => Absence::query()->where('est_justifiee', true)->count(),
                'absencesNonJustifiees' => Absence::query()->where('est_justifiee', false)->count(),
                'elevesPlusAbsents' => Absence::query()
                    ->select('inscriptions.eleve_id', DB::raw('COUNT(absences.id) as total_absences'))
                    ->join('inscriptions', 'inscriptions.id', '=', 'absences.inscription_id')
                    ->join('eleves', 'eleves.id', '=', 'inscriptions.eleve_id')
                    ->selectRaw("CONCAT(eleves.nom, ' ', eleves.prenoms) as nom_complet")
                    ->groupBy('inscriptions.eleve_id', 'eleves.nom', 'eleves.prenoms')
                    ->orderByDesc('total_absences')->limit(10)->get(),
                'personnelParPoste' => Personnel::query()->select('type', DB::raw('COUNT(*) as total'))->groupBy('type')->get(),
                'documentsManquants' => Personnel::query()
                    ->whereDoesntHave('documents')
                    ->count(),
                'personnelTotal' => Personnel::query()->count(),
                'enseignantsActifs' => Personnel::query()->where('type', 'enseignant')->where('statut', 'actif')->count(),
                'moyennesParClasse' => $moyennesParClasse,
                'classementParClasse' => $moyennesParClasse,
                'tauxReussite' => CompositionNote::query()->where('moyenne', '>=', 10)->count(),
                'elevesExcellents' => CompositionNote::query()->where('moyenne', '>=', 16)->count(),
                'elevesFaibles' => CompositionNote::query()->where('moyenne', '<', 10)->count(),
                'matieresFaibles' => CompositionNote::query()
                    ->select('matieres.libelle', DB::raw('ROUND(AVG(composition_notes.moyenne),2) as moyenne'))
                    ->join('matieres', 'matieres.id', '=', 'composition_notes.matiere_id')
                    ->groupBy('matieres.libelle')
                    ->havingRaw('AVG(composition_notes.moyenne) < 10')
                    ->orderBy('moyenne')
                    ->limit(10)
                    ->get(),
                'absencesParMois' => $absencesParMois,
                'bulletinsParTrimestre' => $bulletinsParTrimestre,
            ],
            'exports' => [
                'pdf' => false,
                'excel' => false,
                'print' => false,
            ],
        ]);
    }
}
