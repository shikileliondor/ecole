<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModeleImpression extends Model
{
    use HasFactory;

    protected $table = 'modeles_impression';

    protected $fillable = [
        'etablissement_id',
        'type_document',
        'nom',
        'description',
        'template_html',
        'est_defaut',
        'est_actif',
    ];

    protected function casts(): array
    {
        return [
            'est_defaut' => 'boolean',
            'est_actif' => 'boolean',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }
}
