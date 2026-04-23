<?php

declare(strict_types=1);

namespace Tests\Feature\Sms;

use App\Models\SmsMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrangeDeliveryReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_delivery_receipt_updates_sms_status_to_delivered(): void
    {
        config()->set('services.orange_sms.dr_shared_secret', 'secret-123');

        $sms = SmsMessage::query()->create([
            'recipient_phone_number' => '2250799245071',
            'sender_name' => null,
            'message' => 'Bonjour',
            'provider' => 'orange',
            'provider_message_id' => '2ee52c7d-99f1-46c1-9e7a-da49ec1b9e57',
            'status_local' => 'accepted',
            'delivery_status' => 'PENDING_DR',
        ]);

        $response = $this->postJson(route('api.sms.dr'), [
            'deliveryInfoNotification' => [
                'callbackData' => '2ee52c7d-99f1-46c1-9e7a-da49ec1b9e57',
                'deliveryInfo' => [
                    'address' => 'tel:+2250799245071',
                    'deliveryStatus' => 'DeliveredToTerminal',
                ],
            ],
        ], [
            'X-Orange-DR-Secret' => 'secret-123',
        ]);

        $response->assertOk();

        $sms->refresh();
        $this->assertSame('DeliveredToTerminal', $sms->delivery_status);
        $this->assertNotNull($sms->delivered_at);
    }
}
