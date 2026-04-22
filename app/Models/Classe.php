<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Classe extends Model
{
    use HasFactory;

    public const STATUTS = [
        'active' => 'active',
        'inactive' => 'inactive',
    ];

    protected $fillable = [
        'etablissement_id',
        'annee_scolaire_id',
        'niveau_id',
        'nom',
        'capacite_max',
        'salle',
        'enseignant_titulaire_id',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'capacite_max' => 'integer',
            'statut' => 'string',
        ];
    }

    /** Retourne l'établissement de la classe. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne l'année scolaire de la classe. */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    /** Retourne le niveau de la classe. */
    public function niveau(): BelongsTo
    {
        return $this->belongsTo(Niveau::class);
    }

    /** Retourne l'enseignant titulaire de la classe. */
    public function enseignantTitulaire(): BelongsTo
    {
        return $this->belongsTo(Personnel::class, 'enseignant_titulaire_id');
    }

    /** Retourne les enseignants affectés à la classe. */
    public function enseignantsAffectes(): BelongsToMany
    {
        return $this->belongsToMany(Personnel::class, 'personnel_classe_affectations')
            ->withTimestamps();
    }

    /** Retourne les inscriptions de la classe. */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    /** Filtre les classes actives. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['active']);
    }

    /** Filtre les classes par niveau. */
    public function scopeParNiveau(Builder $query, int $niveauId): Builder
    {
        return $query->where('niveau_id', $niveauId);
    }

    /** Filtre les classes par année scolaire. */
    public function scopeParAnnee(Builder $query, int $anneeScolaireId): Builder
    {
        return $query->where('annee_scolaire_id', $anneeScolaireId);
    }

    /** Compte les élèves inscrits activement dans la classe. */
    protected function nombreEleves(): Attribute
    {
        return Attribute::make(
            get: fn (): int => $this->inscriptions()
                ->where('statut', Inscription::STATUTS['inscrit'])
                ->count()
        );
    }

    /** Calcule le taux de remplissage de la classe en pourcentage. */
    protected function tauxRemplissage(): Attribute
    {
        return Attribute::make(
            get: fn (): float => $this->capacite_max > 0
                ? round(($this->nombre_eleves / $this->capacite_max) * 100, 2)
                : 0.0
        );
    }

    /** Indique si la classe est pleine. */
    protected function estPleine(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->nombre_eleves >= $this->capacite_max
        );
    }
}
