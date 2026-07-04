<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Inscription;
use App\Notifications\AppNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AbsenceController extends Controller
{
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $filters = $request->only(['classe_id', 'date_debut', 'date_fin', 'est_justifiee']);

        $query = $this->buildQuery($request, $etablissementId);
        $statsQuery = clone $query;

        return Inertia::render('Absences/Index', [
            'absences' => $query->orderByDesc('date_absence')->paginate(30)->withQueryString(),
            'classes'  => Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(),
            'filters'  => $filters,
            'stats'    => [
                'total'          => $statsQuery->count(),
                'justifiees'     => (clone $statsQuery)->where('est_justifiee', true)->count(),
                'non_justifiees' => (clone $statsQuery)->where('est_justifiee', false)->count(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $classeId = $request->integer('classe_id') ?: null;

        return Inertia::render('Absences/Create', [
            'classes'           => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'inscriptions'      => $classeId
                ? Inscription::query()
                    ->where('inscriptions.classe_id', $classeId)
                    ->where('inscriptions.statut', Inscription::STATUTS['inscrit'])
                    ->with('eleve')
                    ->join('eleves', 'eleves.id', '=', 'inscriptions.eleve_id')
                    ->orderBy('eleves.nom')
                    ->select('inscriptions.*')
                    ->get()
                : [],
            'selected_classe_id' => $classeId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'inscription_id' => ['required', 'exists:inscriptions,id'],
            'date_absence'   => ['required', 'date', 'before_or_equal:today'],
            'type'           => ['required', 'in:matin,apres_midi,journee'],
            'motif'          => ['required', 'in:maladie,sans_motif,deces_famille,autre'],
            'est_justifiee'  => ['boolean'],
            'parent_notifie' => ['boolean'],
            'justificatif'   => ['nullable', 'string', 'max:255'],
        ], [
            'inscription_id.required'      => 'Veuillez sélectionner un élève.',
            'inscription_id.exists'        => 'Élève introuvable.',
            'date_absence.before_or_equal' => "La date d'absence ne peut pas être dans le futur.",
        ]);

        $existe = Absence::query()
            ->where('inscription_id', $validated['inscription_id'])
            ->whereDate('date_absence', $validated['date_absence'])
            ->where('type', $validated['type'])
            ->exists();

        if ($existe) {
            return back()->withErrors(['date_absence' => 'Une absence de ce type est déjà enregistrée pour cet élève à cette date.']);
        }

        $absence = Absence::query()->create([
            ...$validated,
            'est_justifiee'  => $request->boolean('est_justifiee'),
            'parent_notifie' => $request->boolean('parent_notifie'),
            'signale_par'    => auth()->id(),
        ]);

        $absence->load('inscription.eleve', 'inscription.classe');
        $eleve  = $absence->inscription?->eleve;
        $classe = $absence->inscription?->classe;
        $types  = ['matin' => 'Matin', 'apres_midi' => 'Après-midi', 'journee' => 'Journée'];

        AppNotification::notifyStaff(
            (int) auth()->user()->etablissement_id,
            new AppNotification(
                notifType: 'absence',
                title:     'Absence enregistrée',
                message:   trim(($eleve?->nom ?? '') . ' ' . ($eleve?->prenoms ?? ''))
                           . ' — ' . ($types[$absence->type] ?? $absence->type)
                           . ' · ' . $absence->date_absence->format('d/m/Y'),
                link:      $eleve ? '/eleves/' . $eleve->id : '/absences',
                meta:      ['classe' => $classe?->nom],
            )
        );

        return redirect()->route('absences.index')->with('success', 'Absence enregistrée avec succès.');
    }

    public function update(Request $request, Absence $absence): RedirectResponse
    {
        $validated = $request->validate([
            'est_justifiee'  => ['boolean'],
            'parent_notifie' => ['boolean'],
            'motif'          => ['required', 'in:maladie,sans_motif,deces_famille,autre'],
            'justificatif'   => ['nullable', 'string', 'max:255'],
        ]);

        $absence->update([
            ...$validated,
            'est_justifiee'  => $request->boolean('est_justifiee'),
            'parent_notifie' => $request->boolean('parent_notifie'),
        ]);

        return back()->with('success', 'Absence mise à jour.');
    }

    public function destroy(Absence $absence): RedirectResponse
    {
        $absence->delete();

        return back()->with('success', 'Absence supprimée.');
    }

    // ─── Exports ────────────────────────────────────────────────────────────

    public function exportPdf(Request $request)
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $absences        = $this->buildQuery($request, $etablissementId)->orderByDesc('date_absence')->get();
        $payload         = $this->exportPayload($request, $etablissementId, $absences);

        $pdf = Pdf::loadView('absences.export-pdf', $payload)
            ->setPaper('a4', 'landscape');

        return $pdf->download('absences-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $absences        = $this->buildQuery($request, $etablissementId)->orderByDesc('date_absence')->get();
        $filename        = 'absences-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($absences): void {
            $output = fopen('php://output', 'w');
            if ($output === false) {
                return;
            }

            fputs($output, "\xEF\xBB\xBF");
            fputcsv($output, ['N°', 'Date', 'Élève', 'Matricule', 'Classe', 'Type', 'Motif', 'Justifiée', 'Parent notifié', 'Justificatif', 'Signalé par'], ';');

            $types  = ['matin' => 'Matin', 'apres_midi' => 'Après-midi', 'journee' => 'Journée'];
            $motifs = ['maladie' => 'Maladie', 'sans_motif' => 'Sans motif', 'deces_famille' => 'Décès famille', 'autre' => 'Autre'];

            foreach ($absences as $i => $absence) {
                fputcsv($output, [
                    $i + 1,
                    optional($absence->date_absence)->format('d/m/Y'),
                    trim($absence->inscription?->eleve?->nom . ' ' . $absence->inscription?->eleve?->prenoms),
                    $absence->inscription?->eleve?->matricule,
                    $absence->inscription?->classe?->nom,
                    $types[$absence->type]    ?? $absence->type,
                    $motifs[$absence->motif]  ?? $absence->motif,
                    $absence->est_justifiee   ? 'Oui' : 'Non',
                    $absence->parent_notifie  ? 'Oui' : 'Non',
                    $absence->justificatif    ?? '',
                    $absence->signalePar?->name ?? '',
                ], ';');
            }

            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function exportWord(Request $request)
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $absences        = $this->buildQuery($request, $etablissementId)->orderByDesc('date_absence')->get();
        $payload         = $this->exportPayload($request, $etablissementId, $absences);
        $filename        = 'absences-' . now()->format('Y-m-d') . '.doc';

        return response()
            ->view('absences.export-word', $payload)
            ->header('Content-Type', 'application/msword; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    // ─── Helpers privés ─────────────────────────────────────────────────────

    private function buildQuery(Request $request, int $etablissementId): Builder
    {
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();

        $query = Absence::query()
            ->with(['inscription.eleve', 'inscription.classe', 'signalePar'])
            ->whereHas('inscription.classe', fn ($q) => $q->where('etablissement_id', $etablissementId));

        if ($anneeActive) {
            $query->whereHas('inscription', fn ($q) => $q->where('annee_scolaire_id', $anneeActive->id));
        }

        if ($request->filled('classe_id')) {
            $query->whereHas('inscription', fn ($q) => $q->where('classe_id', (int) $request->integer('classe_id')));
        }

        if ($request->filled('date_debut')) {
            $query->where('date_absence', '>=', $request->input('date_debut'));
        }

        if ($request->filled('date_fin')) {
            $query->where('date_absence', '<=', $request->input('date_fin'));
        }

        if ($request->filled('est_justifiee')) {
            $query->where('est_justifiee', filter_var($request->input('est_justifiee'), FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }

    /** Prépare les variables communes aux templates d'export. */
    private function exportPayload(Request $request, int $etablissementId, Collection $absences): array
    {
        $etablissement = Etablissement::query()->find($etablissementId);
        $anneeActive   = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();
        $classe        = $request->filled('classe_id')
            ? Classe::query()->where('etablissement_id', $etablissementId)->find((int) $request->integer('classe_id'))
            : null;

        return [
            'absences'      => $absences,
            'etablissement' => $etablissement,
            'annee_active'  => $anneeActive,
            'classe'        => $classe,
            'filters'       => $request->only(['classe_id', 'date_debut', 'date_fin', 'est_justifiee']),
            'stats'         => [
                'total'          => $absences->count(),
                'justifiees'     => $absences->where('est_justifiee', true)->count(),
                'non_justifiees' => $absences->where('est_justifiee', false)->count(),
            ],
            'date_edition'  => now(),
        ];
    }
}