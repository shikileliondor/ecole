<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeFrais extends Model
{
    use HasFactory;

    public const FREQUENCES = [
        'unique' => 'unique',
        'trimestriel' => 'trimestriel',
        'mensuel' => 'mensuel',
    ];

    protected $table = 'types_frais';

    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'niveau_id',
        'libelle',
        'montant',
        'est_obligatoire',
        'frequence',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'integer',
            'est_obligatoire' => 'boolean',
        ];
    }

    /** Retourne l'établissement du type de frais. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne l'année scolaire du type de frais. */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    /** Retourne le niveau associé si défini. */
    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class);
    }

    /** Retourne les paiements liés à ce type de frais. */
    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    /** Filtre les types de frais obligatoires. */
    public function scopeObligatoires(Builder $query): Builder
    {
        return $query->where('est_obligatoire', true);
    }

    /** Filtre les types de frais par niveau. */
    public function scopeParNiveau(Builder $query, int $niveauId): Builder
    {
        return $query->where('niveau_id', $niveauId);
    }

    /** Filtre les types de frais par année scolaire. */
    public function scopeParAnnee(Builder $query, int $anneeScolaireId): Builder
    {
        return $query->where('annee_scolaire_id', $anneeScolaireId);
    }

    /** Retourne le montant formaté en FCFA. */
    protected function montantFormatte(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format((int) $this->montant, 0, ',', ' ') . ' FCFA'
        );
    }
}
