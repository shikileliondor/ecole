<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class AnneeScolaire extends Model
{
    use HasFactory;

    public const STATUTS = [
        'en_cours' => 'en_cours',
        'cloturee' => 'cloturee',
    ];

    protected $fillable = [
        'etablissement_id',
        'libelle',
        'date_debut',
        'date_fin',
        'est_active',
        'nb_trimestres',
        'date_rentree_officielle',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'date_rentree_officielle' => 'date',
            'est_active' => 'boolean',
        ];
    }

    /** Retourne l'établissement de l'année scolaire. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne les classes de l'année scolaire. */
    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class);
    }

    /** Retourne les inscriptions de l'année scolaire. */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    /** Retourne les notes de l'année scolaire. */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /** Retourne les types de frais de l'année scolaire. */
    public function typesFrais(): HasMany
    {
        return $this->hasMany(TypeFrais::class);
    }

    /** Retourne les paiements de l'année scolaire via les inscriptions. */
    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'inscription_id', 'id')
            ->whereHas('inscription', fn (Builder $query) => $query->where('annee_scolaire_id', $this->id));
    }

    /** Retourne les salaires de l'année scolaire. */
    public function salaires(): HasMany
    {
        return $this->hasMany(Salaire::class);
    }

    /** Filtre les années actives. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('est_active', true);
    }

    /** Filtre les années en cours. */
    public function scopeEnCours(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['en_cours']);
    }

    /** Indique si l'année scolaire est terminée. */
    protected function estTerminee(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => (bool) $this->date_fin?->lt(Carbon::today())
        );
    }

    /** Retourne la durée de l'année scolaire en mois. */
    protected function dureeEnMois(): Attribute
    {
        return Attribute::make(
            get: fn (): int => $this->date_debut && $this->date_fin
                ? $this->date_debut->diffInMonths($this->date_fin)
                : 0
        );
    }
}
