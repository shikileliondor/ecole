<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\ParametreConfig;
use App\Models\Personnel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class EmploiDuTempsController extends Controller
{
    public function index(Request $request): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $classeId = $request->integer('classe_id');
        $anneeId = $request->integer('annee_scolaire_id');

        $entries = collect($this->getEntries($etablissementId))
            ->filter(fn (array $e) => $classeId ? (int) $e['classe_id'] === $classeId : true)
            ->filter(fn (array $e) => $anneeId ? (int) $e['annee_scolaire_id'] === $anneeId : true)
            ->values();

        return Inertia::render('EmploisDuTemps/Index', [
            'filters' => ['classe_id' => $classeId ?: null, 'annee_scolaire_id' => $anneeId ?: null],
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']),
            'anneesScolaires' => AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']),
            'matieres' => Matiere::query()->orderBy('libelle')->get(['id', 'libelle']),
            'enseignants' => Personnel::query()->where('etablissement_id', $etablissementId)->enseignants()->where('statut', 'actif')->orderBy('nom')->get(['id', 'nom', 'prenoms']),
            'emplois' => $entries,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $etablissementId = (int) auth()->user()->etablissement_id;
        $entries = collect($this->getEntries($etablissementId));

        $this->assertNoConflict($entries, $data);

        $data['id'] = (string) str()->uuid();
        $entries->push($data);
        $this->saveEntries($etablissementId, $entries->all());

        return back()->with('success', 'Créneau ajouté.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $data = $this->validateData($request);
        $etablissementId = (int) auth()->user()->etablissement_id;
        $entries = collect($this->getEntries($etablissementId));

        $current = $entries->firstWhere('id', $id);
        abort_if(! is_array($current), 404);

        $this->assertNoConflict($entries->reject(fn (array $e) => $e['id'] === $id), $data);

        $this->saveEntries($etablissementId, $entries->map(fn (array $e) => $e['id'] === $id ? [...$e, ...$data, 'id' => $id] : $e)->all());

        return back()->with('success', 'Créneau modifié.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $entries = collect($this->getEntries($etablissementId));
        $this->saveEntries($etablissementId, $entries->reject(fn (array $e) => $e['id'] === $id)->values()->all());

        return back()->with('success', 'Créneau supprimé.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'classe_id' => ['required', 'integer', 'exists:classes,id'],
            'annee_scolaire_id' => ['required', 'integer', 'exists:annees_scolaires,id'],
            'jour' => ['required', 'in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi'],
            'heure_debut' => ['required', 'date_format:H:i'],
            'heure_fin' => ['required', 'date_format:H:i', 'after:heure_debut'],
            'matiere_id' => ['required', 'integer', 'exists:matieres,id'],
            'enseignant_id' => ['required', 'integer', 'exists:personnel,id'],
            'salle' => ['nullable', 'string', 'max:100'],
            'observation' => ['nullable', 'string', 'max:255'],
        ], [
            'heure_fin.after' => 'L\'heure de fin doit être supérieure à l\'heure de début.',
        ]);
    }

    private function assertNoConflict($entries, array $data): void
    {
        $overlap = fn (array $e): bool => $e['jour'] === $data['jour'] && $e['heure_debut'] < $data['heure_fin'] && $e['heure_fin'] > $data['heure_debut'];

        if ($entries->contains(fn (array $e) => (int) $e['classe_id'] === (int) $data['classe_id'] && $overlap($e))) {
            throw \Illuminate\Validation\ValidationException::withMessages(['creneau' => 'Ce créneau est déjà occupé pour cette classe.']);
        }

        if ($entries->contains(fn (array $e) => (int) $e['enseignant_id'] === (int) $data['enseignant_id'] && $overlap($e))) {
            throw \Illuminate\Validation\ValidationException::withMessages(['enseignant_id' => 'Cet enseignant a déjà un cours à cette heure.']);
        }
    }

    private function getEntries(int $etablissementId): array
    {
        $raw = ParametreConfig::query()->where('etablissement_id', $etablissementId)->where('onglet', 'emploi_du_temps')->value('donnees');

        return is_array($raw) ? Arr::get($raw, 'entries', []) : [];
    }

    private function saveEntries(int $etablissementId, array $entries): void
    {
        ParametreConfig::query()->updateOrCreate(
            ['etablissement_id' => $etablissementId, 'onglet' => 'emploi_du_temps'],
            ['donnees' => ['entries' => array_values($entries)]]
        );
    }
}
