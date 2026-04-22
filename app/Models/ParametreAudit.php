<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParametreAudit extends Model
{
    use HasFactory;

    protected $table = 'parametre_audits';

    protected $fillable = [
        'etablissement_id',
        'user_id',
        'onglet',
        'action',
        'cible_type',
        'cible_id',
        'avant',
        'apres',
        'justification',
        'ip',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'avant' => 'array',
            'apres' => 'array',
        ];
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
