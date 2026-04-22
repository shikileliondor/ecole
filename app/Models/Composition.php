<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Composition extends Model
{
    use HasFactory;

    protected $fillable = [
        'etablissement_id',
        'periode_academique_id',
        'libelle',
        'type',
        'bareme',
        'seuil_validation',
        'regle_moyenne',
        'mode_arrondi',
        'appreciations_auto',
        'est_publie',
    ];

    protected function casts(): array
    {
        return [
            'bareme' => 'integer',
            'seuil_validation' => 'decimal:2',
            'est_publie' => 'boolean',
        ];
    }

    public function periodeAcademique(): BelongsTo
    {
        return $this->belongsTo(PeriodeAcademique::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CompositionNote::class);
    }
}
