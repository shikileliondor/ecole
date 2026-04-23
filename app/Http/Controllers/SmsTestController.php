<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Sms\SendSmsRequest;
use App\Models\SmsMessage;
use App\Services\Sms\OrangeSmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class SmsTestController extends Controller
{
    public function __construct(private readonly OrangeSmsService $orangeSmsService) {}

    public function create(): View
    {
        return view('sms.test');
    }

    public function store(SendSmsRequest $request): RedirectResponse
    {
        $normalizedPhone = $this->normalizeIvorianNumber((string) $request->string('to'));
        $senderName = trim((string) $request->string('senderName'));
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
            return back()->withInput()->with('sms_error', [
                'id' => $sms->id,
                'code' => $result['error_code'] ?? 'orange_error',
                'message' => $result['error_message'] ?? "Échec de l'envoi du SMS",
            ]);
        }

        return back()->with('sms_success', [
            'id' => $sms->id,
            'providerMessageId' => $result['provider_message_id'] ?? null,
            'status' => 'accepted',
        ]);
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
