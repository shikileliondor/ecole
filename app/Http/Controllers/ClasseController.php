<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Inscription;
use App\Models\ParametreConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClasseController extends Controller
{
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'statut' => trim((string) $request->string('statut')->value()),
            'ordering' => trim((string) $request->string('ordering')->value()),
        ];
        $selectedId = $request->integer('classe');

        $allowedOrdering = ['nom', '-nom', 'created_at', '-created_at'];
        if ($filters['ordering'] !== '' && ! in_array($filters['ordering'], $allowedOrdering, true)) {
            abort(422, 'Champ de tri non autorisé.');
        }

        $classesQuery = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->when($anneeActive, fn ($q) => $q->where('annee_scolaire_id', $anneeActive->id))
            ->with(['niveau:id,libelle', 'anneeScolaire:id,libelle', 'enseignantTitulaire:id,nom,prenoms'])
            ->withCount([
                'inscriptions as effectif' => fn ($query) => $query->where('statut', Inscription::STATUTS['inscrit']),
            ])
            ->when(
                $filters['ordering'] === 'created_at',
                fn ($query) => $query->orderBy('created_at'),
                fn ($query) => $query->when(
                    $filters['ordering'] === '-created_at',
                    fn ($subQuery) => $subQuery->orderByDesc('created_at'),
                    fn ($subQuery) => $subQuery->when(
                        $filters['ordering'] === '-nom',
                        fn ($nested) => $nested->orderByDesc('nom'),
                        fn ($nested) => $nested->orderBy('nom')
                    )
                )
            );

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $classesQuery->where(function ($query) use ($search): void {
                $query
                    ->where('nom', 'like', "%{$search}%")
                    ->orWhereHas('niveau', fn ($niveauQuery) => $niveauQuery->where('libelle', 'like', "%{$search}%"))
                    ->orWhereHas('anneeScolaire', fn ($anneeQuery) => $anneeQuery->where('libelle', 'like', "%{$search}%"));
            });
        }

        if ($filters['statut'] !== '') {
            $classesQuery->where('statut', $filters['statut']);
        }

        $classes = $classesQuery
            ->paginate(6)
            ->withQueryString();

        $classesItems = $classes->getCollection();

        $selectedClasse = $classesItems->firstWhere('id', $selectedId) ?? $classesItems->first();

        $detail = $selectedClasse ? $this->buildClasseDetail($selectedClasse->id, $etablissementId, $anneeActive?->id) : null;

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'selectedClasseId' => $selectedClasse?->id,
            'detail' => $detail,
            'filters' => [
                'search' => $filters['search'] !== '' ? $filters['search'] : null,
                'statut' => $filters['statut'] !== '' ? $filters['statut'] : null,
                'ordering' => $filters['ordering'] !== '' ? $filters['ordering'] : null,
            ],
        ]);
    }

    private function buildClasseDetail(int $classeId, int $etablissementId, ?int $anneeActiveId = null): array
    {
        $classe = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['niveau:id,libelle', 'anneeScolaire:id,libelle', 'enseignantTitulaire:id,nom,prenoms'])
            ->findOrFail($classeId);

        $inscriptions = Inscription::query()
            ->where('classe_id', $classe->id)
            ->where('statut', Inscription::STATUTS['inscrit'])
            ->when($anneeActiveId, fn ($q) => $q->where('annee_scolaire_id', $anneeActiveId))
            ->with('eleve:id,nom,prenoms,sexe')
            ->withAvg('notes as moyenne_generale', 'note')
            ->get();

        $classement = $inscriptions
            ->sortByDesc(fn (Inscription $inscription) => (float) ($inscription->moyenne_generale ?? -1))
            ->values()
            ->map(function (Inscription $inscription, int $index): array {
                return [
                    'rang' => $index + 1,
                    'eleve' => trim(($inscription->eleve?->prenoms ?? '') . ' ' . ($inscription->eleve?->nom ?? '')),
                    'sexe' => $inscription->eleve?->sexe,
                    'moyenne' => $inscription->moyenne_generale !== null ? round((float) $inscription->moyenne_generale, 2) : null,
                ];
            });

        $moyennesDisponibles = $classement->pluck('moyenne')->filter(static fn ($value) => $value !== null);
        $fillRate = $classe->capacite_max > 0 ? round(($inscriptions->count() / $classe->capacite_max) * 100, 2) : 0.0;

        return [
            'classe' => [
                'id' => $classe->id,
                'nom' => $classe->nom,
                'statut' => $classe->statut,
                'niveau' => $classe->niveau?->libelle,
                'annee' => $classe->anneeScolaire?->libelle,
                'salle' => $classe->salle,
                'capacite' => $classe->capacite_max,
                'titulaire' => $classe->enseignantTitulaire ? trim(($classe->enseignantTitulaire->prenoms ?? '') . ' ' . ($classe->enseignantTitulaire->nom ?? '')) : null,
            ],
            'stats' => [
                'effectif' => $inscriptions->count(),
                'fillRate' => $fillRate,
                'moyenneClasse' => $moyennesDisponibles->isNotEmpty() ? round((float) $moyennesDisponibles->avg(), 2) : null,
                'garcons' => $inscriptions->where('eleve.sexe', 'M')->count(),
                'filles' => $inscriptions->where('eleve.sexe', 'F')->count(),
            ],
            'classement' => $classement,
            'eleves' => $inscriptions->map(fn (Inscription $inscription): array => [
                'id' => $inscription->eleve?->id,
                'nomComplet' => trim(($inscription->eleve?->prenoms ?? '') . ' ' . ($inscription->eleve?->nom ?? '')),
                'sexe' => $inscription->eleve?->sexe,
                'moyenne' => $inscription->moyenne_generale !== null ? round((float) $inscription->moyenne_generale, 2) : null,
            ])->values(),
            'emploiDuTemps' => $this->resolveEmploiDuTemps($classe->id, $etablissementId),
        ];
    }

    /**
     * @return array<int, array{jour:string,creneaux:array<int, array{heure:string,matiere:?string,enseignant:?string,salle:?string}>}>
     */
    private function resolveEmploiDuTemps(int $classeId, int $etablissementId): array
    {
        $defaultCreneaux = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
        $base = collect(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'])
            ->map(fn (string $jour): array => [
                'jour' => $jour,
                'creneaux' => collect($defaultCreneaux)->map(fn (string $heure): array => [
                    'heure' => $heure,
                    'matiere' => null,
                    'enseignant' => null,
                    'salle' => null,
                ])->all(),
            ]);

        $config = ParametreConfig::query()
            ->where('etablissement_id', $etablissementId)
            ->where('onglet', 'emploi_du_temps')
            ->value('donnees');

        if (! is_array($config)) {
            return $base->all();
        }

        $entries = collect(is_array($config) ? ($config['entries'] ?? []) : [])->filter(fn ($entry) => is_array($entry) && (int) ($entry['classe_id'] ?? 0) === $classeId);

        if ($entries->isEmpty()) {
            return $base->all();
        }

        return $base->map(function (array $jourData) use ($entries): array {
            $jour = $jourData['jour'];

            return [
                'jour' => $jour,
                'creneaux' => collect($jourData['creneaux'])->map(function (array $creneau) use ($entries, $jour): array {
                    $rawCreneau = $entries->first(fn (array $entry) => ($entry['jour'] ?? null) === $jour && (($entry['heure_debut'] ?? '') . '-' . ($entry['heure_fin'] ?? '')) === $creneau['heure']);

                    return [
                        'heure' => $creneau['heure'],
                        'matiere' => $rawCreneau['matiere'] ?? null,
                        'enseignant' => $rawCreneau['enseignant'] ?? null,
                        'salle' => $rawCreneau['salle'] ?? null,
                    ];
                })->all(),
            ];
        })->all();
    }
}
