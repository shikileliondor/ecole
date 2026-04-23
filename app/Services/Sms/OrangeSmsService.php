<?php

declare(strict_types=1);

namespace App\Services\Sms;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class OrangeSmsService
{
    public function __construct(private readonly OrangeTokenService $tokenService) {}

    /**
     * @return array{status: string, provider_message_id?: string, payload: array<mixed>, error_code?: string, error_message?: string}
     */
    public function send(string $recipientPhoneNumber, string $senderName, string $message): array
    {
        $token = $this->tokenService->getAccessToken();

        try {
            $response = $this->performSendRequest($token, $recipientPhoneNumber, $senderName, $message);

            return [
                'status' => 'accepted',
                'provider_message_id' => $this->extractResourceId((string) $response->header('Location')),
                'payload' => $response->json() ?? [],
            ];
        } catch (RequestException $exception) {
            if ($exception->response?->status() === 401) {
                $token = $this->tokenService->refreshAccessToken();
                $retryResponse = $this->performSendRequest($token, $recipientPhoneNumber, $senderName, $message);

                return [
                    'status' => 'accepted',
                    'provider_message_id' => $this->extractResourceId((string) $retryResponse->header('Location')),
                    'payload' => $retryResponse->json() ?? [],
                ];
            }

            $payload = $exception->response?->json();
            $errorCode = (string) ($payload['requestError']['serviceException']['messageId'] ?? $payload['code'] ?? 'orange_error');
            $errorMessage = (string) ($payload['requestError']['serviceException']['text'] ?? $payload['description'] ?? $exception->getMessage());

            return [
                'status' => 'failed',
                'payload' => is_array($payload) ? $payload : [],
                'error_code' => $errorCode,
                'error_message' => $errorMessage,
            ];
        }
    }

    private function performSendRequest(string $token, string $recipientPhoneNumber, string $senderName, string $message)
    {
        $senderAddress = (string) config('services.orange_sms.civ_sender_address');
        $encodedSenderAddress = rawurlencode($senderAddress);

        return Http::withToken($token)
            ->acceptJson()
            ->contentType('application/json')
            ->timeout((int) config('services.orange_sms.timeout_seconds', 10))
            ->post(rtrim((string) config('services.orange_sms.messaging_base_url'), '/')."/outbound/{$encodedSenderAddress}/requests", [
                'outboundSMSMessageRequest' => [
                    'address' => 'tel:+'.$recipientPhoneNumber,
                    'senderAddress' => $senderAddress,
                    'senderName' => $senderName,
                    'outboundSMSTextMessage' => [
                        'message' => $message,
                    ],
                ],
            ])
            ->throw();
    }

    private function extractResourceId(string $locationHeader): ?string
    {
        if ($locationHeader === '') {
            return null;
        }

        return basename(parse_url($locationHeader, PHP_URL_PATH) ?: '');
    }
}
