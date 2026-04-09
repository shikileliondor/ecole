<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Personnel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'personnel';

    public const SEXES = [
        'M' => 'M',
        'F' => 'F',
    ];

    public const TYPES = [
        'enseignant' => 'enseignant',
        'directeur' => 'directeur',
        'caissier' => 'caissier',
        'secretaire' => 'secretaire',
        'agent_entretien' => 'agent_entretien',
        'surveillant' => 'surveillant',
    ];

    public const DIPLOMES = [
        'BEPC' => 'BEPC',
        'BAC' => 'BAC',
        'BTS' => 'BTS',
        'Licence' => 'Licence',
        'Master' => 'Master',
    ];

    public const TYPES_CONTRAT = [
        'CDI' => 'CDI',
        'CDD' => 'CDD',
        'vacataire' => 'vacataire',
    ];

    public const STATUTS = [
        'actif' => 'actif',
        'suspendu' => 'suspendu',
        'parti' => 'parti',
    ];

    protected $fillable = [
        'etablissement_id',
        'user_id',
        'matricule_interne',
        'nom',
        'prenoms',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'nationalite',
        'telephone',
        'whatsapp',
        'email',
        'photo',
        'type',
        'diplome',
        'est_certifie_mena',
        'numero_badge_mena',
        'date_embauche',
        'type_contrat',
        'salaire_base',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'date_embauche' => 'date',
            'est_certifie_mena' => 'boolean',
            'salaire_base' => 'integer',
        ];
    }

    /** Retourne l'établissement du membre du personnel. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne l'utilisateur lié au personnel. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Retourne les salaires du personnel. */
    public function salaires(): HasMany
    {
        return $this->hasMany(Salaire::class);
    }

    /** Retourne les classes dont ce personnel est titulaire. */
    public function classesTitulaire(): HasMany
    {
        return $this->hasMany(Classe::class, 'enseignant_titulaire_id');
    }

    /** Filtre le personnel actif. */
    public function scopeActif(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['actif']);
    }

    /** Filtre les enseignants. */
    public function scopeEnseignants(Builder $query): Builder
    {
        return $query->where('type', self::TYPES['enseignant']);
    }

    /** Filtre le personnel certifié MENA. */
    public function scopeCertifiesMena(Builder $query): Builder
    {
        return $query->where('est_certifie_mena', true);
    }

    /** Retourne le nom complet du personnel. */
    protected function nomComplet(): Attribute
    {
        return Attribute::make(
            get: fn (): string => trim("{$this->prenoms} {$this->nom}")
        );
    }

    /** Calcule l'ancienneté en années complètes. */
    protected function anciennete(): Attribute
    {
        return Attribute::make(
            get: fn (): int => $this->date_embauche ? Carbon::parse($this->date_embauche)->diffInYears(now()) : 0
        );
    }

    /** Retourne le salaire de base formaté en FCFA. */
    protected function salaireFormatte(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format((int) $this->salaire_base, 0, ',', ' ') . ' FCFA'
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
