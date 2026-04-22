<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParametreConfig extends Model
{
    use HasFactory;

    protected $table = 'parametre_configs';

    protected $fillable = [
        'etablissement_id',
        'onglet',
        'donnees',
    ];

    protected function casts(): array
    {
        return [
            'donnees' => 'array',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
