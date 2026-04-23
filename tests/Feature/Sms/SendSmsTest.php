<?php

declare(strict_types=1);

namespace Tests\Feature\Sms;

use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SendSmsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_send_sms_with_orange_service(): void
    {
        config()->set('services.orange_sms.client_id', 'client-id');
        config()->set('services.orange_sms.client_secret', 'client-secret');

        Http::fake([
            'https://api.orange.com/oauth/v3/token' => Http::response([
                'access_token' => 'token-123',
                'expires_in' => 3600,
            ]),
            'https://api.orange.com/smsmessaging/v1/outbound/*/requests' => Http::response([
                'outboundSMSMessageRequest' => [
                    'resourceURL' => 'https://api.orange.com/smsmessaging/v1/outbound/tel:+2250000/requests/abc-123',
                ],
            ], 201, ['Location' => 'https://api.orange.com/smsmessaging/v1/outbound/tel:+2250000/requests/abc-123']),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('api.sms.send'), [
            'to' => '+2250701020304',
            'senderName' => 'MonService',
            'message' => 'Bonjour',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('status', 'accepted')
            ->assertJsonPath('provider', 'orange')
            ->assertJsonPath('providerMessageId', 'abc-123');

        $this->assertDatabaseHas('sms_messages', [
            'recipient_phone_number' => '0701020304',
            'sender_name' => 'MonService',
            'status_local' => 'accepted',
        ]);
    }

    public function test_failed_send_is_persisted_with_failed_status(): void
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

        $response = $this->actingAs($user)->postJson(route('api.sms.send'), [
            'to' => '0701020304',
            'senderName' => 'MonService',
            'message' => 'Bonjour',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('status', 'failed')
            ->assertJsonPath('error.code', 'SVC0001');

        $this->assertDatabaseHas('sms_messages', [
            'recipient_phone_number' => '0701020304',
            'status_local' => 'failed',
            'error_code' => 'SVC0001',
        ]);

        $this->assertSame(1, SmsMessage::query()->count());
    }
}
