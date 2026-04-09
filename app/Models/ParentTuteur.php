<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ParentTuteur extends Model
{
    use HasFactory;

    public const LIENS = [
        'pere' => 'pere',
        'mere' => 'mere',
        'tuteur' => 'tuteur',
        'grand_parent' => 'grand_parent',
        'oncle_tante' => 'oncle_tante',
    ];

    protected $table = 'parents_tuteurs';

    protected $fillable = [
        'nom',
        'prenoms',
        'lien',
        'profession',
        'telephone_1',
        'telephone_2',
        'whatsapp',
        'email',
        'adresse_quartier',
        'est_contact_urgence',
        'est_payeur',
        'can_portal_access',
        'portal_login',
        'portal_password',
    ];

    protected $hidden = [
        'portal_password',
    ];

    protected function casts(): array
    {
        return [
            'est_contact_urgence' => 'boolean',
            'est_payeur' => 'boolean',
            'can_portal_access' => 'boolean',
        ];
    }

    /** Retourne les élèves liés au parent/tuteur. */
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(Eleve::class, 'eleve_parents', 'parent_id', 'eleve_id')
            ->withPivot(['est_principal', 'peut_recuperer'])
            ->withTimestamps();
    }

    /** Retourne l'utilisateur lié au login portail. */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'parent_id');
    }

    /** Filtre les tuteurs avec accès portail. */
    public function scopeAvecAccesPortail(Builder $query): Builder
    {
        return $query->where('can_portal_access', true);
    }

    /** Filtre les tuteurs payeurs. */
    public function scopePayeurs(Builder $query): Builder
    {
        return $query->where('est_payeur', true);
    }

    /** Retourne le nom complet du parent/tuteur. */
    protected function nomComplet(): Attribute
    {
        return Attribute::make(
            get: fn (): string => trim("{$this->prenoms} {$this->nom}")
        );
    }

    /** Retourne le téléphone principal. */
    protected function telephonePrincipal(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->telephone_1
        );
    }
}
