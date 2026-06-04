<?php

namespace App\Providers;

use App\Models\UserPermissionOverride;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function ($user, string $ability): ?bool {
            if (method_exists($user, 'hasRole') && $user->hasRole('super_admin')) {
                return true;
            }

            if (! method_exists($user, 'permissionOverrides')) {
                return null;
            }

            $override = $user->permissionOverrides()
                ->where('permission_name', $ability)
                ->first(['effect']);

            return match ($override?->effect) {
                UserPermissionOverride::EFFECT_DENY => false,
                UserPermissionOverride::EFFECT_ALLOW => true,
                default => null,
            };
        });

        Vite::prefetch(concurrency: 3);
    }
}
