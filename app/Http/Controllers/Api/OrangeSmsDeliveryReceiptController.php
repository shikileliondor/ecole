<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrangeSmsDeliveryReceiptController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $expectedSecret = (string) config('services.orange_sms.dr_shared_secret');

        if ($expectedSecret !== '') {
            $receivedSecret = (string) $request->header('X-Orange-DR-Secret');

            if (! hash_equals($expectedSecret, $receivedSecret)) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
        }

        $callbackData = (string) data_get($request->all(), 'deliveryInfoNotification.callbackData', '');
        $deliveryStatus = (string) data_get($request->all(), 'deliveryInfoNotification.deliveryInfo.deliveryStatus', '');

        if ($callbackData === '' || $deliveryStatus === '') {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $sms = SmsMessage::query()->where('provider_message_id', $callbackData)->first();

        if (! $sms) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $sms->delivery_status = $deliveryStatus;

        if ($deliveryStatus === 'DeliveredToTerminal') {
            $sms->delivered_at = now();
        }

        $sms->save();

        return response()->json(['message' => 'OK']);
    }
}
