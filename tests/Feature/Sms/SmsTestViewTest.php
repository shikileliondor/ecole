<?php

declare(strict_types=1);

namespace Tests\Feature\Sms;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SmsTestViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_sms_test_page_is_accessible_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('sms.test'));

        $response
            ->assertOk()
            ->assertSee('Test SMS Orange')
            ->assertSee('Numéro destinataire');
    }

    public function test_sms_test_page_displays_provider_error(): void
    {
        config()->set('services.orange_sms.client_id', 'client-id');
        config()->set('services.orange_sms.client_secret', 'client-secret');

        Http::fake([
            'https://api.orange.com/oauth/v3/token' => Http::response([
                'access_token' => 'token-123',
                'expires_in' => 3600,
            ]),
            'https://api.orange.com/smsmessaging/v1/outbound/*/requests' => Http::response([
                'requestError' => [
                    'serviceException' => [
                        'messageId' => 'SVC0001',
                        'text' => 'Sender name non autorisé',
                    ],
                ],
            ], 400),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->followingRedirects()->post(route('sms.test.store'), [
            'to' => '0799245071',
            'senderName' => 'MonService',
            'message' => 'Bonjour',
        ]);

        $response
            ->assertOk()
            ->assertSee('Échec envoi')
            ->assertSee('Sender name non autorisé');
    }
}
