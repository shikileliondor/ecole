<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Eleve extends Model
{
    use HasFactory, SoftDeletes;

    public const SEXES = [
        'M' => 'M',
        'F' => 'F',
    ];

    public const SITUATIONS_FAMILIALES = [
        'parents_ensemble' => 'parents_ensemble',
        'divorces' => 'divorces',
        'orphelin_partiel' => 'orphelin_partiel',
        'orphelin_total' => 'orphelin_total',
    ];

    public const STATUTS = [
        'actif' => 'actif',
        'transfere' => 'transfere',
        'exclu' => 'exclu',
        'sorti' => 'sorti',
    ];

    protected $fillable = [
        'etablissement_id',
        'nom',
        'prenoms',
        'date_naissance',
        'lieu_naissance',
        'pays_naissance',
        'sexe',
        'nationalite',
        'langue_maternelle',
        'situation_familiale',
        'est_boursier',
        'photo',
        'extrait_naissance_numero',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'est_boursier' => 'boolean',
        ];
    }

    /** Génère automatiquement le matricule à la création. */
    protected static function booted(): void
    {
        static::creating(function (self $eleve): void {
            if (! empty($eleve->matricule)) {
                return;
            }

            $annee = now()->year;
            $nextId = (static::withTrashed()->max('id') ?? 0) + 1;
            $eleve->matricule = sprintf('EL-%d-%05d', $annee, $nextId);
        });
    }

    /** Retourne l'établissement de l'élève. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne les inscriptions de l'élève. */
    public function inscriptions(): HasMany
    {
        return $this->hasMany(Inscription::class);
    }

    /** Retourne les parents/tuteurs liés à l'élève. */
    public function parentsTuteurs(): BelongsToMany
    {
        return $this->belongsToMany(ParentTuteur::class, 'eleve_parents', 'eleve_id', 'parent_id')
            ->withPivot(['est_principal', 'peut_recuperer'])
            ->withTimestamps();
    }

    /** Retourne les notes de l'élève via les inscriptions. */
    public function notes(): HasManyThrough
    {
        return $this->hasManyThrough(Note::class, Inscription::class, 'eleve_id', 'inscription_id');
    }

    /** Filtre les élèves actifs. */
    public function scopeActif(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['actif']);
    }

    /** Filtre les élèves par classe via les inscriptions. */
    public function scopeParClasse(Builder $query, int $classeId): Builder
    {
        return $query->whereHas('inscriptions', fn (Builder $q): Builder => $q->where('classe_id', $classeId));
    }

    /** Filtre les élèves par sexe. */
    public function scopeParSexe(Builder $query, string $sexe): Builder
    {
        return $query->where('sexe', $sexe);
    }

    /** Filtre les élèves boursiers. */
    public function scopeBoursiers(Builder $query): Builder
    {
        return $query->where('est_boursier', true);
    }

    /** Retourne le nom complet de l'élève. */
    protected function nomComplet(): Attribute
    {
        return Attribute::make(
            get: fn (): string => trim("{$this->prenoms} {$this->nom}")
        );
    }

    /** Calcule l'âge de l'élève. */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn (): ?int => $this->date_naissance ? Carbon::parse($this->date_naissance)->age : null
        );
    }

    /** Retourne l'inscription active de l'année scolaire en cours. */
    protected function inscriptionActive(): Attribute
    {
        return Attribute::make(
            get: fn (): ?Inscription => $this->inscriptions()
                ->where('annee_scolaire_id', AnneeScolaire::query()->active()->value('id'))
                ->where('statut', Inscription::STATUTS['inscrit'])
                ->first()
        );
    }

    /** Retourne la classe actuelle de l'élève. */
    protected function classeActuelle(): Attribute
    {
        return Attribute::make(
            get: fn (): ?Classe => $this->inscription_active?->classe
        );
    }

    /** Force le nom en majuscules. */
    protected function nom(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value !== null ? mb_strtoupper(trim($value)) : null
        );
    }

    /** Met les prénoms en casse lisible. */
    protected function prenoms(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $value !== null ? mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8') : null
        );
    }
}
