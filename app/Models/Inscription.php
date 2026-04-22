<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscription extends Model
{
    use HasFactory;

    public const TYPES = [
        'nouvelle_inscription' => 'nouvelle_inscription',
        'reinscription' => 'reinscription',
    ];

    public const STATUTS = [
        'inscrit' => 'inscrit',
        'transfere' => 'transfere',
        'abandonne' => 'abandonne',
    ];

    protected $fillable = [
        'eleve_id',
        'classe_id',
        'annee_scolaire_id',
        'date_inscription',
        'type',
        'provenance_ecole',
        'statut',
        'numero_ordre',
    ];

    protected function casts(): array
    {
        return [
            'date_inscription' => 'date',
        ];
    }

    /** Retourne l'élève concerné par l'inscription. */
    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    /** Retourne la classe de l'inscription. */
    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    /** Retourne l'année scolaire de l'inscription. */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }


    /** Retourne les documents justificatifs de l'inscription. */
    public function documents(): HasMany
    {
        return $this->hasMany(InscriptionDocument::class);
    }

    /** Retourne les notes liées à l'inscription. */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /** Retourne les paiements liés à l'inscription. */
    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    /** Retourne les absences liées à l'inscription. */
    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    /** Filtre les inscriptions actives. */
    public function scopeActives(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['inscrit']);
    }

    /** Filtre les inscriptions par classe. */
    public function scopeParClasse(Builder $query, int $classeId): Builder
    {
        return $query->where('classe_id', $classeId);
    }

    /** Filtre les inscriptions par année scolaire. */
    public function scopeParAnnee(Builder $query, int $anneeScolaireId): Builder
    {
        return $query->where('annee_scolaire_id', $anneeScolaireId);
    }

    /** Filtre les inscriptions par trimestre via les notes. */
    public function scopeParTrimestre(Builder $query, int $trimestre): Builder
    {
        return $query->whereHas('notes', fn (Builder $q): Builder => $q->where('trimestre', $trimestre));
    }

    /** Calcule le total dû en additionnant les frais obligatoires applicables. */
    protected function montantTotalDu(): Attribute
    {
        return Attribute::make(
            get: function (): int {
                $niveauId = $this->classe?->niveau_id;
                $classeId = $this->classe_id;

                return (int) TypeFrais::query()
                    ->where('etablissement_id', $this->classe?->etablissement_id)
                    ->where('annee_scolaire_id', $this->annee_scolaire_id)
                    ->where('est_obligatoire', true)
                    ->where(function (Builder $query) use ($classeId): void {
                        $query->whereNull('classe_id');
                        if ($classeId !== null) {
                            $query->orWhere('classe_id', $classeId);
                        }
                    })
                    ->where(function (Builder $query) use ($niveauId): void {
                        $query->whereNull('niveau_id');
                        if ($niveauId !== null) {
                            $query->orWhere('niveau_id', $niveauId);
                        }
                    })
                    ->sum('montant');
            }
        );
    }

    /** Calcule le total payé de l'inscription. */
    protected function montantTotalPaye(): Attribute
    {
        return Attribute::make(
            get: fn (): int => (int) $this->paiements()->sum('montant_paye')
        );
    }

    /** Calcule le montant restant à payer. */
    protected function montantRestant(): Attribute
    {
        return Attribute::make(
            get: fn (): int => max(0, $this->montant_total_du - $this->montant_total_paye)
        );
    }

    /** Indique si l'inscription est totalement soldée. */
    protected function estAJour(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->montant_restant === 0
        );
    }

    /** Retourne le nombre total d'absences. */
    protected function nombreAbsences(): Attribute
    {
        return Attribute::make(
            get: fn (): int => $this->absences()->count()
        );
    }
}
