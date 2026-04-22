<?php

namespace Tests\Feature\Security;

use Illuminate\Support\Facades\Vite;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_security_headers_are_set_on_guest_pages(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
        $response->assertHeader('Content-Security-Policy');
    }

    public function test_csp_allows_all_loopback_vite_origins_when_hot_reload_is_enabled(): void
    {
        config()->set('app.env', 'staging');
        config()->set('app.vite_dev_server_url', 'http://localhost:5173');

        Vite::shouldReceive('isRunningHot')->once()->andReturnTrue();

        $response = $this->get('/login');

        $response->assertOk();
        $csp = (string) $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString('script-src', $csp);
        $this->assertStringContainsString('http://localhost:5173', $csp);
        $this->assertStringContainsString('http://127.0.0.1:5173', $csp);
        $this->assertStringContainsString('http://[::1]:5173', $csp);
        $this->assertStringContainsString('ws://localhost:5173', $csp);
        $this->assertStringContainsString('ws://127.0.0.1:5173', $csp);
        $this->assertStringContainsString('ws://[::1]:5173', $csp);
    }

    public function test_csp_is_not_modified_when_hot_reload_is_disabled(): void
    {
        config()->set('app.env', 'local');
        config()->set('security.headers.content_security_policy', "default-src 'self'; script-src 'self'; connect-src 'self';");

        Vite::shouldReceive('isRunningHot')->once()->andReturnFalse();

        $response = $this->get('/login');

        $response->assertOk();
        $this->assertSame(
            "default-src 'self'; script-src 'self'; connect-src 'self';",
            (string) $response->headers->get('Content-Security-Policy')
        );
    }
}
