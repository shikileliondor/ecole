<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Matiere extends Model
{
    use HasFactory;

    public const CODES = [
        'LEC' => 'LEC',
        'ECR' => 'ECR',
        'MATH' => 'MATH',
        'SCI' => 'SCI',
        'EPS' => 'EPS',
        'DTM' => 'DTM',
        'LV1' => 'LV1',
    ];

    public const TYPES_EVALUATION = [
        'note' => 'note',
        'appreciation' => 'appreciation',
    ];

    protected $fillable = [
        'libelle',
        'code',
        'coefficient',
        'est_notee',
        'type_evaluation',
        'ordre_bulletin',
    ];

    protected function casts(): array
    {
        return [
            'coefficient' => 'integer',
            'est_notee' => 'boolean',
            'ordre_bulletin' => 'integer',
        ];
    }

    /** Retourne les notes de la matière. */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /** Filtre les matières notées. */
    public function scopeNotees(Builder $query): Builder
    {
        return $query->where('est_notee', true);
    }

    /** Trie les matières selon l'ordre du bulletin. */
    public function scopeOrdonnesBulletin(Builder $query): Builder
    {
        return $query->orderBy('ordre_bulletin');
    }
}
