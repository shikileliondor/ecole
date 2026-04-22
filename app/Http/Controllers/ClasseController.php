<?php

declare(strict_types=1);

namespace App\Http\Controllers;

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
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'statut' => trim((string) $request->string('statut')->value()),
        ];
        $selectedId = $request->integer('classe');

        $classesQuery = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['niveau:id,libelle', 'anneeScolaire:id,libelle', 'enseignantTitulaire:id,nom,prenoms'])
            ->withCount([
                'inscriptions as effectif' => fn ($query) => $query->where('statut', Inscription::STATUTS['inscrit']),
            ])
            ->orderBy('nom');

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
            ->paginate(12)
            ->withQueryString();

        $classesItems = $classes->getCollection();

        $selectedClasse = $classesItems->firstWhere('id', $selectedId) ?? $classesItems->first();

        $detail = $selectedClasse ? $this->buildClasseDetail($selectedClasse->id, $etablissementId) : null;

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'selectedClasseId' => $selectedClasse?->id,
            'detail' => $detail,
            'filters' => [
                'search' => $filters['search'] !== '' ? $filters['search'] : null,
                'statut' => $filters['statut'] !== '' ? $filters['statut'] : null,
            ],
        ]);
    }

    private function buildClasseDetail(int $classeId, int $etablissementId): array
    {
        $classe = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['niveau:id,libelle', 'anneeScolaire:id,libelle', 'enseignantTitulaire:id,nom,prenoms'])
            ->findOrFail($classeId);

        $inscriptions = Inscription::query()
            ->where('classe_id', $classe->id)
            ->where('statut', Inscription::STATUTS['inscrit'])
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
        $defaultCreneaux = ['07:30-09:00', '09:15-10:45', '11:00-12:30', '14:00-15:30'];
        $base = collect(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'])
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

        $rawEntries = $config['classes'][$classeId] ?? null;

        if (! is_array($rawEntries)) {
            return $base->all();
        }

        return $base->map(function (array $jourData) use ($rawEntries): array {
            $jour = $jourData['jour'];
            $jourCreneaux = $rawEntries[$jour] ?? [];

            if (! is_array($jourCreneaux)) {
                return $jourData;
            }

            $creneaux = collect($jourData['creneaux'])->map(function (array $creneau) use ($jourCreneaux): array {
                $rawCreneau = $jourCreneaux[$creneau['heure']] ?? null;

                if (! is_array($rawCreneau)) {
                    return $creneau;
                }

                return [
                    'heure' => $creneau['heure'],
                    'matiere' => $rawCreneau['matiere'] ?? null,
                    'enseignant' => $rawCreneau['enseignant'] ?? null,
                    'salle' => $rawCreneau['salle'] ?? null,
                ];
            })->all();

            return [
                'jour' => $jour,
                'creneaux' => $creneaux,
            ];
        })->all();
    }
}
