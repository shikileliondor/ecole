<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('sms', function (Request $request): array {
            $userId = (string) ($request->user()?->id ?? $request->ip());
            $etablissementId = (string) ($request->user()?->etablissement_id ?? 'guest');

            return [
                Limit::perMinute(10)->by('sms-user-'.$userId),
                Limit::perDay(200)->by('sms-etab-'.$etablissementId),
            ];
        });
    }
}
