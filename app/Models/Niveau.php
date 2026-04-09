<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Niveau extends Model
{
    use HasFactory;

    public const CYCLES = [
        'CP' => 'CP',
        'CE' => 'CE',
        'CM' => 'CM',
    ];

    public const LIBELLES = [
        'CP1' => 'CP1',
        'CP2' => 'CP2',
        'CE1' => 'CE1',
        'CE2' => 'CE2',
        'CM1' => 'CM1',
        'CM2' => 'CM2',
    ];

    protected $fillable = [
        'libelle',
        'ordre',
        'cycle',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'ordre' => 'integer',
        ];
    }

    /** Retourne les classes de ce niveau. */
    public function classes(): HasMany
    {
        return $this->hasMany(Classe::class);
    }

    /** Retourne les types de frais associés à ce niveau. */
    public function typesFrais(): HasMany
    {
        return $this->hasMany(TypeFrais::class);
    }

    /** Trie les niveaux par ordre croissant. */
    public function scopeOrdonnes(Builder $query): Builder
    {
        return $query->orderBy('ordre');
    }

    /** Retourne le libellé complet du cycle. */
    protected function cycleComplet(): Attribute
    {
        return Attribute::make(
            get: fn (): string => match ($this->cycle) {
                self::CYCLES['CP'] => 'Cours Préparatoire',
                self::CYCLES['CE'] => 'Cours Élémentaire',
                self::CYCLES['CM'] => 'Cours Moyen',
                default => (string) $this->cycle,
            }
        );
    }
}
