<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeriodeAcademique extends Model
{
    use HasFactory;

    protected $table = 'periodes_academiques';

    protected $fillable = [
        'annee_scolaire_id',
        'libelle',
        'date_debut',
        'date_fin',
        'ordre',
        'est_active',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'est_active' => 'boolean',
            'ordre' => 'integer',
        ];
    }

    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }
}
