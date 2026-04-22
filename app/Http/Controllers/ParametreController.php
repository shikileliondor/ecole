<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGeneralParametreRequest;
use App\Http\Requests\UpdateParametreConfigRequest;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Matiere;
use App\Models\ModePaiement;
use App\Models\ModeleImpression;
use App\Models\Niveau;
use App\Models\ParametreConfig;
use App\Models\PeriodeAcademique;
use App\Models\StatutInscription;
use App\Models\TypeFrais;
use App\Services\Parametres\ParametreAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ParametreController extends Controller
{
    public function __construct(private readonly ParametreAuditService $auditService) {}

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
            'typesFrais' => TypeFrais::query()->where('etablissement_id', $etablissementId)->with(['niveau', 'classe'])->orderBy('ordre')->get(),
            'modesPaiement' => ModePaiement::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(),
            'statutsInscription' => StatutInscription::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(),
            'roles' => Role::query()->with('permissions')->orderBy('name')->get(),
            'permissions' => Permission::query()->orderBy('name')->get(),
            'modelesImpression' => ModeleImpression::query()->where('etablissement_id', $etablissementId)->orderBy('type_document')->orderBy('nom')->get(),
            'typesDocument' => ['bulletin', 'recu', 'carte_scolaire', 'attestation'],
        ]);
    }

    public function updateGeneral(UpdateGeneralParametreRequest $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $etablissement = Etablissement::query()->findOrFail($etablissementId);

        $avant = $etablissement->only(array_keys($request->validated()));
        $etablissement->update($request->validated());

        $this->auditService->log(
            request: $request,
            etablissementId: $etablissementId,
            onglet: 'general',
            action: 'update_general',
            cible: $etablissement,
            avant: $avant,
            apres: $etablissement->only(array_keys($request->validated())),
        );

        return back()->with('success', 'Paramètres généraux mis à jour.');
    }

    public function updateConfig(UpdateParametreConfigRequest $request, string $onglet): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $avant = ParametreConfig::query()->where('etablissement_id', $etablissementId)->where('onglet', $onglet)->value('donnees');

        $config = ParametreConfig::query()->updateOrCreate(
            ['etablissement_id' => $etablissementId, 'onglet' => $onglet],
            ['donnees' => $request->validated('donnees')],
        );

        $this->auditService->log(
            request: $request,
            etablissementId: $etablissementId,
            onglet: $onglet,
            action: 'update_config',
            cible: $config,
            avant: is_array($avant) ? $avant : null,
            apres: $config->donnees,
            justification: $request->input('justification')
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

        $annee = AnneeScolaire::query()->create([
            ...$data,
            'etablissement_id' => $etablissementId,
            'statut' => AnneeScolaire::STATUTS['en_cours'],
            'est_active' => false,
            'nb_trimestres' => 3,
        ]);

        $this->auditService->log($request, $etablissementId, 'academique', 'create_annee', $annee, null, $annee->toArray());

        return back()->with('success', 'Année scolaire ajoutée.');
    }

    public function activateAnnee(Request $request, AnneeScolaire $annee): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($annee->etablissement_id === $etablissementId, 403);

        $ancienneActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->where('est_active', true)->first();

        AnneeScolaire::query()->where('etablissement_id', $etablissementId)->update(['est_active' => false]);
        $annee->update(['est_active' => true, 'statut' => AnneeScolaire::STATUTS['en_cours']]);

        if ($ancienneActive !== null) {
            $this->auditService->log($request, $etablissementId, 'academique', 'deactivate_annee', $ancienneActive, ['est_active' => true], ['est_active' => false]);
        }
        $this->auditService->log($request, $etablissementId, 'academique', 'activate_annee', $annee, ['est_active' => false], ['est_active' => true]);

        return back()->with('success', 'Année active mise à jour.');
    }

    public function closeAnnee(Request $request, AnneeScolaire $annee): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($annee->etablissement_id === $etablissementId, 403);

        $avant = $annee->only(['statut']);
        $annee->update(['statut' => AnneeScolaire::STATUTS['cloturee'], 'est_active' => false]);

        $this->auditService->log($request, $etablissementId, 'academique', 'close_annee', $annee, $avant, $annee->only(['statut', 'est_active']), $request->input('justification'));

        return back()->with('success', 'Année scolaire clôturée.');
    }

    public function reopenAnnee(Request $request, AnneeScolaire $annee): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($annee->etablissement_id === $etablissementId, 403);

        $avant = $annee->only(['statut']);
        $annee->update(['statut' => AnneeScolaire::STATUTS['en_cours']]);

        $this->auditService->log($request, $etablissementId, 'academique', 'reopen_annee', $annee, $avant, $annee->only(['statut']), $request->input('justification'));

        return back()->with('success', 'Année scolaire réouverte.');
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

        $chevauchement = PeriodeAcademique::query()
            ->where('annee_scolaire_id', (int) $data['annee_scolaire_id'])
            ->where(function ($query) use ($data): void {
                $query->whereBetween('date_debut', [$data['date_debut'], $data['date_fin']])
                    ->orWhereBetween('date_fin', [$data['date_debut'], $data['date_fin']])
                    ->orWhere(function ($nested) use ($data): void {
                        $nested->where('date_debut', '<=', $data['date_debut'])
                            ->where('date_fin', '>=', $data['date_fin']);
                    });
            })
            ->exists();

        if ($chevauchement) {
            return back()->withErrors(['date_debut' => 'La période chevauche une période existante.']);
        }

        $periode = PeriodeAcademique::query()->create($data);

        $this->auditService->log($request, $etablissementId, 'academique', 'create_periode', $periode, null, $periode->toArray());

        return back()->with('success', 'Période académique ajoutée.');
    }

    public function destroyPeriode(Request $request, PeriodeAcademique $periode): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless(
            AnneeScolaire::query()
                ->where('id', $periode->annee_scolaire_id)
                ->where('etablissement_id', $etablissementId)
                ->exists(),
            403
        );

        $avant = $periode->toArray();
        $periode->delete();

        $this->auditService->log($request, $etablissementId, 'academique', 'delete_periode', $periode, $avant, null);

        return back()->with('success', 'Période supprimée.');
    }

    public function storeModePaiement(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:80'],
        ]);

        $mode = ModePaiement::query()->create([
            ...$data,
            'code' => null,
            'ordre' => 1,
            'etablissement_id' => $etablissementId,
            'est_actif' => true,
        ]);

        $this->auditService->log($request, $etablissementId, 'finance', 'create_mode_paiement', $mode, null, $mode->toArray());

        return back()->with('success', 'Mode de paiement ajouté.');
    }

    public function destroyModePaiement(Request $request, ModePaiement $modePaiement): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($modePaiement->etablissement_id === $etablissementId, 403);

        $avant = $modePaiement->toArray();
        $modePaiement->delete();

        $this->auditService->log($request, $etablissementId, 'finance', 'delete_mode_paiement', $modePaiement, $avant, null);

        return back()->with('success', 'Mode de paiement supprimé.');
    }

    public function storeTypeFrais(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $anneeActiveId = (int) AnneeScolaire::query()
            ->where('etablissement_id', $etablissementId)
            ->where('est_active', true)
            ->value('id');

        if ($anneeActiveId === 0) {
            return back()->withErrors(['libelle' => 'Aucune année scolaire active pour créer un frais.']);
        }

        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:120'],
            'montant' => ['required', 'integer', 'min:1'],
            'niveau_id' => ['nullable', 'integer', 'exists:niveaux,id'],
            'classe_id' => ['nullable', 'integer', 'exists:classes,id'],
            'est_obligatoire' => ['boolean'],
            'frequence' => ['required', 'string', 'in:unique,trimestriel,mensuel'],
        ]);

        if (! empty($data['classe_id'])) {
            $classe = Classe::query()
                ->where('id', (int) $data['classe_id'])
                ->where('etablissement_id', $etablissementId)
                ->firstOrFail();

            $data['niveau_id'] = $classe->niveau_id;
        }

        $ordre = (int) TypeFrais::query()
            ->where('etablissement_id', $etablissementId)
            ->max('ordre') + 1;

        $typeFrais = TypeFrais::query()->create([
            'etablissement_id' => $etablissementId,
            'annee_scolaire_id' => $anneeActiveId,
            'niveau_id' => $data['niveau_id'] ?? null,
            'classe_id' => $data['classe_id'] ?? null,
            'libelle' => $data['libelle'],
            'montant' => $data['montant'],
            'est_obligatoire' => (bool) ($data['est_obligatoire'] ?? true),
            'frequence' => $data['frequence'],
            'ordre' => $ordre,
        ]);

        $this->auditService->log($request, $etablissementId, 'finance', 'create_type_frais', $typeFrais, null, $typeFrais->toArray());

        return back()->with('success', 'Type de frais ajouté.');
    }

    public function destroyTypeFrais(Request $request, TypeFrais $typeFrais): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($typeFrais->etablissement_id === $etablissementId, 403);

        if ($typeFrais->paiements()->exists()) {
            return back()->withErrors(['libelle' => 'Impossible de supprimer un frais déjà utilisé dans des paiements.']);
        }

        $avant = $typeFrais->toArray();
        $typeFrais->delete();

        $this->auditService->log($request, $etablissementId, 'finance', 'delete_type_frais', $typeFrais, $avant, null);

        return back()->with('success', 'Type de frais supprimé.');
    }

    public function storeStatutInscription(Request $request): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        $data = $request->validate([
            'libelle' => ['required', 'string', 'max:80'],
        ]);

        $statut = StatutInscription::query()->create([
            ...$data,
            'code' => null,
            'ordre' => 1,
            'etablissement_id' => $etablissementId,
            'est_actif' => true,
        ]);

        $this->auditService->log($request, $etablissementId, 'inscriptions', 'create_statut_inscription', $statut, null, $statut->toArray());

        return back()->with('success', 'Statut d\'inscription ajouté.');
    }

    public function destroyStatutInscription(Request $request, StatutInscription $statutInscription): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($statutInscription->etablissement_id === $etablissementId, 403);

        $avant = $statutInscription->toArray();
        $statutInscription->delete();

        $this->auditService->log($request, $etablissementId, 'inscriptions', 'delete_statut_inscription', $statutInscription, $avant, null);

        return back()->with('success', 'Statut d\'inscription supprimé.');
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

    public function destroyRole(Role $role): RedirectResponse
    {
        $role->delete();

        return back()->with('success', 'Rôle supprimé.');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        Permission::query()->firstOrCreate(['name' => $data['name'], 'guard_name' => 'web']);

        return back()->with('success', 'Permission enregistrée.');
    }

    public function destroyPermission(Permission $permission): RedirectResponse
    {
        $permission->delete();

        return back()->with('success', 'Permission supprimée.');
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

        $modele = ModeleImpression::query()->create([
            ...$data,
            'etablissement_id' => $etablissementId,
            'est_actif' => true,
            'est_defaut' => (bool) ($data['est_defaut'] ?? false),
        ]);

        $this->auditService->log($request, $etablissementId, 'documents', 'create_modele_impression', $modele, null, $modele->toArray());

        return back()->with('success', 'Modèle PDF enregistré.');
    }

    public function destroyModeleImpression(Request $request, ModeleImpression $modeleImpression): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($modeleImpression->etablissement_id === $etablissementId, 403);

        $avant = $modeleImpression->toArray();
        $modeleImpression->delete();

        $this->auditService->log($request, $etablissementId, 'documents', 'delete_modele_impression', $modeleImpression, $avant, null);

        return back()->with('success', 'Modèle PDF supprimé.');
    }

    public function destroyAnnee(Request $request, AnneeScolaire $annee): RedirectResponse
    {
        $etablissementId = (int) auth()->user()->etablissement_id;
        abort_unless($annee->etablissement_id === $etablissementId, 403);

        $avant = $annee->toArray();
        $annee->delete();

        $this->auditService->log($request, $etablissementId, 'academique', 'delete_annee', $annee, $avant, null);

        return back()->with('success', 'Année scolaire supprimée.');
    }
}
