<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Depense;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\Personnel;
use App\Models\Salaire;
use App\Models\TypeFrais;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function dashboard(Request $request): Response { return Inertia::render('Finances/Dashboard', $this->buildFinanceDataset($request)); }
    public function paiements(Request $request): Response { return Inertia::render('Finances/Paiements', $this->buildFinanceDataset($request)); }
    public function impayes(Request $request): Response { return Inertia::render('Finances/Impayes', $this->buildFinanceDataset($request)); }
    public function depenses(Request $request): Response { return Inertia::render('Finances/Depenses', $this->buildFinanceDataset($request)); }
    public function salaires(Request $request): Response { return Inertia::render('Finances/Salaires', $this->buildFinanceDataset($request)); }
    public function rapports(Request $request): Response { return Inertia::render('Finances/Rapports', $this->buildFinanceDataset($request)); }

    public function storePaiement(Request $request): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);

        $payload = $request->validate([
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'type_frais_id' => ['required', 'integer', 'exists:types_frais,id'],
            'montant_paye' => ['required', 'integer', 'min:1'],
            'mode_paiement' => ['required', Rule::in(array_values(Paiement::MODES_PAIEMENT))],
            'date_paiement' => ['required', 'date'],
            'reference_transaction' => ['nullable', 'string', 'max:255'],
            'note_caissier' => ['nullable', 'string'],
        ]);
        $inscription = Inscription::query()
            ->whereKey((int) $payload['inscription_id'])
            ->whereHas('classe', fn ($q) => $q->where('etablissement_id', (int) $request->user()->etablissement_id))
            ->firstOrFail();
        $typeFrais = TypeFrais::query()
            ->whereKey((int) $payload['type_frais_id'])
            ->where('etablissement_id', (int) $request->user()->etablissement_id)
            ->firstOrFail();
        $montantAttendu = (int) $typeFrais->montant;
        $montantPaye = min((int) $payload['montant_paye'], $montantAttendu);

        Paiement::query()->create([
            ...$payload,
            'inscription_id' => $inscription->id,
            'type_frais_id' => $typeFrais->id,
            'montant_attendu' => $montantAttendu,
            'montant_paye' => $montantPaye,
            'encaisse_par' => $request->user()?->id,
        ]);

        return back()->with('success', 'Paiement enregistré.');
    }


    public function updatePaiement(Request $request, Paiement $paiement): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);
        $this->assertPaiementAccess($request, $paiement);

        $payload = $request->validate([
            'montant_paye' => ['required', 'integer', 'min:1'],
            'mode_paiement' => ['required', Rule::in(array_values(Paiement::MODES_PAIEMENT))],
            'date_paiement' => ['required', 'date'],
            'reference_transaction' => ['nullable', 'string', 'max:255'],
            'note_caissier' => ['nullable', 'string'],
        ]);

        if ($paiement->statut === 'annule') {
            return back()->withErrors(['paiement' => 'Un paiement annulé ne peut pas être modifié.']);
        }

        $montantAttendu = (int) $paiement->typeFrais()->value('montant');
        $paiement->update([
            ...$payload,
            'montant_attendu' => $montantAttendu,
            'montant_paye' => min((int) $payload['montant_paye'], $montantAttendu),
        ]);

        return back()->with('success', 'Paiement modifié.');
    }

    public function annulerPaiement(Request $request, Paiement $paiement): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);
        $this->assertPaiementAccess($request, $paiement);
        $payload = $request->validate(['motif_annulation' => ['required', 'string', 'min:3']]);
        $paiement->update(['statut' => 'annule', 'note_caissier' => $payload['motif_annulation']]);

        return back()->with('success', 'Paiement annulé.');
    }


    public function storeDepense(Request $request): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);
        $payload = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'montant' => ['required', 'integer', 'min:1'],
            'date_depense' => ['required', 'date'],
            'responsable_id' => ['nullable', 'integer', 'exists:personnel,id'],
            'mode_paiement' => ['nullable', 'string', 'max:255'],
            'observation' => ['nullable', 'string'],
        ]);

        Depense::query()->create([
            ...$payload,
            'etablissement_id' => (int) $request->user()->etablissement_id,
            'created_by' => $request->user()?->id,
            'statut' => 'active',
        ]);

        return back()->with('success', 'Dépense enregistrée.');
    }

    public function updateDepense(Request $request, Depense $depense): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);
        $payload = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'montant' => ['required', 'integer', 'min:1'],
            'date_depense' => ['required', 'date'],
            'responsable_id' => ['nullable', 'integer', 'exists:personnel,id'],
            'mode_paiement' => ['nullable', 'string', 'max:255'],
            'observation' => ['nullable', 'string'],
        ]);

        if ($depense->etablissement_id !== (int) $request->user()->etablissement_id) {
            abort(403);
        }

        if ($depense->statut === 'annulee') {
            return back()->withErrors(['depense' => 'Une dépense annulée ne peut pas être modifiée.']);
        }

        $depense->update($payload);

        return back()->with('success', 'Dépense modifiée.');
    }

    public function destroyDepense(Request $request, Depense $depense): RedirectResponse
    {
        $this->authorizeFinanceAccess($request);
        if ($depense->etablissement_id !== (int) $request->user()->etablissement_id) {
            abort(403);
        }

        $depense->delete();

        return back()->with('success', 'Dépense supprimée.');
    }

    private function buildFinanceDataset(Request $request): array
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        $paiements = Paiement::query()->whereHas('inscription.classe', fn ($q) => $q->where('etablissement_id', $etablissementId))->with(['inscription.eleve', 'inscription.classe', 'typeFrais', 'encaissePar'])->latest('date_paiement')->get();
        $inscriptions = Inscription::query()->whereHas('classe', fn ($q) => $q->where('etablissement_id', $etablissementId))->with(['eleve', 'classe', 'paiements', 'anneeScolaire'])->get();
        $classes = Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']);
        $annees = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']);
        $typesFrais = TypeFrais::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(['id', 'libelle', 'montant', 'classe_id', 'annee_scolaire_id']);
        $depenses = Depense::query()->where('etablissement_id', $etablissementId)->with('responsable:id,nom,prenoms')->latest('date_depense')->get();
        $personnel = Personnel::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom', 'prenoms', 'type', 'salaire_base']);
        $salaires = Salaire::query()->whereHas('personnel', fn ($q) => $q->where('etablissement_id', $etablissementId))->with('personnel:id,nom,prenoms,type')->latest('updated_at')->get();

        $totalAttendu = (int) $paiements->sum('montant_attendu');
        $totalEncaisse = (int) $paiements->whereNotIn('statut', ['impaye', 'annule'])->sum('montant_paye');
        $reste = max(0, $totalAttendu - $totalEncaisse);
        $paiementsMois = (int) $paiements->filter(fn ($p) => $p->date_paiement?->isCurrentMonth() && !in_array($p->statut, ['impaye', 'annule'], true))->sum('montant_paye');

        $payments = $paiements->map(fn (Paiement $p) => [
            'id' => $p->id, 'date' => $p->date_paiement?->format('d/m/Y') ?? '—', 'eleve' => $p->inscription?->eleve?->nom_complet ?? 'Non renseigné',
            'classe' => $p->inscription?->classe?->nom ?? 'Non renseigné', 'montant' => (int) $p->montant_paye, 'mode' => $p->mode_paiement,
            'type_frais' => $p->typeFrais?->libelle ?? 'Non renseigné', 'reference' => $p->reference_transaction, 'statut' => $p->statut,
            'inscription_id' => $p->inscription_id, 'type_frais_id' => $p->type_frais_id, 'recu_numero' => $p->recu_numero,
            'note_caissier' => $p->note_caissier, 'motif_annulation' => $p->statut === 'annule' ? $p->note_caissier : null,
            'encaisse_par_nom' => $p->encaissePar?->name,
        ])->values();

        $impayes = $inscriptions->map(function (Inscription $i) {
            $attendu = (int) $i->paiements->sum('montant_attendu');
            $paye = (int) $i->paiements->whereNotIn('statut', ['annule'])->sum('montant_paye');
            $last = $i->paiements->sortByDesc('date_paiement')->first();
            return ['inscription_id' => $i->id,'eleve' => $i->eleve?->nom_complet ?? 'Non renseigné','classe' => $i->classe?->nom ?? 'Non renseigné','type_frais' => $last?->typeFrais?->libelle ?? 'Non renseigné','type_frais_id' => $last?->type_frais_id,'montant_du' => $attendu,'montant_paye' => $paye,'reste' => max(0, $attendu - $paye),'dernier_paiement' => $last?->date_paiement?->format('d/m/Y') ?? 'Non renseigné','statut' => $last?->statut ?? 'impaye','annee_scolaire' => $i->anneeScolaire?->libelle];
        })->filter(fn (array $r) => $r['reste'] > 0)->values();

        return ['metrics' => ['totalAttendu' => $totalAttendu, 'totalEncaisse' => $totalEncaisse, 'resteAPayer' => $reste, 'impayesEnCours' => $impayes->count(), 'tauxRecouvrement' => $totalAttendu > 0 ? round(($totalEncaisse / $totalAttendu) * 100, 2) : 0, 'paiementsDuMois' => $paiementsMois, 'paiementsAnnules' => $paiements->where('statut', 'annule')->count(), 'nombrePaiements' => $paiements->count()], 'payments' => $payments, 'impayes' => $impayes, 'classes' => $classes, 'anneesScolaires' => $annees, 'typesFrais' => $typesFrais, 'modesPaiement' => array_values(Paiement::MODES_PAIEMENT), 'eleves' => $inscriptions->map(fn (Inscription $i) => ['inscription_id' => $i->id, 'eleve_id' => $i->eleve_id, 'nom' => $i->eleve?->nom_complet ?? 'Non renseigné', 'classe' => $i->classe?->nom ?? 'Non renseigné', 'classe_id' => $i->classe_id])->values(), 'depenses' => $depenses->map(fn (Depense $d) => ['id' => $d->id, 'date' => $d->date_depense?->format('Y-m-d'), 'libelle' => $d->libelle, 'categorie' => $d->categorie, 'montant' => (int) $d->montant, 'mode_paiement' => $d->mode_paiement, 'responsable' => $d->responsable?->nom_complet, 'justificatif_url' => $d->justificatif_path ? '/storage/'.$d->justificatif_path : null, 'statut' => $d->statut, 'observation' => $d->observation, 'responsable_id' => $d->responsable_id])->values(), 'salaires' => $salaires->map(fn (Salaire $s) => ['id' => $s->id, 'personnel_id' => $s->personnel_id, 'employe' => $s->personnel?->nom_complet, 'poste' => $s->personnel?->type, 'mois' => (int) $s->mois, 'salaire_base' => (int) $s->salaire_base, 'primes' => (int) $s->primes, 'deductions' => (int) $s->deductions, 'avances' => (int) $s->deductions, 'retenues' => 0, 'net_a_payer' => (int) $s->net_a_payer, 'statut' => $s->statut]), 'personnel' => $personnel->map(fn (Personnel $p) => ['id' => $p->id, 'nom' => $p->nom_complet, 'poste' => $p->type, 'salaire_base' => (int) $p->salaire_base])->values()];
    }

    private function assertPaiementAccess(Request $request, Paiement $paiement): void
    {
        $allowed = Paiement::query()
            ->whereKey($paiement->getKey())
            ->whereHas('inscription.classe', fn ($q) => $q->where('etablissement_id', (int) $request->user()->etablissement_id))
            ->exists();
        abort_unless($allowed, 403);
    }

    /**
     * @throws AuthorizationException
     */
    private function authorizeFinanceAccess(Request $request): void
    {
        $request->user()?->can('finance.access') || throw new AuthorizationException('Accès finance non autorisé.');
    }
}
