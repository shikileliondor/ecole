<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\ParentTuteur;
use App\Models\SmsMessage;
use App\Services\Sms\OrangeSmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommunicationSmsController extends Controller
{
    public function __construct(private readonly OrangeSmsService $orangeSmsService) {}

    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $classes = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->orderBy('nom')
            ->get(['id', 'nom']);

        $parents = ParentTuteur::query()
            ->whereHas('eleves', fn ($q) => $q->where('etablissement_id', $etablissementId))
            ->with(['eleves' => fn ($q) => $q->select('eleves.id', 'eleves.nom', 'eleves.prenoms')])
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get()
            ->map(function (ParentTuteur $parent): array {
                $principalEleve = $parent->eleves->first();

                return [
                    'id' => $parent->id,
                    'nom_complet' => trim($parent->nom.' '.$parent->prenoms),
                    'telephone' => $parent->telephone_1,
                    'eleves' => $parent->eleves->map(fn ($eleve) => [
                        'id' => $eleve->id,
                        'nom_complet' => trim($eleve->nom.' '.$eleve->prenoms),
                    ])->values(),
                    'eleve_principal' => $principalEleve ? [
                        'id' => $principalEleve->id,
                        'nom_complet' => trim($principalEleve->nom.' '.$principalEleve->prenoms),
                    ] : null,
                ];
            })->values();

        return Inertia::render('Communication/SmsParents', [
            'classes' => $classes,
            'parents' => $parents,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'scope' => ['required', 'in:single,class,all'],
            'parent_id' => ['nullable', 'integer', 'exists:parents_tuteurs,id'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'message' => ['required', 'string', 'min:3', 'max:600'],
            'senderName' => ['nullable', 'string', 'max:11'],
        ]);

        $etablissementId = (int) auth()->user()->etablissement_id;

        $parentsQuery = ParentTuteur::query()
            ->whereHas('eleves', fn ($q) => $q->where('eleves.etablissement_id', $etablissementId));

        if ($data['scope'] === 'single') {
            $parentsQuery->where('id', (int) $data['parent_id']);
        }

        if ($data['scope'] === 'class') {
            $classeId = (int) ($data['classe_id'] ?? 0);
            $parentsQuery->whereHas('eleves.inscriptions', fn ($q) => $q->where('classe_id', $classeId));
        }

        $parents = $parentsQuery->get();

        $sent = 0;
        $failed = 0;

        foreach ($parents as $parent) {
            $normalizedPhone = $this->normalizeIvorianNumber((string) $parent->telephone_1);

            if ($normalizedPhone === '' || strlen($normalizedPhone) !== 13) {
                $failed++;
                continue;
            }

            $result = $this->orangeSmsService->send(
                recipientPhoneNumber: $normalizedPhone,
                senderName: $data['senderName'] ?? null,
                message: $data['message'],
            );

            SmsMessage::query()->create([
                'user_id' => auth()->id(),
                'etablissement_id' => $etablissementId,
                'recipient_phone_number' => $normalizedPhone,
                'sender_name' => $data['senderName'] ?? null,
                'message' => $data['message'],
                'provider' => 'orange',
                'provider_message_id' => $result['provider_message_id'] ?? null,
                'status_local' => $result['status'],
                'error_code' => $result['error_code'] ?? null,
                'error_message' => $result['error_message'] ?? null,
                'orange_response_raw' => $result['payload'],
            ]);

            $result['status'] === 'accepted' ? $sent++ : $failed++;
        }

        return back()->with('success', "Campagne terminée: {$sent} envoyé(s), {$failed} échec(s).");
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
