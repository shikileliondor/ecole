<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Note extends Model
{
    use HasFactory;

    public const TRIMESTRES = [
        '1' => 1,
        '2' => 2,
        '3' => 3,
    ];

    public const TYPES_NOTES = [
        'composition' => 'composition',
        'interrogation' => 'interrogation',
        'devoir' => 'devoir',
    ];

    public const APPRECIATIONS = [
        'TB' => 'TB',
        'B' => 'B',
        'AB' => 'AB',
        'Passable' => 'Passable',
        'Insuffisant' => 'Insuffisant',
    ];

    protected $fillable = [
        'inscription_id',
        'matiere_id',
        'annee_scolaire_id',
        'trimestre',
        'type_note',
        'note',
        'appreciation',
        'rang_classe',
        'saisi_par',
        'date_saisie',
        'est_validee',
    ];

    protected function casts(): array
    {
        return [
            'note' => 'decimal:2',
            'est_validee' => 'boolean',
            'date_saisie' => 'datetime',
        ];
    }

    /** Retourne l'inscription liée à la note. */
    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }

    /** Retourne la matière liée à la note. */
    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    /** Retourne l'année scolaire de la note. */
    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneeScolaire::class);
    }

    /** Retourne l'utilisateur qui a saisi la note. */
    public function saisiePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saisi_par');
    }

    /** Filtre les notes par trimestre. */
    public function scopeParTrimestre(Builder $query, int $trimestre): Builder
    {
        return $query->where('trimestre', $trimestre);
    }

    /** Filtre les notes validées. */
    public function scopeValidees(Builder $query): Builder
    {
        return $query->where('est_validee', true);
    }

    /** Filtre les notes non validées. */
    public function scopeNonValidees(Builder $query): Builder
    {
        return $query->where('est_validee', false);
    }

    /** Filtre les notes par matière. */
    public function scopeParMatiere(Builder $query, int $matiereId): Builder
    {
        return $query->where('matiere_id', $matiereId);
    }

    /** Retourne la mention calculée selon la note. */
    protected function mention(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if ($this->note === null) {
                    return $this->appreciation;
                }

                return match (true) {
                    $this->note >= 16 => self::APPRECIATIONS['TB'],
                    $this->note >= 14 => self::APPRECIATIONS['B'],
                    $this->note >= 12 => self::APPRECIATIONS['AB'],
                    $this->note >= 10 => self::APPRECIATIONS['Passable'],
                    default => self::APPRECIATIONS['Insuffisant'],
                };
            }
        );
    }

    /** Indique si la note est suffisante. */
    protected function estSuffisante(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => (float) $this->note >= 10
        );
    }

    /** Retourne la note formatée selon le barème courant. */
    protected function noteFormattee(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->note !== null ? number_format((float) $this->note, 2, ',', ' ') . '/20' : null
        );
    }

    /** Calcule la moyenne des notes d'une classe pour une matière et un trimestre. */
    public static function calculerMoyenneClasse(int $classeId, int $matiereId, int $trimestre): float
    {
        return round((float) static::query()
            ->where('matiere_id', $matiereId)
            ->where('trimestre', $trimestre)
            ->whereHas('inscription', fn (Builder $query): Builder => $query->where('classe_id', $classeId))
            ->avg('note'), 2);
    }

    /** Calcule et met à jour les rangs de la classe pour un trimestre. */
    public static function calculerRangs(int $classeId, int $trimestre): void
    {
        /** @var Collection<int, object{inscription_id:int,moyenne:float}> $moyennes */
        $moyennes = static::query()
            ->selectRaw('inscription_id, AVG(note) as moyenne')
            ->where('trimestre', $trimestre)
            ->whereHas('inscription', fn (Builder $query): Builder => $query->where('classe_id', $classeId))
            ->groupBy('inscription_id')
            ->orderByDesc('moyenne')
            ->get();

        $rang = 0;
        $position = 0;
        $precedenteMoyenne = null;

        foreach ($moyennes as $moyenne) {
            $position++;

            if ($precedenteMoyenne === null || (float) $moyenne->moyenne < (float) $precedenteMoyenne) {
                $rang = $position;
            }

            static::query()
                ->where('inscription_id', $moyenne->inscription_id)
                ->where('trimestre', $trimestre)
                ->update(['rang_classe' => $rang]);

            $precedenteMoyenne = (float) $moyenne->moyenne;
        }
    }
}
