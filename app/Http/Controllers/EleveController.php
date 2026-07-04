<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreEleveRequest;
use App\Http\Requests\UpdateEleveRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Notifications\AppNotification;
use App\Services\EleveService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EleveController extends Controller
{
    public function __construct(
        private EleveService $eleveService,
    ) {}

    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $filters = $this->validatedFilters($request, $etablissementId);
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);

        return Inertia::render('Eleves/Index', [
            'eleves' => $this->eleveService->getElevesAvecFiltres($filters, $etablissementId, $anneeScolaireId),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->when($anneeScolaireId > 0, fn ($q) => $q->where('annee_scolaire_id', $anneeScolaireId))->with('niveau')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
            'filters' => $filters,
            'stats' => $this->eleveService->getStatsEleves($etablissementId, $anneeScolaireId),
        ]);
    }

    public function create(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();

        return Inertia::render('Eleves/Create', [
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->withCount('inscriptions')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
            'annees' => AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']),
            'annee_active' => $anneeActive,
        ]);
    }

    public function store(StoreEleveRequest $request): RedirectResponse
    {
        Log::info('EleveController@store called', ['user_id' => auth()->id()]);
        try {
            $eleve = $this->eleveService->creerEleve($request->validated() + ['photo' => $request->file('photo')], (int) auth()->user()->etablissement_id);
            Log::info('Eleve created', ['eleve_id' => $eleve->id]);

            $classe = $eleve->inscriptions->first()?->classe;
            AppNotification::notifyStaff(
                (int) auth()->user()->etablissement_id,
                new AppNotification(
                    notifType: 'inscription',
                    title: 'Nouvel élève inscrit',
                    message: trim($eleve->nom.' '.$eleve->prenoms)
                               .($classe ? ' — '.$classe->nom : ''),
                    link: '/eleves/'.$eleve->id,
                )
            );

            return redirect()->route('eleves.show', $eleve->id)->with('success', 'Élève inscrit avec succès');
        } catch (\Throwable $e) {
            Log::error('Erreur lors de la création d\'un élève', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->back()->withInput()->with('error', 'Une erreur est survenue lors de l\'inscription.');
        }
    }

    public function show(int $id): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);
        $eleve = $this->eleveService->getFicheEleve($id, $etablissementId);
        $inscriptionActive = ($anneeScolaireId > 0 ? $eleve->inscriptions->firstWhere('annee_scolaire_id', $anneeScolaireId) : null)
            ?? $eleve->inscriptions->firstWhere('statut', Inscription::STATUTS['inscrit'])
            ?? $eleve->inscriptions->first();

        return Inertia::render('Eleves/Show', [
            'eleve' => $eleve,
            'inscription_active' => $inscriptionActive,
            'notes_par_trimestre' => $inscriptionActive ? $this->eleveService->getNotesParTrimestre($inscriptionActive->id, $etablissementId) : [1 => [], 2 => [], 3 => []],
            'paiements' => $inscriptionActive?->paiements ?? collect(),
            'absences' => $inscriptionActive?->absences ?? collect(),
            'stats_financieres' => $inscriptionActive ? $this->eleveService->getStatsFinancieres($inscriptionActive->id, $etablissementId) : ['total_du' => 0, 'total_paye' => 0, 'solde' => 0, 'est_a_jour' => true],
        ]);
    }

    public function edit(int $id): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;

        return Inertia::render('Eleves/Edit', [
            'eleve' => $this->eleveService->getFicheEleve($id, $etablissementId),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'niveaux' => Niveau::query()->orderBy('ordre')->get(),
        ]);
    }

    public function update(UpdateEleveRequest $request, int $id): RedirectResponse
    {
        $eleve = $this->eleveService->mettreAJourEleve($id, $request->validated() + ['photo' => $request->file('photo')], (int) auth()->user()->etablissement_id);

        return redirect()->route('eleves.show', $eleve->id)->with('success', 'Informations de l\'élève mises à jour avec succès');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->eleveService->supprimerEleve($id, (int) auth()->user()->etablissement_id);

        return redirect()->route('eleves.index')->with('success', 'Élève supprimé');
    }

    public function transferer(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate(['ecole_destination' => ['required', 'string', 'max:255']]);
        $this->eleveService->transfererEleve($id, $validated['ecole_destination'], (int) auth()->user()->etablissement_id);

        return redirect()->route('eleves.index')->with('success', 'Élève transféré avec succès');
    }

    public function exportPdf(Request $request)
    {
        @ini_set('memory_limit', '512M');
        @set_time_limit(120);

        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);
        $filters = $this->validatedFilters($request, $etablissementId);
        $classe = $request->filled('classe_id')
            ? Classe::query()->where('etablissement_id', $etablissementId)->find((int) $request->integer('classe_id'))
            : null;
        $eleves = $this->eleveService->getListePourExport($filters, $etablissementId, $anneeScolaireId);
        $rows = $eleves->map(function ($eleve, int $index): array {
            $parent = $eleve->parentsTuteurs->firstWhere('pivot.est_principal', true) ?? $eleve->parentsTuteurs->first();
            $inscription = $eleve->inscriptions->first();

            return [
                'numero' => $index + 1,
                'matricule' => (string) $eleve->matricule,
                'nom_complet' => trim((string) $eleve->nom.' '.(string) $eleve->prenoms),
                'sexe' => $eleve->sexe === 'M' ? 'Garçon' : 'Fille',
                'date_naissance' => $eleve->date_naissance ? $eleve->date_naissance->format('d/m/Y') : '',
                'parent' => trim((string) ($parent?->nom ?? '').' '.(string) ($parent?->prenoms ?? '')),
                'telephone' => (string) ($parent?->telephone_1 ?? ''),
                'statut' => ucfirst((string) $eleve->statut),
                'annee_scolaire' => (string) ($inscription?->anneeScolaire?->libelle ?? ''),
            ];
        });
        $etablissement = auth()->user()?->etablissement;
        $logoPath = $this->getPdfLogoPath($etablissement?->logo_pdf ?? $etablissement?->logo);
        $pdf = Pdf::loadView('eleves.export-pdf', [
            'eleves' => $rows,
            'classe' => $classe,
            'date_edition' => now(),
            'filters' => $filters,
            'etablissement' => $etablissement,
            'logoPath' => $logoPath,
            'anneeScolaire' => $rows->first()['annee_scolaire'] ?? null,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('eleves-'.($classe?->nom ? str($classe->nom)->slug() : 'toutes-classes').'-'.now()->format('Y-m-d').'.pdf');
    }

    private function getPdfLogoPath(?string $logo): ?string
    {
        if (blank($logo)) {
            return null;
        }

        $logoPath = public_path('storage/'.ltrim($logo, '/'));

        return is_file($logoPath) ? $logoPath : null;
    }

    public function exportWord(Request $request)
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);
        $filters = $this->validatedFilters($request, $etablissementId);
        $classe = $request->filled('classe_id')
            ? Classe::query()->where('etablissement_id', $etablissementId)->find((int) $request->integer('classe_id'))
            : null;
        $eleves = $this->eleveService->getListePourExport($filters, $etablissementId, $anneeScolaireId);
        $filename = 'eleves-'.($classe?->nom ? str($classe->nom)->slug() : 'toutes-classes').'-'.now()->format('Y-m-d').'.doc';

        return response()
            ->view('eleves.export-word', ['eleves' => $eleves, 'classe' => $classe, 'date_edition' => now()])
            ->header('Content-Type', 'application/msword; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeScolaireId = (int) (AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->value('id') ?? 0);
        $filters = $this->validatedFilters($request, $etablissementId);
        $classe = $request->filled('classe_id')
            ? Classe::query()->where('etablissement_id', $etablissementId)->find((int) $request->integer('classe_id'))
            : null;
        $eleves = $this->eleveService->getListePourExport($filters, $etablissementId, $anneeScolaireId);
        $filename = 'eleves-'.($classe?->nom ? str($classe->nom)->slug() : 'toutes-classes').'-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($eleves): void {
            $output = fopen('php://output', 'w');
            if ($output === false) {
                return;
            }

            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['N°', 'Matricule', 'Nom et prénoms', 'Sexe', 'Date naissance', 'Parent', 'Téléphone', 'Statut'], ';');

            foreach ($eleves as $index => $eleve) {
                $parent = $eleve->parentsTuteurs->firstWhere('pivot.est_principal', true) ?? $eleve->parentsTuteurs->first();
                fputcsv($output, [
                    $index + 1,
                    $this->escapeCsvFormulaCell($eleve->matricule),
                    $this->escapeCsvFormulaCell(trim($eleve->nom.' '.$eleve->prenoms)),
                    $eleve->sexe === 'M' ? 'Garçon' : 'Fille',
                    optional($eleve->date_naissance)->format('d/m/Y') ?? $eleve->date_naissance,
                    $this->escapeCsvFormulaCell(trim(($parent?->nom ?? '').' '.($parent?->prenoms ?? ''))),
                    $this->escapeCsvFormulaCell($parent?->telephone_1),
                    ucfirst((string) $eleve->statut),
                ], ';');
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function validatedFilters(Request $request, int $etablissementId): array
    {
        return $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'classe_id' => ['nullable', 'integer', Rule::exists('classes', 'id')->where('etablissement_id', $etablissementId)],
            'niveau_id' => ['nullable', 'integer', Rule::exists('niveaux', 'id')],
            'statut' => ['nullable', Rule::in(array_values(Eleve::STATUTS))],
            'sexe' => ['nullable', Rule::in(array_values(Eleve::SEXES))],
        ]);
    }

    private function escapeCsvFormulaCell(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return preg_match('/^[=+\-@]/', $value) === 1 ? "'".$value : $value;
    }
}
