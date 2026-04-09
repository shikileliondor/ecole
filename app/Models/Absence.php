<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    use HasFactory;

    public const TYPES = [
        'matin' => 'matin',
        'apres_midi' => 'apres_midi',
        'journee' => 'journee',
    ];

    public const MOTIFS = [
        'maladie' => 'maladie',
        'sans_motif' => 'sans_motif',
        'deces_famille' => 'deces_famille',
        'autre' => 'autre',
    ];

    protected $fillable = [
        'inscription_id',
        'date_absence',
        'type',
        'motif',
        'est_justifiee',
        'justificatif',
        'signale_par',
        'parent_notifie',
    ];

    protected function casts(): array
    {
        return [
            'date_absence' => 'date',
            'est_justifiee' => 'boolean',
            'parent_notifie' => 'boolean',
        ];
    }

    /** Retourne l'inscription liée à l'absence. */
    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }

    /** Retourne l'utilisateur ayant signalé l'absence. */
    public function signalePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signale_par');
    }

    /** Filtre les absences justifiées. */
    public function scopeJustifiees(Builder $query): Builder
    {
        return $query->where('est_justifiee', true);
    }

    /** Filtre les absences non justifiées. */
    public function scopeNonJustifiees(Builder $query): Builder
    {
        return $query->where('est_justifiee', false);
    }

    /** Filtre les absences sur une période. */
    public function scopeParPeriode(Builder $query, string $dateDebut, string $dateFin): Builder
    {
        return $query->whereBetween('date_absence', [$dateDebut, $dateFin]);
    }

    /** Filtre les absences d'un mois donné. */
    public function scopeDuMois(Builder $query, int $mois): Builder
    {
        return $query->whereMonth('date_absence', $mois);
    }

    /** Retourne le libellé lisible du type d'absence. */
    protected function typeLibelle(): Attribute
    {
        return Attribute::make(
            get: fn (): string => match ($this->type) {
                self::TYPES['matin'] => 'Matin',
                self::TYPES['apres_midi'] => 'Après-midi',
                self::TYPES['journee'] => 'Journée',
                default => (string) $this->type,
            }
        );
    }

    /** Retourne le libellé lisible du motif d'absence. */
    protected function motifLibelle(): Attribute
    {
        return Attribute::make(
            get: fn (): string => str((string) $this->motif)->replace('_', ' ')->title()->value()
        );
    }
}
