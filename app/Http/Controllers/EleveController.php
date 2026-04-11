<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateEleveRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Models\ParentTuteur;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EleveController extends Controller
{
    /** Affiche la liste paginée des élèves de l'établissement connecté. */
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $query = $this->buildFilteredElevesQuery($request, $etablissementId)
            ->with([
                'inscriptions' => fn (Builder $builder): Builder => $builder
                    ->actives()
                    ->with(['classe.niveau'])
                    ->latest('date_inscription'),
                'parentsTuteurs' => fn (Builder $builder): Builder => $builder
                    ->orderByDesc('eleve_parents.est_principal'),
            ])
            ->latest('id');

        $eleves = $query->paginate(20)->appends($request->query());

        $classes = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with('niveau')
            ->orderBy('nom')
            ->get();

        $niveaux = Niveau::query()->orderBy('ordre')->get();

        $stats = [
            'total_eleves' => Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->where('statut', Eleve::STATUTS['actif'])
                ->count(),
            'total_garcons' => Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->where('statut', Eleve::STATUTS['actif'])
                ->where('sexe', Eleve::SEXES['M'])
                ->count(),
            'total_filles' => Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->where('statut', Eleve::STATUTS['actif'])
                ->where('sexe', Eleve::SEXES['F'])
                ->count(),
            'total_boursiers' => Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->where('est_boursier', true)
                ->count(),
            'nouveaux_ce_mois' => Eleve::query()
                ->where('etablissement_id', $etablissementId)
                ->whereHas('inscriptions', fn (Builder $builder): Builder => $builder
                    ->whereMonth('date_inscription', now()->month)
                    ->whereYear('date_inscription', now()->year)
                )
                ->count(),
        ];

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
            'classes' => $classes,
            'niveaux' => $niveaux,
            'filters' => $request->only(['search', 'classe_id', 'niveau_id', 'statut', 'sexe']),
            'stats' => $stats,
        ]);
    }

    /** Affiche le formulaire d'inscription d'un nouvel élève. */
    public function create(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $anneeActive = AnneeScolaire::query()
            ->where('etablissement_id', $etablissementId)
            ->active()
            ->first();

        $classes = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->when($anneeActive, fn (Builder $builder): Builder => $builder->where('annee_scolaire_id', $anneeActive->id))
            ->with('niveau')
            ->orderBy('nom')
            ->get();

        $niveaux = Niveau::query()->orderBy('ordre')->get();

        return Inertia::render('Eleves/Create', [
            'classes' => $classes,
            'niveaux' => $niveaux,
            'annee_active' => $anneeActive,
        ]);
    }

    /** Enregistre un élève, son parent principal et son inscription active. */
    public function store(StoreEleveRequest $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $validated = $request->validated();

        $eleve = DB::transaction(function () use ($validated, $request, $etablissementId): Eleve {
            $anneeActive = AnneeScolaire::query()
                ->where('etablissement_id', $etablissementId)
                ->active()
                ->firstOrFail();

            $eleveData = collect($validated)
                ->except(['classe_id', 'parent'])
                ->toArray();
            $eleveData['etablissement_id'] = $etablissementId;

            if ($request->hasFile('photo')) {
                $eleveData['photo'] = $request->file('photo')->store('eleves/photos', 'public');
            }

            /** @var Eleve $eleve */
            $eleve = Eleve::query()->create($eleveData);

            /** @var ParentTuteur $parentPrincipal */
            $parentPrincipal = ParentTuteur::query()->create([
                ...$validated['parent'],
                'est_contact_urgence' => (bool) ($validated['parent']['est_contact_urgence'] ?? false),
            ]);

            $eleve->parentsTuteurs()->attach($parentPrincipal->id, [
                'est_principal' => true,
                'peut_recuperer' => true,
            ]);

            $classe = Classe::query()->with('niveau')->findOrFail((int) $validated['classe_id']);
            $isCp = str_starts_with((string) $classe->niveau?->code, 'CP')
                || str_starts_with((string) $classe->niveau?->libelle, 'CP');

            Inscription::query()->create([
                'eleve_id' => $eleve->id,
                'classe_id' => (int) $validated['classe_id'],
                'annee_scolaire_id' => $anneeActive->id,
                'type' => $isCp ? Inscription::TYPES['nouvelle_inscription'] : Inscription::TYPES['reinscription'],
                'date_inscription' => now()->toDateString(),
                'statut' => Inscription::STATUTS['inscrit'],
            ]);

            return $eleve;
        });

        return redirect()
            ->route('eleves.show', $eleve->id)
            ->with('success', 'Élève inscrit avec succès');
    }

    /** Affiche la fiche complète d'un élève. */
    public function show(int $id): Response
    {
        $eleve = $this->findOwnedEleveOrFail($id);

        $inscriptionActive = $eleve->inscriptions
            ->firstWhere('statut', Inscription::STATUTS['inscrit']);

        $notes = collect($inscriptionActive?->notes ?? []);
        $paiements = collect($inscriptionActive?->paiements ?? []);
        $absences = collect($inscriptionActive?->absences ?? []);

        $totalDu = (int) $paiements->sum('montant_attendu');
        $totalPaye = (int) $paiements->sum('montant_paye');
        $solde = $totalDu - $totalPaye;

        $notesParTrimestre = [
            1 => $notes->where('trimestre', 1)->values(),
            2 => $notes->where('trimestre', 2)->values(),
            3 => $notes->where('trimestre', 3)->values(),
        ];

        $moyennesParTrimestre = collect($notesParTrimestre)->mapWithKeys(
            fn ($notesTrimestre, $trimestre): array => [
                (string) $trimestre => round((float) collect($notesTrimestre)->avg('note'), 2),
            ]
        );

        return Inertia::render('Eleves/Show', [
            'eleve' => $eleve,
            'inscription_active' => $inscriptionActive,
            'notes_par_trimestre' => $notesParTrimestre,
            'moyennes_par_trimestre' => $moyennesParTrimestre,
            'paiements' => $paiements,
            'absences' => $absences,
            'stats_financieres' => [
                'total_du' => $totalDu,
                'total_paye' => $totalPaye,
                'solde' => $solde,
                'est_a_jour' => $solde === 0,
            ],
        ]);
    }

    /** Affiche le formulaire d'édition d'un élève existant. */
    public function edit(int $id): Response
    {
        $eleve = $this->findOwnedEleveOrFail($id);

        $etablissementId = (int) auth()->user()->etablissement_id;
        $classes = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with('niveau')
            ->orderBy('nom')
            ->get();

        $niveaux = Niveau::query()->orderBy('ordre')->get();

        return Inertia::render('Eleves/Edit', [
            'eleve' => $eleve,
            'classes' => $classes,
            'niveaux' => $niveaux,
        ]);
    }

    /** Met à jour les informations administratives de l'élève. */
    public function update(UpdateEleveRequest $request, int $id): RedirectResponse
    {
        $eleve = $this->findOwnedEleveOrFail($id);

        $validated = $request->validated();

        $eleveData = collect($validated)->except(['parent', 'classe_id'])->toArray();

        if ($request->hasFile('photo')) {
            $eleveData['photo'] = $request->file('photo')->store('eleves/photos', 'public');
        }

        $eleve->update($eleveData);

        if (isset($validated['parent'])) {
            $parentPrincipal = $eleve->parentsTuteurs()
                ->wherePivot('est_principal', true)
                ->first();

            if ($parentPrincipal instanceof ParentTuteur) {
                $parentPrincipal->update($validated['parent']);
            }
        }

        return redirect()
            ->route('eleves.show', $eleve->id)
            ->with('success', 'Informations de l\'élève mises à jour avec succès');
    }

    /** Supprime logiquement un élève. */
    public function destroy(int $id): RedirectResponse
    {
        $eleve = $this->findOwnedEleveOrFail($id);
        $eleve->delete();

        return redirect()
            ->route('eleves.index')
            ->with('success', 'Élève supprimé');
    }

    /** Marque un élève comme transféré vers une autre école. */
    public function transferer(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'ecole_destination' => ['required', 'string', 'max:255'],
        ]);

        $eleve = $this->findOwnedEleveOrFail($id);
        $eleve->update(['statut' => Eleve::STATUTS['transfere']]);

        $inscriptionActive = $eleve->inscriptions()
            ->where('statut', Inscription::STATUTS['inscrit'])
            ->latest('date_inscription')
            ->first();

        if ($inscriptionActive instanceof Inscription) {
            $inscriptionActive->update([
                'statut' => Inscription::STATUTS['transfere'],
                'provenance_ecole' => $validated['ecole_destination'],
            ]);
        }

        return redirect()
            ->route('eleves.index')
            ->with('success', 'Élève transféré avec succès');
    }

    /** Exporte la liste des élèves filtrés en PDF. */
    public function exportPdf(Request $request)
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $eleves = $this->buildFilteredElevesQuery($request, $etablissementId)
            ->with([
                'inscriptions' => fn (Builder $builder): Builder => $builder->with(['classe.niveau', 'anneeScolaire']),
                'parentsTuteurs',
            ])
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();

        $classe = null;
        if ($request->filled('classe_id')) {
            $classe = Classe::query()->find((int) $request->integer('classe_id'));
        }

        $pdf = Pdf::loadView('eleves.export-pdf', [
            'eleves' => $eleves,
            'classe' => $classe,
            'date_edition' => now(),
            'filters' => $request->only(['search', 'classe_id', 'niveau_id', 'statut', 'sexe']),
        ]);

        $classeNom = $classe?->nom ? str($classe->nom)->slug() : 'toutes-classes';
        $date = now()->format('Y-m-d');

        return $pdf->download("eleves-{$classeNom}-{$date}.pdf");
    }

    /** Applique les filtres de liste/export sur les élèves de l'établissement connecté. */
    private function buildFilteredElevesQuery(Request $request, int $etablissementId): Builder
    {
        return Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->when($request->filled('search'), function (Builder $builder) use ($request): Builder {
                $search = trim((string) $request->string('search'));

                return $builder->where(function (Builder $query) use ($search): void {
                    $query->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenoms', 'like', "%{$search}%")
                        ->orWhere('matricule', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('classe_id'), fn (Builder $builder): Builder => $builder
                ->whereHas('inscriptions', fn (Builder $q): Builder => $q->where('classe_id', (int) $request->integer('classe_id')))
            )
            ->when($request->filled('niveau_id'), fn (Builder $builder): Builder => $builder
                ->whereHas('inscriptions.classe', fn (Builder $q): Builder => $q->where('niveau_id', (int) $request->integer('niveau_id')))
            )
            ->when($request->filled('statut'), fn (Builder $builder): Builder => $builder
                ->where('statut', (string) $request->string('statut'))
            )
            ->when($request->filled('sexe'), fn (Builder $builder): Builder => $builder
                ->where('sexe', (string) $request->string('sexe'))
            );
    }

    /** Retourne un élève avec ses relations complètes en vérifiant l'appartenance établissement. */
    private function findOwnedEleveOrFail(int $id): Eleve
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        /** @var Eleve $eleve */
        $eleve = Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->with([
                'inscriptions' => fn (Builder $builder): Builder => $builder
                    ->with([
                        'classe.niveau',
                        'notes.matiere',
                        'paiements.typeFrais',
                        'absences',
                    ])
                    ->latest('date_inscription'),
                'parentsTuteurs',
            ])
            ->findOrFail($id);

        return $eleve;
    }
}
