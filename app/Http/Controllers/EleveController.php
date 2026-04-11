<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateEleveRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Services\EleveService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EleveController extends Controller
{
    public function __construct(
        private EleveService $eleveService,
    ) {}

    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $filters = $request->only(['search', 'classe_id', 'niveau_id', 'statut', 'sexe']);
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);

        return Inertia::render('Eleves/Index', [
            'eleves' => $this->eleveService->getElevesAvecFiltres($filters, $etablissementId),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
            'filters' => $filters,
            'stats' => $this->eleveService->getStatsEleves($etablissementId, $anneeScolaireId),
        ]);
    }

    public function create(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();

        return Inertia::render('Eleves/Create', [
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->withCount('inscriptions')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
            'annee_active' => $anneeActive,
        ]);
    }

    public function store(StoreEleveRequest $request): RedirectResponse
    {
        $eleve = $this->eleveService->creerEleve($request->validated() + ['photo' => $request->file('photo')], (int) auth()->user()->etablissement_id);
        return redirect()->route('eleves.show', $eleve->id)->with('success', 'Élève inscrit avec succès');
    }

    public function show(int $id): Response
    {
        $eleve = $this->eleveService->getFicheEleve($id, (int) auth()->user()->etablissement_id);
        $inscriptionActive = $eleve->inscriptions->firstWhere('statut', Inscription::STATUTS['inscrit']);

        return Inertia::render('Eleves/Show', [
            'eleve' => $eleve,
            'inscription_active' => $inscriptionActive,
            'notes_par_trimestre' => $inscriptionActive ? $this->eleveService->getNotesParTrimestre($inscriptionActive->id) : [1 => [], 2 => [], 3 => []],
            'paiements' => $inscriptionActive?->paiements ?? collect(),
            'absences' => $inscriptionActive?->absences ?? collect(),
            'stats_financieres' => $inscriptionActive ? $this->eleveService->getStatsFinancieres($inscriptionActive->id) : ['total_du' => 0, 'total_paye' => 0, 'solde' => 0, 'est_a_jour' => true],
        ]);
    }

    public function edit(int $id): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        return Inertia::render('Eleves/Edit', [
            'eleve' => $this->eleveService->getFicheEleve($id, $etablissementId),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
        ]);
    }

    public function update(UpdateEleveRequest $request, int $id): RedirectResponse
    {
        $eleve = $this->eleveService->mettreAJourEleve($id, $request->validated() + ['photo' => $request->file('photo')]);
        return redirect()->route('eleves.show', $eleve->id)->with('success', 'Informations de l\'élève mises à jour avec succès');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->eleveService->supprimerEleve($id);
        return redirect()->route('eleves.index')->with('success', 'Élève supprimé');
    }

    public function transferer(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate(['ecole_destination' => ['required', 'string', 'max:255']]);
        $this->eleveService->transfererEleve($id, $validated['ecole_destination']);
        return redirect()->route('eleves.index')->with('success', 'Élève transféré avec succès');
    }

    public function exportPdf(Request $request)
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $filters = $request->only(['search', 'classe_id', 'niveau_id', 'statut', 'sexe']);
        $classe = $request->filled('classe_id') ? Classe::query()->find((int) $request->integer('classe_id')) : null;
        $eleves = $this->eleveService->getListePourExport($filters, $etablissementId);
        $pdf = Pdf::loadView('eleves.export-pdf', ['eleves' => $eleves, 'classe' => $classe, 'date_edition' => now(), 'filters' => $filters]);

        return $pdf->download('eleves-' . ($classe?->nom ? str($classe->nom)->slug() : 'toutes-classes') . '-' . now()->format('Y-m-d') . '.pdf');
    }
}
