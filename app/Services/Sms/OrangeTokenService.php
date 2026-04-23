<?php

declare(strict_types=1);

namespace App\Services\Sms;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OrangeTokenService
{
    public function getAccessToken(): string
    {
        $cacheKey = 'orange:sms:oauth:token';
        $token = Cache::get($cacheKey);

        if (is_string($token) && $token !== '') {
            return $token;
        }

        return $this->refreshAccessToken();
    }

    public function refreshAccessToken(): string
    {
        $clientId = (string) config('services.orange_sms.client_id');
        $clientSecret = (string) config('services.orange_sms.client_secret');

        if ($clientId === '' || $clientSecret === '') {
            throw new RuntimeException('Les credentials Orange SMS ne sont pas configurés.');
        }

        $response = Http::asForm()
            ->withHeaders(['Accept' => 'application/json'])
            ->withBasicAuth($clientId, $clientSecret)
            ->post((string) config('services.orange_sms.token_url'), [
                'grant_type' => 'client_credentials',
            ])
            ->throw();

        /** @var array{access_token?: string, expires_in?: int|string} $payload */
        $payload = $response->json();
        $accessToken = (string) ($payload['access_token'] ?? '');
        $expiresIn = (int) ($payload['expires_in'] ?? 3600);

        if ($accessToken === '') {
            throw new RuntimeException('Token Orange SMS invalide.');
        }

        $ttl = max(60, $expiresIn - 120);
        Cache::put('orange:sms:oauth:token', $accessToken, now()->addSeconds($ttl));

        return $accessToken;
    }
}
