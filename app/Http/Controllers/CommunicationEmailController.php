<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Eleve;
use App\Models\EmailMessage;
use App\Models\ParentTuteur;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CommunicationEmailController extends Controller
{
    public function index(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        $classes = Classe::query()
            ->where('etablissement_id', $etablissementId)
            ->orderBy('nom')
            ->get(['id', 'nom']);

        $eleves = Eleve::query()
            ->where('etablissement_id', $etablissementId)
            ->with(['parentsTuteurs' => fn ($q) => $q->select('parents_tuteurs.id', 'parents_tuteurs.nom', 'parents_tuteurs.prenoms', 'parents_tuteurs.email')])
            ->orderBy('nom')
            ->orderBy('prenoms')
            ->get(['id', 'nom', 'prenoms'])
            ->map(fn (Eleve $eleve) => [
                'id' => $eleve->id,
                'nom_complet' => trim($eleve->nom.' '.$eleve->prenoms),
                'parents' => $eleve->parentsTuteurs->map(fn (ParentTuteur $parent) => [
                    'id' => $parent->id,
                    'nom_complet' => trim($parent->nom.' '.$parent->prenoms),
                    'email' => $parent->email,
                ])->values(),
            ])->values();

        return Inertia::render('Communication/EmailParents', [
            'classes' => $classes,
            'eleves' => $eleves,
            'variables' => ['{{nom_parent}}', '{{nom_eleve}}', '{{classe}}', '{{ecole}}'],
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'scope' => ['required', 'in:single,class,all'],
            'eleve_id' => ['nullable', 'integer', 'exists:eleves,id'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'subject' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'min:3', 'max:10000'],
        ]);

        $etablissementId = (int) auth()->user()->etablissement_id;
        $ecole = auth()->user()->etablissement_nom ?? 'École';

        $query = Eleve::query()->where('etablissement_id', $etablissementId)->with(['parentsTuteurs', 'inscriptions.classe']);
        if ($data['scope'] === 'single') {
            $query->where('id', (int) $data['eleve_id']);
        }
        if ($data['scope'] === 'class') {
            $query->whereHas('inscriptions', fn ($q) => $q->where('classe_id', (int) $data['classe_id']));
        }

        $eleves = $query->get();

        $sent = 0;
        $failed = 0;

        foreach ($eleves as $eleve) {
            $classeNom = optional($eleve->inscriptions->last()?->classe)->nom ?? '';
            foreach ($eleve->parentsTuteurs as $parent) {
                $email = trim((string) $parent->email);
                if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $failed++;
                    continue;
                }

                $subject = $this->replaceVariables($data['subject'], $parent->nom_complet, trim($eleve->nom.' '.$eleve->prenoms), $classeNom, $ecole);
                $body = $this->replaceVariables($data['message'], $parent->nom_complet, trim($eleve->nom.' '.$eleve->prenoms), $classeNom, $ecole);

                try {
                    Mail::raw($body, function ($mail) use ($email, $subject) {
                        $mail->to($email)->subject($subject);
                    });
                    $status = 'sent';
                    $error = null;
                    $sent++;
                } catch (\Throwable $exception) {
                    $status = 'failed';
                    $error = $exception->getMessage();
                    $failed++;
                }

                EmailMessage::query()->create([
                    'user_id' => auth()->id(),
                    'etablissement_id' => $etablissementId,
                    'parent_tuteur_id' => $parent->id,
                    'eleve_id' => $eleve->id,
                    'recipient_email' => $email,
                    'subject' => $subject,
                    'message' => $body,
                    'status_local' => $status,
                    'error_message' => $error,
                ]);
            }
        }

        return back()->with('success', "Campagne email terminée: {$sent} envoyé(s), {$failed} échec(s).");
    }

    private function replaceVariables(string $content, string $nomParent, string $nomEleve, string $classe, string $ecole): string
    {
        return str_replace(
            ['{{nom_parent}}', '{{nom_eleve}}', '{{classe}}', '{{ecole}}'],
            [$nomParent, $nomEleve, $classe, $ecole],
            $content
        );
    }
}
