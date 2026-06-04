<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Event;
use Spatie\Permission\Contracts\Permission as PermissionContract;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    use HasRoles {
        getAllPermissions as protected spatieGetAllPermissions;
        hasPermissionTo as protected spatieHasPermissionTo;
    }

    public const TYPES = [
        'staff' => 'staff',
        'parent' => 'parent',
    ];

    public const STATUTS = [
        'actif' => 'actif',
        'bloque' => 'bloque',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'etablissement_id',
        'personnel_id',
        'parent_id',
        'type',
        'statut',
        'dernier_connexion',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dernier_connexion' => 'datetime',
            'statut' => 'string',
        ];
    }

    /** Met à jour la dernière connexion après authentification. */
    protected static function booted(): void
    {
        Event::listen(Authenticated::class, function (Authenticated $event): void {
            if (! $event->user instanceof self) {
                return;
            }

            $event->user->forceFill(['dernier_connexion' => now()])->saveQuietly();
        });
    }

    /** Retourne l'établissement de l'utilisateur. */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    /** Retourne la fiche personnel liée à l'utilisateur. */
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class);
    }

    /** Retourne le parent/tuteur lié à l'utilisateur. */
    public function parentTuteur(): BelongsTo
    {
        return $this->belongsTo(ParentTuteur::class, 'parent_id');
    }

    /** Retourne les exceptions allow/deny configurées directement sur l'utilisateur. */
    public function permissionOverrides(): HasMany
    {
        return $this->hasMany(UserPermissionOverride::class);
    }

    /** Vérifie une permission Spatie en appliquant d'abord les refus utilisateurs explicites. */
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        $permissionName = $permission instanceof PermissionContract ? $permission->name : (string) $permission;

        if ($this->hasRole('super_admin')) {
            return true;
        }

        $overrides = $this->relationLoaded('permissionOverrides')
            ? $this->permissionOverrides
            : $this->permissionOverrides()->get(['permission_name', 'effect']);

        $override = $overrides->firstWhere('permission_name', $permissionName);

        if ($override?->effect === UserPermissionOverride::EFFECT_DENY) {
            return false;
        }

        if ($override?->effect === UserPermissionOverride::EFFECT_ALLOW) {
            return true;
        }

        return $this->spatieHasPermissionTo($permission, $guardName);
    }

    /** Retourne les permissions finales: rôle + allows utilisateur - denies utilisateur. */
    public function getAllPermissions(): Collection
    {
        if ($this->hasRole('super_admin')) {
            return Permission::query()->get();
        }

        $permissions = $this->spatieGetAllPermissions()->keyBy('name');
        $overrides = $this->relationLoaded('permissionOverrides')
            ? $this->permissionOverrides
            : $this->permissionOverrides()->get(['permission_name', 'effect']);

        foreach ($overrides as $override) {
            if ($override->effect === UserPermissionOverride::EFFECT_DENY) {
                $permissions->forget($override->permission_name);
                continue;
            }

            if ($override->effect === UserPermissionOverride::EFFECT_ALLOW) {
                $permissionModel = Permission::query()->where('name', $override->permission_name)->first();
                if ($permissionModel) {
                    $permissions->put($permissionModel->name, $permissionModel);
                }
            }
        }

        return $permissions->values();
    }

    /** Filtre les utilisateurs actifs. */
    public function scopeActifs(Builder $query): Builder
    {
        return $query->where('statut', self::STATUTS['actif']);
    }

    /** Filtre les utilisateurs staff. */
    public function scopeStaff(Builder $query): Builder
    {
        return $query->where('type', self::TYPES['staff']);
    }

    /** Filtre les utilisateurs parent. */
    public function scopeParents(Builder $query): Builder
    {
        return $query->where('type', self::TYPES['parent']);
    }

    /** Filtre les utilisateurs par établissement. */
    public function scopeParEtablissement(Builder $query, int $etablissementId): Builder
    {
        return $query->where('etablissement_id', $etablissementId);
    }

    /** Indique si l'utilisateur est bloqué. */
    protected function estBloque(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->statut === self::STATUTS['bloque']
        );
    }

    /** Indique si l'utilisateur est un parent. */
    protected function estParent(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->type === self::TYPES['parent']
        );
    }

    /** Indique si l'utilisateur est un staff. */
    protected function estStaff(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->type === self::TYPES['staff']
        );
    }
}
