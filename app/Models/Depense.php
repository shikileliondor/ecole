<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Depense extends Model
{
    use HasFactory;

    public const STATUTS = ['active' => 'active', 'annulee' => 'annulee'];

    protected $fillable = [
        'etablissement_id','libelle','categorie','montant','date_depense','responsable_id','mode_paiement','justificatif_path','observation','statut','motif_annulation','created_by',
    ];

    protected function casts(): array
    {
        return ['montant' => 'integer', 'date_depense' => 'date'];
    }

    public function responsable(): BelongsTo { return $this->belongsTo(Personnel::class, 'responsable_id'); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function etablissement(): BelongsTo { return $this->belongsTo(Etablissement::class); }
}
