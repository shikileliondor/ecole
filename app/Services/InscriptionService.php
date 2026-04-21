<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\InscriptionDocument;
use App\Models\ParentTuteur;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InscriptionService
{
    public function index(array $filters, int $etablissementId): LengthAwarePaginator
    {
        return Inscription::query()
            ->whereHas('eleve', fn ($q) => $q->where('etablissement_id', $etablissementId))
            ->with(['eleve', 'classe.niveau', 'anneeScolaire', 'documents'])
            ->when(! empty($filters['search']), function ($q) use ($filters): void {
                $search = trim((string) $filters['search']);
                $q->whereHas('eleve', fn ($eq) => $eq->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenoms', 'like', "%{$search}%")
                    ->orWhere('matricule', 'like', "%{$search}%"));
            })
            ->when(! empty($filters['classe_id']), fn ($q) => $q->where('classe_id', (int) $filters['classe_id']))
            ->when(! empty($filters['annee_scolaire_id']), fn ($q) => $q->where('annee_scolaire_id', (int) $filters['annee_scolaire_id']))
            ->when(! empty($filters['statut']), fn ($q) => $q->where('statut', (string) $filters['statut']))
            ->latest('id')
            ->paginate(20)
            ->appends($filters);
    }

    public function store(array $data, int $etablissementId): Inscription
    {
        return DB::transaction(function () use ($data, $etablissementId): Inscription {
            $typeInscription = $data['type_inscription'];

            $eleve = $typeInscription === 'reinscription'
                ? Eleve::query()->where('etablissement_id', $etablissementId)->findOrFail((int) $data['eleve_id'])
                : $this->createEleve($data, $etablissementId);

            $this->attachTuteurs($eleve, $data);

            $inscription = Inscription::query()->create([
                'eleve_id' => $eleve->id,
                'classe_id' => (int) $data['classe_id'],
                'annee_scolaire_id' => (int) $data['annee_scolaire_id'],
                'date_inscription' => $data['date_inscription'],
                'type' => $typeInscription === 'reinscription' ? Inscription::TYPES['reinscription'] : Inscription::TYPES['nouvelle_inscription'],
                'statut' => $data['statut'],
            ]);

            $eleve->update(['est_boursier' => (bool) ($data['boursier'] ?? false)]);

            $this->saveDocuments($inscription, $data['documents'] ?? []);

            return $inscription->fresh(['eleve', 'classe.niveau', 'anneeScolaire', 'documents']) ?? $inscription;
        });
    }

    public function update(Inscription $inscription, array $data): Inscription
    {
        $inscription->update([
            'classe_id' => (int) $data['classe_id'],
            'date_inscription' => $data['date_inscription'],
            'statut' => $data['statut'],
        ]);

        $inscription->eleve->update(['est_boursier' => (bool) ($data['boursier'] ?? false)]);

        return $inscription->fresh(['eleve', 'classe.niveau', 'anneeScolaire', 'documents']) ?? $inscription;
    }

    private function createEleve(array $data, int $etablissementId): Eleve
    {
        $eleve = Eleve::query()->create([
            'etablissement_id' => $etablissementId,
            'nom' => $data['nom'],
            'prenoms' => $data['prenoms'],
            'date_naissance' => $data['date_naissance'],
            'lieu_naissance' => $data['lieu_naissance'],
            'pays_naissance' => "Côte d'Ivoire",
            'sexe' => $data['sexe'],
            'nationalite' => $data['nationalite'],
            'extrait_naissance_numero' => $data['reference_extrait'] ?? null,
            'statut' => Eleve::STATUTS['actif'],
        ]);

        if (($data['photo'] ?? null) instanceof UploadedFile) {
            $photoPath = $data['photo']->storeAs('eleves/photos', sprintf('%s.%s', (string) $eleve->matricule, $data['photo']->getClientOriginalExtension()), 'public');
            $eleve->update(['photo' => $photoPath]);
        }

        return $eleve;
    }

    private function attachTuteurs(Eleve $eleve, array $data): void
    {
        $mode = $data['mode_tuteur'] ?? 'create';

        $parentPrincipal = match ($mode) {
            'attach' => ParentTuteur::query()->findOrFail((int) $data['parent_tuteur_id']),
            'replace', 'create' => ParentTuteur::query()->create([
                'nom' => $data['nom_tuteur'],
                'prenoms' => $data['prenoms_tuteur'],
                'lien' => $data['lien_parente'],
                'telephone_1' => $data['telephone_tuteur'],
                'email' => $data['email_tuteur'] ?? null,
                'adresse_quartier' => $data['adresse_tuteur'] ?? null,
                'est_payeur' => true,
            ]),
            default => ParentTuteur::query()->create([
                'nom' => $data['nom_tuteur'],
                'prenoms' => $data['prenoms_tuteur'],
                'lien' => $data['lien_parente'],
                'telephone_1' => $data['telephone_tuteur'],
            ]),
        };

        if ($mode === 'replace') {
            $eleve->parentsTuteurs()->detach();
        }

        $eleve->parentsTuteurs()->syncWithoutDetaching([
            $parentPrincipal->id => ['est_principal' => true, 'peut_recuperer' => true],
        ]);

        $contactUrgence = ParentTuteur::query()->create([
            'nom' => $data['nom_urgence'],
            'prenoms' => $data['lien_urgence'],
            'lien' => 'tuteur',
            'telephone_1' => $data['telephone_urgence'],
            'adresse_quartier' => $data['adresse_urgence'] ?? null,
            'est_contact_urgence' => true,
            'est_payeur' => false,
        ]);

        $eleve->parentsTuteurs()->syncWithoutDetaching([
            $contactUrgence->id => ['est_principal' => false, 'peut_recuperer' => true],
        ]);
    }

    private function saveDocuments(Inscription $inscription, array $documents): void
    {
        foreach ($documents as $document) {
            if (! (($document['fichier'] ?? null) instanceof UploadedFile)) {
                continue;
            }

            $path = $document['fichier']->store('inscriptions/documents', 'public');

            InscriptionDocument::query()->create([
                'inscription_id' => $inscription->id,
                'libelle' => $document['libelle'] ?? 'Document',
                'description' => $document['description'] ?? null,
                'fichier_path' => $path,
            ]);
        }
    }
}
