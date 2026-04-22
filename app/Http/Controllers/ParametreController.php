<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Matiere;
use App\Models\ModeleImpression;
use App\Models\ModePaiement;
use App\Models\Niveau;
use App\Models\ParametreConfig;
use App\Models\PeriodeAcademique;
use App\Models\StatutInscription;
use App\Models\TypeFrais;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ParametreController extends Controller
{
    public function index(): Response
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $etablissement = Etablissement::query()->findOrFail($etablissementId);

        $configs = ParametreConfig::query()
            ->where('etablissement_id', $etablissementId)
            ->pluck('donnees', 'onglet')
            ->all();

        return Inertia::render('Parametres/Index', [
            'etablissement' => $etablissement,
            'configs' => $configs,
            'annees' => AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(),
            'periodes' => PeriodeAcademique::query()->whereHas('anneeScolaire', fn ($query) => $query->where('etablissement_id', $etablissementId))->with('anneeScolaire:id,libelle')->orderBy('ordre')->get(),
            'niveaux' => Niveau::query()->ordonnes()->get(),
            'classes' => Classe::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('nom')->get(),
            'matieres' => Matiere::query()->ordonnesBulletin()->get(),
            'typesFrais' => TypeFrais::query()->where('etablissement_id', $etablissementId)->with('niveau')->orderBy('ordre')->get(),
            'modesPaiement' => ModePaiement::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(),
            'statutsInscription' => StatutInscription::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(),
            'roles' => Role::query()->with('permissions')->orderBy('name')->get(),
            'permissions' => Permission::query()->orderBy('name')->get(),
            'modelesImpression' => ModeleImpression::query()->where('etablissement_id', $etablissementId)->orderBy('type_document')->orderBy('nom')->get(),
            'typesDocument' => ['bulletin', 'recu', 'carte_scolaire', 'attestation'],
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:120'],
            'sigle' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'contact_telephone' => ['required', 'string', 'max:30'],
            'contact_whatsapp' => ['nullable', 'string', 'max:30'],
            'localisation_ville' => ['required', 'string', 'max:120'],
            'localisation_commune' => ['nullable', 'string', 'max:120'],
            'localisation_quartier' => ['nullable', 'string', 'max:120'],
            'devise' => ['nullable', 'string', 'max:10'],
            'directeur_nom' => ['nullable', 'string', 'max:120'],
            'agrement_mena' => ['nullable', 'string', 'max:120'],
            'annee_creation' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        Etablissement::query()->where('id', $etablissementId)->update($data);

        return back()->with('success', 'Paramètres généraux mis à jour.');
    }

    public function updateConfig(Request $request, string $onglet): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'donnees' => ['array'],
        ]);

        ParametreConfig::query()->updateOrCreate(
            ['etablissement_id' => $etablissementId, 'onglet' => $onglet],
            ['donnees' => $data['donnees'] ?? []],
        );

        return back()->with('success', 'Configuration mise à jour.');
    }

    public function storeAnnee(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:60'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
        ]);

        AnneeScolaire::query()->create([
            ...$data,
            'etablissement_id' => $etablissementId,
            'statut' => AnneeScolaire::STATUTS['en_cours'],
            'est_active' => false,
            'nb_trimestres' => 3,
        ]);

        return back()->with('success', 'Année scolaire ajoutée.');
    }

    public function activateAnnee(AnneeScolaire $annee): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($annee->etablissement_id === $etablissementId, 403);

        AnneeScolaire::query()->where('etablissement_id', $etablissementId)->update(['est_active' => false]);
        $annee->update(['est_active' => true]);

        return back()->with('success', 'Année active mise à jour.');
    }

    public function storePeriode(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'annee_scolaire_id' => ['required', 'integer', 'exists:annees_scolaires,id'],
            'libelle' => ['required', 'string', 'max:60'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date', 'after:date_debut'],
            'ordre' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        abort_unless(AnneeScolaire::query()->where('id', $data['annee_scolaire_id'])->where('etablissement_id', $etablissementId)->exists(), 403);

        PeriodeAcademique::query()->create($data);

        return back()->with('success', 'Période académique ajoutée.');
    }

    public function storeModePaiement(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:80'],
            'code' => ['nullable', 'string', 'max:30'],
            'ordre' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        ModePaiement::query()->create([
            ...$data,
            'etablissement_id' => (int) auth()->user()->etablissement_id,
            'est_actif' => true,
        ]);

        return back()->with('success', 'Mode de paiement ajouté.');
    }

    public function storeStatutInscription(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:80'],
            'code' => ['nullable', 'string', 'max:30'],
            'ordre' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        StatutInscription::query()->create([
            ...$data,
            'etablissement_id' => (int) auth()->user()->etablissement_id,
            'est_actif' => true,
        ]);

        return back()->with('success', 'Statut d\'inscription ajouté.');
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'permissions' => ['array'],
            'permissions.*' => ['string'],
        ]);

        $role = Role::query()->firstOrCreate(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        return back()->with('success', 'Rôle enregistré.');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        Permission::query()->firstOrCreate(['name' => $data['name'], 'guard_name' => 'web']);

        return back()->with('success', 'Permission enregistrée.');
    }

    public function storeModeleImpression(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'type_document' => ['required', 'string', 'max:60'],
            'nom' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'template_html' => ['nullable', 'string'],
            'est_defaut' => ['boolean'],
        ]);

        if (($data['est_defaut'] ?? false) === true) {
            ModeleImpression::query()->where('etablissement_id', $etablissementId)->where('type_document', $data['type_document'])->update(['est_defaut' => false]);
        }

        ModeleImpression::query()->create([
            ...$data,
            'etablissement_id' => $etablissementId,
            'est_actif' => true,
            'est_defaut' => (bool) ($data['est_defaut'] ?? false),
        ]);

        return back()->with('success', 'Modèle PDF enregistré.');
    }
}
