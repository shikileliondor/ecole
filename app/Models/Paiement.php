<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    public const MODES_PAIEMENT = [
        'especes' => 'especes',
        'orange_money' => 'orange_money',
        'wave' => 'wave',
        'mtn_momo' => 'mtn_momo',
        'moov_money' => 'moov_money',
        'cheque' => 'cheque',
        'virement' => 'virement',
    ];

    public const STATUTS = [
        'paye' => 'paye',
        'partiel' => 'partiel',
        'impaye' => 'impaye',
    ];

    protected $fillable = [
        'inscription_id',
        'type_frais_id',
        'montant_attendu',
        'montant_paye',
        'montant_restant',
        'mode_paiement',
        'reference_transaction',
        'date_paiement',
        'recu_numero',
        'encaisse_par',
        'trimestre',
        'statut',
        'note_caissier',
    ];

    protected function casts(): array
    {
        return [
            'montant_attendu' => 'integer',
            'montant_paye' => 'integer',
            'montant_restant' => 'integer',
            'date_paiement' => 'date',
        ];
    }

    /** Génère le reçu et maintient les montants/statuts cohérents avant sauvegarde. */
    protected static function booted(): void
    {
        static::creating(function (self $paiement): void {
            if (empty($paiement->recu_numero)) {
                $annee = now()->year;
                $nextId = (static::max('id') ?? 0) + 1;
                $paiement->recu_numero = sprintf('REC-%d-%06d', $annee, $nextId);
            }

            $paiement->synchroniserMontantsEtStatut();
        });

        static::updating(function (self $paiement): void {
            $paiement->synchroniserMontantsEtStatut();
        });
    }

    /** Synchronise le montant restant et le statut du paiement. */
    protected function synchroniserMontantsEtStatut(): void
    {
        $attendu = max(0, (int) $this->montant_attendu);
        $paye = max(0, (int) $this->montant_paye);
        $restant = max(0, $attendu - $paye);

        $this->montant_restant = $restant;

        $this->statut = match (true) {
            $paye === 0 => self::STATUTS['impaye'],
            $restant === 0 => self::STATUTS['paye'],
            default => self::STATUTS['partiel'],
        };
    }

    /** Retourne l'inscription concernée par le paiement. */
    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }

    /** Retourne le type de frais payé. */
    public function typeFrais(): BelongsTo
    {
        return $this->belongsTo(TypeFrais::class);
    }

    /** Retourne l'utilisateur ayant encaissé le paiement. */
    public function encaissePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encaisse_par');
    }

    /** Filtre les paiements soldés. */
    public function scopePayes(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['paye']);
    }

    /** Filtre les paiements impayés. */
    public function scopeImpayes(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['impaye']);
    }

    /** Filtre les paiements partiels. */
    public function scopePartiels(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['partiel']);
    }

    /** Filtre les paiements par mode. */
    public function scopeParMode(Builder $query, string $mode): Builder
    {
        return $query->where('mode_paiement', $mode);
    }

    /** Filtre les paiements sur une période donnée. */
    public function scopeParPeriode(Builder $query, string $dateDebut, string $dateFin): Builder
    {
        return $query->whereBetween('date_paiement', [$dateDebut, $dateFin]);
    }

    /** Filtre les paiements du jour. */
    public function scopeDuJour(Builder $query): Builder
    {
        return $query->whereDate('date_paiement', now()->toDateString());
    }

    /** Filtre les paiements d'un mois donné. */
    public function scopeDuMois(Builder $query, int $mois, int $annee): Builder
    {
        return $query->whereMonth('date_paiement', $mois)->whereYear('date_paiement', $annee);
    }

    /** Retourne le montant payé formaté en FCFA. */
    protected function montantPayeFormatte(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format((int) $this->montant_paye, 0, ',', ' ') . ' FCFA'
        );
    }

    /** Retourne le montant restant formaté en FCFA. */
    protected function montantRestantFormatte(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format((int) $this->montant_restant, 0, ',', ' ') . ' FCFA'
        );
    }

    /** Indique si le paiement est totalement soldé. */
    protected function estSolde(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => (int) $this->montant_restant === 0
        );
    }

    /** Retourne le libellé lisible du mode de paiement. */
    protected function modeLibelle(): Attribute
    {
        return Attribute::make(
            get: fn (): string => str($this->mode_paiement)->replace('_', ' ')->title()->value()
        );
    }
}
