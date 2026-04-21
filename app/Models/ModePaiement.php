<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModePaiement extends Model
{
    use HasFactory;

    protected $table = 'modes_paiement';

    protected $fillable = [
        'etablissement_id',
        'libelle',
        'code',
        'est_actif',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'est_actif' => 'boolean',
            'ordre' => 'integer',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
