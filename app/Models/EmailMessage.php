<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'etablissement_id',
        'parent_tuteur_id',
        'eleve_id',
        'recipient_email',
        'subject',
        'message',
        'status_local',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'etablissement_id' => 'integer',
            'parent_tuteur_id' => 'integer',
            'eleve_id' => 'integer',
        ];
    }
}
