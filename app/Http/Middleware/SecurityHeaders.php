<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set(
            'Content-Security-Policy',
            app()->environment('local') ? $this->localContentSecurityPolicy() : $this->productionContentSecurityPolicy(),
        );

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        if (app()->environment('production') && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }

    private function localContentSecurityPolicy(): string
    {
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:8000 http://127.0.0.1:8000 http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173",
            "script-src-elem 'self' 'unsafe-inline' http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173",
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173 ws://localhost:5173 ws://127.0.0.1:5173 ws://[::1]:5173 wss://localhost:5173 wss://127.0.0.1:5173",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }

    private function productionContentSecurityPolicy(): string
    {
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self'",
            "script-src-elem 'self'",
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self'",
            "img-src 'self' data:",
            "font-src 'self' data:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }
}
