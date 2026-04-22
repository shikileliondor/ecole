<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Composition;
use App\Models\CompositionNote;
use App\Models\Inscription;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\ParametreConfig;
use App\Models\PeriodeAcademique;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class NoteBulletinController extends Controller
{
    public function index(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $config = ParametreConfig::query()
            ->where('etablissement_id', $etablissementId)
            ->where('onglet', 'evaluations')
            ->value('donnees');

        $compositions = Composition::query()
            ->where('etablissement_id', $etablissementId)
            ->with([
                'periodeAcademique:id,libelle,ordre,annee_scolaire_id',
                'notes.classe:id,nom',
                'notes.matiere:id,libelle,coefficient',
            ])
            ->latest()
            ->get();

        $inscriptions = Inscription::query()
            ->whereHas('classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->where('statut', Inscription::STATUTS['inscrit'])
            ->with(['eleve:id,nom,prenoms', 'classe:id,nom'])
            ->orderBy('numero_ordre')
            ->orderBy('id')
            ->get(['id', 'eleve_id', 'classe_id', 'annee_scolaire_id', 'numero_ordre']);

        $notes = Note::query()
            ->where('type_note', Note::TYPES_NOTES['composition'])
            ->whereIn('inscription_id', $inscriptions->pluck('id'))
            ->get(['inscription_id', 'matiere_id', 'trimestre', 'note']);

        $noteMap = [];
        foreach ($compositions as $composition) {
            $trimestre = max(1, (int) ($composition->periodeAcademique?->ordre ?? 1));
            foreach ($notes->where('trimestre', $trimestre) as $note) {
                $noteMap[(string) $composition->id][(string) $note->matiere_id][(string) $note->inscription_id] = (string) $note->note;
            }
        }

        return Inertia::render('NotesBulletins/Index', [
            'periodes' => PeriodeAcademique::query()
                ->whereHas('anneeScolaire', fn ($query) => $query->where('etablissement_id', $etablissementId))
                ->orderBy('ordre')
                ->get(['id', 'libelle', 'annee_scolaire_id']),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']),
            'matieres' => Matiere::query()->ordonnesBulletin()->get(['id', 'libelle', 'coefficient']),
            'configEvaluation' => $config ?? [],
            'compositions' => $compositions,
            'inscriptions' => $inscriptions,
            'noteMap' => $noteMap,
        ]);
    }

    public function storeComposition(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'periode_academique_id' => ['required', 'integer', 'exists:periodes_academiques,id'],
            'libelle' => ['required', 'string', 'max:120'],
            'type' => ['required', 'in:simple,passage'],
            'bareme' => ['required', 'integer', 'min:1', 'max:100'],
            'seuil_validation' => ['required', 'numeric', 'min:0'],
            'regle_moyenne' => ['required', 'in:simple,ponderee_coefficient'],
            'mode_arrondi' => ['required', 'in:unite_inferieure,unite_superieure,demi_point,dixieme_inferieur,dixieme_superieur'],
            'appreciations_auto' => ['nullable', 'string', 'max:4000'],
        ]);

        Composition::query()->create([
            ...$data,
            'etablissement_id' => $etablissementId,
            'est_publie' => false,
        ]);

        return back()->with('success', 'Composition enregistrée.');
    }

    public function storeNotes(Request $request, Composition $composition): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($composition->etablissement_id === $etablissementId, 403);

        $data = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.matiere_id' => ['required', 'integer', 'exists:matieres,id'],
            'notes.*.moyenne' => ['nullable', 'numeric', 'min:0'],
        ]);

        $classe = Classe::query()->where('id', $data['classe_id'])->where('etablissement_id', $etablissementId)->firstOrFail();

        foreach ($data['notes'] as $note) {
            if ($note['moyenne'] === null || $note['moyenne'] === '') {
                continue;
            }

            CompositionNote::query()->updateOrCreate(
                [
                    'composition_id' => $composition->id,
                    'classe_id' => $classe->id,
                    'matiere_id' => (int) $note['matiere_id'],
                ],
                ['moyenne' => (float) $note['moyenne']]
            );
        }

        return back()->with('success', 'Notes de composition enregistrées.');
    }

    public function exportComposition(Request $request, Composition $composition): StreamedResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($composition->etablissement_id === $etablissementId, 403);

        $payload = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
        ]);

        $classe = Classe::query()->where('id', $payload['classe_id'])->where('etablissement_id', $etablissementId)->firstOrFail();
        $notes = CompositionNote::query()
            ->where('composition_id', $composition->id)
            ->where('classe_id', $classe->id)
            ->with('matiere:id,libelle,coefficient')
            ->orderBy('matiere_id')
            ->get();

        $filename = sprintf('composition-%d-classe-%d.csv', $composition->id, $classe->id);

        return response()->streamDownload(function () use ($notes, $composition, $classe): void {
            $output = fopen('php://output', 'wb');
            fputcsv($output, ['Composition', $composition->libelle]);
            fputcsv($output, ['Classe', $classe->nom]);
            fputcsv($output, ['Type', $composition->type]);
            fputcsv($output, []);
            fputcsv($output, ['Matière', 'Moyenne', 'Coefficient']);

            $total = 0.0;
            $coefTotal = 0.0;

            foreach ($notes as $note) {
                $coef = (float) ($note->matiere?->coefficient ?? 1);
                fputcsv($output, [$note->matiere?->libelle, $note->moyenne, $coef]);
                $total += (float) $note->moyenne * ($composition->regle_moyenne === 'ponderee_coefficient' ? $coef : 1);
                $coefTotal += $composition->regle_moyenne === 'ponderee_coefficient' ? $coef : 1;
            }

            $moyenne = $coefTotal > 0 ? round($total / $coefTotal, 2) : 0;
            fputcsv($output, []);
            fputcsv($output, ['Moyenne générale', $moyenne]);
            fputcsv($output, ['Seuil validation', $composition->seuil_validation]);
            fputcsv($output, ['Décision', $composition->type === 'passage' ? ($moyenne >= (float) $composition->seuil_validation ? 'Passe' : 'Redouble') : 'Simple']);
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function storeEleveNotes(Request $request, Composition $composition): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($composition->etablissement_id === $etablissementId, 403);

        $data = $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'matiere_id' => ['required', 'integer', 'exists:matieres,id'],
            'notes' => ['required', 'array', 'min:1'],
            'notes.*.inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'notes.*.note' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $trimestre = max(1, (int) ($composition->periodeAcademique()->value('ordre') ?? 1));
        $anneeScolaireId = (int) ($composition->periodeAcademique()->value('annee_scolaire_id') ?? 0);

        $inscriptions = Inscription::query()
            ->whereIn('id', collect($data['notes'])->pluck('inscription_id'))
            ->where('classe_id', (int) $data['classe_id'])
            ->where('statut', Inscription::STATUTS['inscrit'])
            ->whereHas('classe', fn ($query) => $query->where('etablissement_id', $etablissementId))
            ->get(['id']);

        foreach ($data['notes'] as $payload) {
            $inscriptionId = (int) $payload['inscription_id'];
            if (! $inscriptions->firstWhere('id', $inscriptionId)) {
                continue;
            }

            $noteValue = $payload['note'];
            if ($noteValue === null || $noteValue === '') {
                continue;
            }

            Note::query()->updateOrCreate(
                [
                    'inscription_id' => $inscriptionId,
                    'matiere_id' => (int) $data['matiere_id'],
                    'trimestre' => $trimestre,
                    'type_note' => Note::TYPES_NOTES['composition'],
                ],
                [
                    'annee_scolaire_id' => $anneeScolaireId,
                    'note' => (float) $noteValue,
                    'date_saisie' => now(),
                    'saisi_par' => auth()->id(),
                ]
            );
        }

        return back()->with('success', 'Notes par élève enregistrées.');
    }
}
