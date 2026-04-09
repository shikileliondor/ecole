<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Salaire extends Model
{
    use HasFactory;

    public const STATUTS = [
        'paye' => 'paye',
        'en_attente' => 'en_attente',
    ];

    public const MODES_PAIEMENT = [
        'especes' => 'especes',
        'virement' => 'virement',
        'orange_money' => 'orange_money',
        'wave' => 'wave',
        'mtn_momo' => 'mtn_momo',
    ];

    public const MOIS_LIBELLES = [
        '01' => 'Janvier',
        '02' => 'Février',
        '03' => 'Mars',
        '04' => 'Avril',
        '05' => 'Mai',
        '06' => 'Juin',
        '07' => 'Juillet',
        '08' => 'Août',
        '09' => 'Septembre',
        '10' => 'Octobre',
        '11' => 'Novembre',
        '12' => 'Décembre',
    ];

    protected $fillable = [
        'personnel_id',
        'annee_scolaire_id',
        'mois',
        'salaire_base',
        'primes',
        'deductions',
        'net_a_payer',
        'mode_paiement',
        'date_paiement',
        'statut',
        'valide_par',
    ];

    protected function casts(): array
    {
        return [
            'salaire_base' => 'integer',
            'primes' => 'integer',
            'deductions' => 'integer',
            'net_a_payer' => 'integer',
            'date_paiement' => 'date',
        ];
    }

    /** Calcule automatiquement le net à payer avant sauvegarde. */
    protected static function booted(): void
    {
        static::saving(function (self $salaire): void {
            $salaire->net_a_payer = max(0, ((int) $salaire->salaire_base + (int) $salaire->primes) - (int) $salaire->deductions);
        });
    }

    /** Retourne le personnel concerné par le salaire. */
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    /** Retourne l'année scolaire du salaire. */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    /** Retourne l'utilisateur qui a validé le salaire. */
    public function validePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    /** Filtre les salaires payés. */
    public function scopePayes(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['paye']);
    }

    /** Filtre les salaires en attente. */
    public function scopeEnAttente(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['en_attente']);
    }

    /** Filtre les salaires d'un mois pour une année scolaire. */
    public function scopeDuMois(Builder $query, int $mois, int $anneeScolaireId): Builder
    {
        return $query->where('mois', $mois)->where('annee_scolaire_id', $anneeScolaireId);
    }

    /** Retourne le libellé français du mois. */
    protected function moisLibelle(): Attribute
    {
        return Attribute::make(
            get: fn (): string => self::MOIS_LIBELLES[str_pad((string) $this->mois, 2, '0', STR_PAD_LEFT)] ?? (string) $this->mois
        );
    }

    /** Retourne le net à payer formaté en FCFA. */
    protected function netFormatte(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format((int) $this->net_a_payer, 0, ',', ' ') . ' FCFA'
        );
    }
}
