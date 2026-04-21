<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InscriptionDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'inscription_id',
        'libelle',
        'fichier_path',
        'description',
    ];

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }
}
