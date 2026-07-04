<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscriptionRequest;
use App\Http\Requests\UpdateInscriptionRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Models\ParentTuteur;
use App\Services\InscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InscriptionController extends Controller
{
    public function __construct(private readonly InscriptionService $inscriptionService) {}

    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'classe_id' => ['nullable', 'integer', Rule::exists('classes', 'id')->where('etablissement_id', $etablissementId)],
            'annee_scolaire_id' => ['nullable', 'integer', Rule::exists('annees_scolaires', 'id')->where('etablissement_id', $etablissementId)],
            'statut' => ['nullable', Rule::in(array_values(Inscription::STATUTS))],
        ]);
        if (empty($filters['annee_scolaire_id']) && $anneeActive) {
            $filters['annee_scolaire_id'] = $anneeActive->id;
        }

        return Inertia::render('Inscriptions/Index', [
            'inscriptions' => $this->inscriptionService->index($filters, $etablissementId),
            'filters' => $filters,
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']),
            'annees' => AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']),
        ]);
    }

    public function create(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        return Inertia::render('Inscriptions/Create', [
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
            'annees' => AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(),
            'eleves' => Eleve::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->orderBy('prenoms')->get(['id', 'nom', 'prenoms', 'matricule']),
            'parents' => ParentTuteur::query()
                ->whereHas('eleves', fn ($query) => $query->where('etablissement_id', $etablissementId))
                ->orderBy('nom')
                ->orderBy('prenoms')
                ->get(['id', 'nom', 'prenoms', 'telephone_1']),
        ]);
    }

    public function store(StoreInscriptionRequest $request): RedirectResponse
    {
        $inscription = $this->inscriptionService->store($request->validated() + ['photo' => $request->file('photo')], (int) auth()->user()->etablissement_id);

        return redirect()->route('inscriptions.show', $inscription->id)->with('success', 'Inscription créée avec succès');
    }

    public function show(int $id): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $inscription = Inscription::query()
            ->whereHas('eleve', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->with(['eleve.parentsTuteurs', 'classe.niveau', 'anneeScolaire', 'documents'])
            ->findOrFail($id);

        return Inertia::render('Inscriptions/Show', ['inscription' => $inscription]);
    }

    public function edit(int $id): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $inscription = Inscription::query()->whereHas('eleve', fn ($query) => $query->where('etablissement_id', $etablissementId))->with(['eleve', 'classe', 'anneeScolaire'])->findOrFail($id);

        return Inertia::render('Inscriptions/Edit', [
            'inscription' => $inscription,
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
        ]);
    }

    public function update(UpdateInscriptionRequest $request, int $id): RedirectResponse
    {
        $inscription = Inscription::query()->whereHas('eleve', fn ($query) => $query->where('etablissement_id', (int) auth()->user()->etablissement_id))->with('eleve')->findOrFail($id);
        $inscription = $this->inscriptionService->update($inscription, $request->validated());

        return redirect()->route('inscriptions.show', $inscription->id)->with('success', 'Inscription mise à jour');
    }
}
