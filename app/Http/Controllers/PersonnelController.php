<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonnelRequest;
use App\Models\Classe;
use App\Models\Personnel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelController extends Controller
{
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'categorie' => trim((string) $request->string('categorie')->value()),
        ];

        $personnel = Personnel::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['documents:id,personnel_id,libelle', 'classesAffectees:id,nom'])
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];
                $query->where(function ($inner) use ($search): void {
                    $inner->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenoms', 'like', "%{$search}%")
                        ->orWhere('telephone', 'like', "%{$search}%")
                        ->orWhere('matricule_interne', 'like', "%{$search}%");
                });
            })
            ->when($filters['categorie'] !== '', fn ($query) => $query->where('categorie', $filters['categorie']))
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Personnel/Index', [
            'personnel' => $personnel,
            'filters' => [
                'search' => $filters['search'] !== '' ? $filters['search'] : null,
                'categorie' => $filters['categorie'] !== '' ? $filters['categorie'] : null,
            ],
            'options' => [
                'categories' => Personnel::CATEGORIES,
                'types' => Personnel::TYPES,
                'typesContrat' => Personnel::TYPES_CONTRAT,
                'statuts' => Personnel::STATUTS,
                'sexes' => Personnel::SEXES,
            ],
            'classes' => Classe::query()
                ->where('etablissement_id', $etablissementId)
                ->orderBy('nom')
                ->get(['id', 'nom']),
        ]);
    }

    public function store(StorePersonnelRequest $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $validated = $request->validated();

        $personnel = DB::transaction(function () use ($validated, $request, $etablissementId): Personnel {
            $personnel = Personnel::query()->create([
                'etablissement_id' => $etablissementId,
                'matricule_interne' => $validated['matricule_interne'] ?? null,
                'nom' => $validated['nom'],
                'prenoms' => $validated['prenoms'],
                'sexe' => $validated['sexe'],
                'date_naissance' => $validated['date_naissance'] ?? null,
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'nationalite' => $validated['nationalite'] ?? 'Ivoirienne',
                'telephone' => $validated['telephone'],
                'email' => $validated['email'] ?? null,
                'categorie' => $validated['categorie'],
                'type' => $validated['type'],
                'diplome' => null,
                'date_embauche' => $validated['date_embauche'],
                'type_contrat' => $validated['type_contrat'],
                'salaire_base' => $validated['salaire_base'],
                'statut' => $validated['statut'],
            ]);

            $documents = $validated['documents'] ?? [];
            foreach ($documents as $index => $doc) {
                $uploaded = $request->file("documents.{$index}.fichier");
                if ($uploaded === null) {
                    continue;
                }

                $path = $uploaded->store("personnel/{$personnel->id}/documents", 'public');
                $personnel->documents()->create([
                    'libelle' => $doc['libelle'],
                    'description' => $doc['description'] ?? null,
                    'fichier_path' => $path,
                ]);
            }

            $classesIds = collect($validated['classes_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values()->all();
            if ($validated['categorie'] === Personnel::CATEGORIES['enseignant']) {
                $personnel->classesAffectees()->sync($classesIds);
            }

            return $personnel;
        });

        return redirect()->route('personnel.index')->with('success', "Fiche du personnel {$personnel->nom_complet} créée avec succès.");
    }
}
