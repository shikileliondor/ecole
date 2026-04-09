<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Etablissement extends Model
{
    use HasFactory;

    public const TYPES = [
        'prive_laic' => 'prive_laic',
        'prive_catholique' => 'prive_catholique',
        'prive_protestant' => 'prive_protestant',
        'prive_islamique' => 'prive_islamique',
    ];

    public const CYCLES = [
        'primaire' => 'primaire',
        'maternel_primaire' => 'maternel_primaire',
    ];

    public const STATUTS = [
        'actif' => 'actif',
        'inactif' => 'inactif',
    ];

    protected $fillable = [
        'nom',
        'sigle',
        'type',
        'cycle',
        'agrement_mena',
        'directeur_nom',
        'localisation_ville',
        'localisation_commune',
        'localisation_quartier',
        'contact_telephone',
        'contact_whatsapp',
        'contact_email',
        'logo',
        'devise',
        'annee_creation',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'annee_creation' => 'integer',
            'statut' => 'string',
        ];
    }

    /** Retourne les années scolaires de l'établissement. */
    public function anneesScolaires(): HasMany
    {
        return $this->hasMany(AnneeScolaire::class);
    }

    /** Retourne les classes de l'établissement. */
    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class);
    }

    /** Retourne les élèves de l'établissement. */
    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class);
    }

    /** Retourne le personnel de l'établissement. */
    public function personnel(): HasMany
    {
        return $this->hasMany(Personnel::class);
    }

    /** Retourne les types de frais de l'établissement. */
    public function typesFrais(): HasMany
    {
        return $this->hasMany(TypeFrais::class);
    }

    /** Retourne les utilisateurs liés à l'établissement. */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** Filtre les établissements actifs. */
    public function scopeActif(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['actif']);
    }

    /** Filtre les établissements privés en Côte d'Ivoire. */
    public function scopePriveCI(Builder $query): Builder
    {
        return $query->whereIn('type', array_values(self::TYPES));
    }

    /** Construit l'adresse complète de l'établissement. */
    protected function adresseComplete(): Attribute
    {
        return Attribute::make(
            get: fn (): string => collect([
                $this->localisation_commune,
                $this->localisation_quartier,
                $this->localisation_ville,
            ])->filter()->implode(', ')
        );
    }
}
