<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonnelRequest;
use App\Models\Classe;
use App\Models\Personnel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelController extends Controller
{
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $filters = [
            'search'    => trim((string) $request->string('search')->value()),
            'categorie' => trim((string) $request->string('categorie')->value()),
        ];

        $personnel = Personnel::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['documents:id,personnel_id,libelle', 'classesAffectees:id,nom'])
            ->when($filters['search'] !== '', function ($q) use ($filters): void {
                $s = $filters['search'];
                $q->where(fn ($inner) => $inner
                    ->where('nom', 'like', "%{$s}%")
                    ->orWhere('prenoms', 'like', "%{$s}%")
                    ->orWhere('telephone', 'like', "%{$s}%")
                    ->orWhere('matricule_interne', 'like', "%{$s}%")
                );
            })
            ->when($filters['categorie'] !== '', fn ($q) => $q->where('categorie', $filters['categorie']))
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->paginate(15)
            ->through(fn (Personnel $p) => [
                'id'                 => $p->id,
                'matricule_interne'  => $p->matricule_interne,
                'nom'                => $p->nom,
                'prenoms'            => $p->prenoms,
                'nom_complet'        => $p->nom_complet,
                'categorie'          => $p->categorie,
                'type'               => $p->type,
                'poste'              => $p->poste,
                'specialite'         => $p->specialite,
                'telephone'          => $p->telephone,
                'whatsapp'           => $p->whatsapp,
                'email'              => $p->email,
                'sexe'               => $p->sexe,
                'date_naissance'     => $p->date_naissance?->format('Y-m-d'),
                'lieu_naissance'     => $p->lieu_naissance,
                'nationalite'        => $p->nationalite,
                'diplome'            => $p->diplome,
                'est_certifie_mena'  => (bool) $p->est_certifie_mena,
                'numero_badge_mena'  => $p->numero_badge_mena,
                'date_embauche'      => $p->date_embauche?->format('Y-m-d'),
                'type_contrat'       => $p->type_contrat,
                'salaire_base'       => (int) $p->salaire_base,
                'statut'             => $p->statut,
                'anciennete'         => $p->anciennete,
                'photo_url'          => $p->photo ? asset('storage/' . $p->photo) : null,
                'classes_affectees'  => $p->classesAffectees->map(fn ($c) => ['id' => $c->id, 'nom' => $c->nom])->values(),
                'documents'          => $p->documents->map(fn ($d) => ['id' => $d->id, 'libelle' => $d->libelle])->values(),
            ])
            ->withQueryString();

        // Counts globaux (indépendants des filtres actifs)
        $base = Personnel::query()->where('etablissement_id', $etablissementId);
        $stats = [
            'total'          => (clone $base)->count(),
            'enseignants'    => (clone $base)->where('categorie', 'enseignant')->count(),
            'personnel_ecole'=> (clone $base)->where('categorie', 'personnel_ecole')->count(),
            'actifs'         => (clone $base)->where('statut', 'actif')->count(),
            'certifies_mena' => (clone $base)->where('est_certifie_mena', true)->count(),
        ];

        return Inertia::render('Personnel/Index', [
            'personnel' => $personnel,
            'stats'     => $stats,
            'filters'   => [
                'search'    => $filters['search'] !== '' ? $filters['search'] : null,
                'categorie' => $filters['categorie'] !== '' ? $filters['categorie'] : null,
            ],
            'options'   => [
                'categories'    => Personnel::CATEGORIES,
                'types'         => Personnel::TYPES,
                'typesContrat'  => Personnel::TYPES_CONTRAT,
                'statuts'       => Personnel::STATUTS,
                'sexes'         => Personnel::SEXES,
                'diplomes'      => Personnel::DIPLOMES,
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
        $validated       = $request->validated();

        $personnel = DB::transaction(function () use ($validated, $request, $etablissementId): Personnel {
            $personnel = Personnel::query()->create([
                'etablissement_id'  => $etablissementId,
                'matricule_interne' => $validated['matricule_interne'] ?? null,
                'nom'               => $validated['nom'],
                'prenoms'           => $validated['prenoms'],
                'sexe'              => $validated['sexe'],
                'date_naissance'    => $validated['date_naissance'] ?? null,
                'lieu_naissance'    => $validated['lieu_naissance'] ?? null,
                'nationalite'       => $validated['nationalite'] ?? 'Ivoirienne',
                'telephone'         => $validated['telephone'],
                'whatsapp'          => $validated['whatsapp'] ?? null,
                'email'             => $validated['email'] ?? null,
                'categorie'         => $validated['categorie'],
                'type'              => $validated['type'],
                'poste'             => $validated['poste'] ?? null,
                'specialite'        => $validated['specialite'] ?? null,
                'diplome'           => $validated['diplome'] ?? null,
                'est_certifie_mena' => (bool) ($validated['est_certifie_mena'] ?? false),
                'numero_badge_mena' => $validated['numero_badge_mena'] ?? null,
                'date_embauche'     => $validated['date_embauche'],
                'type_contrat'      => $validated['type_contrat'],
                'salaire_base'      => $validated['salaire_base'],
                'statut'            => $validated['statut'],
            ]);

            // Photo
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store("personnel/{$personnel->id}/photo", 'public');
                $personnel->update(['photo' => $path]);
            }

            // Documents
            foreach ($validated['documents'] ?? [] as $index => $doc) {
                $uploaded = $request->file("documents.{$index}.fichier");
                if ($uploaded === null) {
                    continue;
                }
                $path = $uploaded->store("personnel/{$personnel->id}/documents", 'public');
                $personnel->documents()->create([
                    'libelle'     => $doc['libelle'],
                    'description' => $doc['description'] ?? null,
                    'fichier_path'=> $path,
                ]);
            }

            // Classes (enseignants uniquement)
            if ($validated['categorie'] === Personnel::CATEGORIES['enseignant']) {
                $ids = collect($validated['classes_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values()->all();
                $personnel->classesAffectees()->sync($ids);
            }

            return $personnel;
        });

        return redirect()->route('personnel.index')
            ->with('success', "Fiche de {$personnel->nom_complet} créée avec succès.");
    }

    public function update(Request $request, Personnel $personnel): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($personnel->etablissement_id === $etablissementId, 403);

        $validated = $request->validate([
            'nom'               => ['required', 'string', 'max:120'],
            'prenoms'           => ['required', 'string', 'max:160'],
            'sexe'              => ['required', Rule::in(array_keys(Personnel::SEXES))],
            'date_naissance'    => ['nullable', 'date'],
            'lieu_naissance'    => ['nullable', 'string', 'max:150'],
            'nationalite'       => ['nullable', 'string', 'max:100'],
            'telephone'         => ['required', 'string', 'max:40'],
            'whatsapp'          => ['nullable', 'string', 'max:40'],
            'email'             => ['nullable', 'email', 'max:180'],
            'categorie'         => ['required', Rule::in(array_keys(Personnel::CATEGORIES))],
            'type'              => ['required', Rule::in(array_keys(Personnel::TYPES))],
            'poste'             => ['nullable', 'string', 'max:150'],
            'specialite'        => ['nullable', 'string', 'max:150'],
            'diplome'           => ['nullable', Rule::in(array_keys(Personnel::DIPLOMES))],
            'est_certifie_mena' => ['boolean'],
            'numero_badge_mena' => ['nullable', 'string', 'max:80'],
            'date_embauche'     => ['required', 'date'],
            'type_contrat'      => ['required', Rule::in(array_keys(Personnel::TYPES_CONTRAT))],
            'salaire_base'      => ['required', 'integer', 'min:0'],
            'statut'            => ['required', Rule::in(array_keys(Personnel::STATUTS))],
            'photo'             => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'classes_ids'       => ['array'],
            'classes_ids.*'     => ['integer', 'exists:classes,id'],
        ]);

        $data = collect($validated)->except(['photo', 'classes_ids'])->all();
        $data['est_certifie_mena'] = (bool) ($validated['est_certifie_mena'] ?? false);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store("personnel/{$personnel->id}/photo", 'public');
            $data['photo'] = $path;
        }

        $personnel->update($data);

        $ids = collect($validated['classes_ids'] ?? [])->map(fn ($id) => (int) $id)->unique()->values()->all();
        if ($validated['categorie'] === Personnel::CATEGORIES['enseignant']) {
            $personnel->classesAffectees()->sync($ids);
        } else {
            $personnel->classesAffectees()->sync([]);
        }

        return redirect()->route('personnel.index')
            ->with('success', "Fiche de {$personnel->nom_complet} mise à jour.");
    }

    public function destroy(Personnel $personnel): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($personnel->etablissement_id === $etablissementId, 403);

        $nom = $personnel->nom_complet;
        $personnel->delete();

        return redirect()->route('personnel.index')
            ->with('success', "{$nom} a été supprimé(e).");
    }
}
