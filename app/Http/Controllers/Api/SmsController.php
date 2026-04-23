<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sms\SendSmsRequest;
use App\Models\SmsMessage;
use App\Services\Sms\OrangeSmsService;
use Illuminate\Http\JsonResponse;

class SmsController extends Controller
{
    public function __construct(private readonly OrangeSmsService $orangeSmsService) {}

    public function send(SendSmsRequest $request): JsonResponse
    {
        $normalizedPhone = $this->normalizeIvorianNumber((string) $request->string('to'));
        $senderNameInput = $request->input('senderName');
        $senderName = is_string($senderNameInput) && trim($senderNameInput) !== '' ? trim($senderNameInput) : null;
        $message = trim((string) $request->string('message'));

        $result = $this->orangeSmsService->send(
            recipientPhoneNumber: $normalizedPhone,
            senderName: $senderName,
            message: $message,
        );

        $sms = SmsMessage::query()->create([
            'user_id' => auth()->id(),
            'etablissement_id' => auth()->user()?->etablissement_id,
            'recipient_phone_number' => $normalizedPhone,
            'sender_name' => $senderName,
            'message' => $message,
            'provider' => 'orange',
            'provider_message_id' => $result['provider_message_id'] ?? null,
            'status_local' => $result['status'],
            'error_code' => $result['error_code'] ?? null,
            'error_message' => $result['error_message'] ?? null,
            'orange_response_raw' => $result['payload'],
        ]);

        if ($result['status'] === 'failed') {
            return response()->json([
                'id' => $sms->id,
                'provider' => 'orange',
                'status' => 'failed',
                'error' => [
                    'code' => $result['error_code'] ?? 'orange_error',
                    'message' => $result['error_message'] ?? "Échec de l'envoi du SMS",
                ],
            ], 422);
        }

        return response()->json([
            'id' => $sms->id,
            'provider' => 'orange',
            'providerMessageId' => $result['provider_message_id'] ?? null,
            'status' => 'accepted',
        ], 201);
    }

    private function normalizeIvorianNumber(string $number): string
    {
        $digits = preg_replace('/\D+/', '', $number) ?? '';

        if (str_starts_with($digits, '225') && strlen($digits) === 13) {
            return $digits;
        }

        if (strlen($digits) === 10) {
            return '225'.$digits;
        }

        return $digits;
    }
}
