<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', "camera=(), geolocation=(), microphone=()");

        if (! $response->headers->has('Content-Security-Policy')) {
            $response->headers->set('Content-Security-Policy', $this->contentSecurityPolicy());
        }

        if (($request->isSecure() || app()->environment('production')) && ! $response->headers->has('Strict-Transport-Security')) {
            $response->headers->set('Strict-Transport-Security', (string) config('security.headers.strict_transport_security'));
        }

        return $response;
    }

    private function contentSecurityPolicy(): string
    {
        $policy = (string) config('security.headers.content_security_policy');

        if (! app()->environment('local') || ! Vite::isRunningHot()) {
            return $policy;
        }

        $viteUrl = (string) config('app.vite_dev_server_url', env('VITE_DEV_SERVER_URL', 'http://localhost:5173'));
        $origin = $this->originFromUrl($viteUrl);

        if ($origin === null) {
            return $policy;
        }

        $origins = $this->expandLoopbackOrigins($origin);

        $connectOrigins = $origins;
        foreach ($origins as $origin) {
            if (str_starts_with($origin, 'http://')) {
                $connectOrigins[] = 'ws://'.substr($origin, strlen('http://'));
            } elseif (str_starts_with($origin, 'https://')) {
                $connectOrigins[] = 'wss://'.substr($origin, strlen('https://'));
            }
        }

        $policy = $this->appendDirectiveSources($policy, 'script-src', $origins);

        return $this->appendDirectiveSources($policy, 'connect-src', $connectOrigins);
    }

    /**
     * @return list<string>
     */
    private function expandLoopbackOrigins(string $origin): array
    {
        $parts = parse_url($origin);
        $scheme = $parts['scheme'] ?? null;
        $host = $parts['host'] ?? null;
        $port = $parts['port'] ?? null;

        if (! is_string($scheme) || ! is_string($host)) {
            return [$origin];
        }

        $hosts = [$host];

        if ($host === 'localhost' || $host === '127.0.0.1' || $host === '::1') {
            $hosts = ['localhost', '127.0.0.1', '::1'];
        }

        return array_values(array_unique(array_map(function (string $loopbackHost) use ($scheme, $port): string {
            if (str_contains($loopbackHost, ':')) {
                $loopbackHost = '['.$loopbackHost.']';
            }

            return $port ? "{$scheme}://{$loopbackHost}:{$port}" : "{$scheme}://{$loopbackHost}";
        }, $hosts)));
    }

    /**
     * @param  list<string>  $sources
     */
    private function appendDirectiveSources(string $policy, string $directive, array $sources): string
    {
        $segments = array_map('trim', explode(';', $policy));
        $found = false;

        foreach ($segments as $index => $segment) {
            if ($segment === '' || ! str_starts_with($segment, $directive.' ')) {
                continue;
            }

            $found = true;

            foreach ($sources as $source) {
                if (str_contains($segment, $source)) {
                    continue;
                }

                $segment .= ' '.$source;
            }

            $segments[$index] = $segment;
        }

        if (! $found) {
            $segments[] = $directive.' '.implode(' ', $sources);
        }

        return trim(implode('; ', array_filter($segments))).';';
    }

    private function originFromUrl(string $url): ?string
    {
        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host = parse_url($url, PHP_URL_HOST);
        $port = parse_url($url, PHP_URL_PORT);

        if (! is_string($scheme) || ! is_string($host)) {
            return null;
        }

        if (str_contains($host, ':')) {
            $host = '['.$host.']';
        }

        return $port ? "{$scheme}://{$host}:{$port}" : "{$scheme}://{$host}";
    }
}
