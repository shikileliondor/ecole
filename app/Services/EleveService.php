<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\ParentTuteur;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EleveService
{
    public function getElevesAvecFiltres(array $filters, int $etablissementId): LengthAwarePaginator
    {
        return Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->when(! empty($filters['search']), function (Builder $builder) use ($filters): Builder {
                $search = trim((string) $filters['search']);
                return $builder->where(function (Builder $query) use ($search): void {
                    $query->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenoms', 'like', "%{$search}%")
                        ->orWhere('matricule', 'like', "%{$search}%");
                });
            })
            ->when(! empty($filters['classe_id']), fn (Builder $builder): Builder => $builder->whereHas('inscriptions', fn (Builder $q): Builder => $q->where('classe_id', (int) $filters['classe_id'])))
            ->when(! empty($filters['niveau_id']), fn (Builder $builder): Builder => $builder->whereHas('inscriptions.classe', fn (Builder $q): Builder => $q->where('niveau_id', (int) $filters['niveau_id'])))
            ->when(! empty($filters['statut']), fn (Builder $builder): Builder => $builder->where('statut', (string) $filters['statut']))
            ->when(! empty($filters['sexe']), fn (Builder $builder): Builder => $builder->where('sexe', (string) $filters['sexe']))
            ->with([
                'inscriptions' => fn (Builder $builder): Builder => $builder->actives()->with(['classe.niveau'])->latest('date_inscription'),
                'parentsTuteurs' => fn (Builder $builder): Builder => $builder->orderByDesc('eleve_parents.est_principal'),
            ])
            ->latest('id')
            ->paginate(20)
            ->appends($filters);
    }

    public function getStatsEleves(int $etablissementId, int $anneeScolaireId): array
    {
        return [
            'total_eleves' => Eleve::query()->where('etablissement_id', $etablissementId)->where('statut', Eleve::STATUTS['actif'])->count(),
            'total_garcons' => Eleve::query()->where('etablissement_id', $etablissementId)->where('statut', Eleve::STATUTS['actif'])->where('sexe', Eleve::SEXES['M'])->count(),
            'total_filles' => Eleve::query()->where('etablissement_id', $etablissementId)->where('statut', Eleve::STATUTS['actif'])->where('sexe', Eleve::SEXES['F'])->count(),
            'total_boursiers' => Eleve::query()->where('etablissement_id', $etablissementId)->where('est_boursier', true)->count(),
            'nouveaux_ce_mois' => Eleve::query()->where('etablissement_id', $etablissementId)->whereHas('inscriptions', fn (Builder $builder): Builder => $builder
                ->where('annee_scolaire_id', $anneeScolaireId)
                ->whereMonth('date_inscription', now()->month)
                ->whereYear('date_inscription', now()->year))->count(),
        ];
    }

    public function getFicheEleve(int $id, int $etablissementId): Eleve
    {
        $eleve = Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->with([
                'inscriptions' => fn (Builder $builder): Builder => $builder->with(['classe.niveau', 'anneeScolaire', 'notes.matiere', 'paiements.typeFrais', 'absences'])->latest('date_inscription'),
                'parentsTuteurs',
            ])
            ->findOrFail($id);

        return $eleve;
    }

    public function getNotesParTrimestre(int $inscriptionId): array
    {
        $notes = Inscription::query()->with('notes.matiere')->findOrFail($inscriptionId)->notes;

        return [
            1 => $notes->where('trimestre', 1)->values(),
            2 => $notes->where('trimestre', 2)->values(),
            3 => $notes->where('trimestre', 3)->values(),
        ];
    }

    public function getStatsFinancieres(int $inscriptionId): array
    {
        $inscription = Inscription::query()->with('paiements')->findOrFail($inscriptionId);
        $totalDu = (int) $inscription->paiements->sum('montant_attendu');
        $totalPaye = (int) $inscription->paiements->sum('montant_paye');
        $solde = $totalDu - $totalPaye;

        return ['total_du' => $totalDu, 'total_paye' => $totalPaye, 'solde' => $solde, 'est_a_jour' => $solde === 0];
    }

    public function creerEleve(array $data, int $etablissementId): Eleve
    {
        return DB::transaction(function () use ($data, $etablissementId): Eleve {
            $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->firstOrFail();
            $eleveData = collect($data)->except(['classe_id', 'parent'])->toArray();
            $eleveData['etablissement_id'] = $etablissementId;

            /** @var Eleve $eleve */
            $eleve = Eleve::query()->create($eleveData);

            if (($data['photo'] ?? null) instanceof UploadedFile) {
                $eleve->update(['photo' => $this->uploadPhoto($data['photo'], (string) $eleve->matricule)]);
            }

            /** @var ParentTuteur $parentPrincipal */
            $parentPrincipal = ParentTuteur::query()->create([
                ...($data['parent'] ?? []),
                'est_contact_urgence' => (bool) data_get($data, 'parent.est_contact_urgence', false),
            ]);

            $eleve->parentsTuteurs()->attach($parentPrincipal->id, ['est_principal' => true, 'peut_recuperer' => true]);

            $classe = Classe::query()->with('niveau')->findOrFail((int) $data['classe_id']);
            $isCp = str_starts_with((string) $classe->niveau?->libelle, 'CP');

            Inscription::query()->create([
                'eleve_id' => $eleve->id,
                'classe_id' => (int) $data['classe_id'],
                'annee_scolaire_id' => $anneeActive->id,
                'type' => $isCp ? Inscription::TYPES['nouvelle_inscription'] : Inscription::TYPES['reinscription'],
                'date_inscription' => now()->toDateString(),
                'statut' => Inscription::STATUTS['inscrit'],
            ]);

            return $eleve->fresh(['inscriptions.classe.niveau', 'parentsTuteurs']) ?? $eleve;
        });
    }

    public function mettreAJourEleve(int $id, array $data): Eleve
    {
        /** @var Eleve $eleve */
        $eleve = Eleve::query()->with('parentsTuteurs')->findOrFail($id);
        $eleveData = collect($data)->except(['parent', 'classe_id'])->toArray();

        if (($data['photo'] ?? null) instanceof UploadedFile) {
            $eleveData['photo'] = $this->uploadPhoto($data['photo'], (string) $eleve->matricule);
        }

        $eleve->update($eleveData);

        if (! empty($data['parent'])) {
            $parent = $eleve->parentsTuteurs()->wherePivot('est_principal', true)->first();
            if ($parent instanceof ParentTuteur) {
                $parent->update($data['parent']);
            }
        }

        return $eleve->fresh(['inscriptions.classe.niveau', 'parentsTuteurs']) ?? $eleve;
    }

    public function transfererEleve(int $id, string $ecoleDestination): Eleve
    {
        /** @var Eleve $eleve */
        $eleve = Eleve::query()->with('inscriptions')->findOrFail($id);
        $eleve->update(['statut' => Eleve::STATUTS['transfere']]);

        $inscriptionActive = $eleve->inscriptions->firstWhere('statut', Inscription::STATUTS['inscrit']);
        if ($inscriptionActive instanceof Inscription) {
            $inscriptionActive->update([
                'statut' => Inscription::STATUTS['transfere'],
                'provenance_ecole' => $ecoleDestination,
            ]);
        }

        return $eleve;
    }

    public function supprimerEleve(int $id): bool
    {
        return (bool) Eleve::query()->findOrFail($id)->delete();
    }

    public function getListePourExport(array $filters, int $etablissementId): Collection
    {
        return Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->when(! empty($filters['search']), fn (Builder $builder): Builder => $builder->where(function (Builder $query) use ($filters): void {
                $search = trim((string) $filters['search']);
                $query->where('nom', 'like', "%{$search}%")->orWhere('prenoms', 'like', "%{$search}%")->orWhere('matricule', 'like', "%{$search}%");
            }))
            ->when(! empty($filters['classe_id']), fn (Builder $builder): Builder => $builder->whereHas('inscriptions', fn (Builder $q): Builder => $q->where('classe_id', (int) $filters['classe_id'])))
            ->when(! empty($filters['niveau_id']), fn (Builder $builder): Builder => $builder->whereHas('inscriptions.classe', fn (Builder $q): Builder => $q->where('niveau_id', (int) $filters['niveau_id'])))
            ->when(! empty($filters['statut']), fn (Builder $builder): Builder => $builder->where('statut', (string) $filters['statut']))
            ->when(! empty($filters['sexe']), fn (Builder $builder): Builder => $builder->where('sexe', (string) $filters['sexe']))
            ->with(['inscriptions' => fn (Builder $builder): Builder => $builder->with(['classe.niveau', 'anneeScolaire']), 'parentsTuteurs'])
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get();
    }

    public function uploadPhoto(UploadedFile $photo, string $matricule): string
    {
        $filename = $matricule . '.' . $photo->getClientOriginalExtension();
        return $photo->storeAs('eleves/photos', $filename, 'public');
    }
}
