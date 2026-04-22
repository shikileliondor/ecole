<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompositionNote extends Model
{
    use HasFactory;

    protected $table = 'composition_notes';

    protected $fillable = [
        'composition_id',
        'classe_id',
        'matiere_id',
        'moyenne',
    ];

    protected function casts(): array
    {
        return [
            'moyenne' => 'decimal:2',
        ];
    }

    public function composition(): BelongsTo
    {
        return $this->belongsTo(Composition::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }
}
