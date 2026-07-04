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
use App\Notifications\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $payload = $request->validate([
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'type_frais_id' => ['required', 'integer', 'exists:types_frais,id'],
            'montant_attendu' => ['required', 'integer', 'min:0'],
            'montant_paye' => ['required', 'integer', 'min:1'],
            'mode_paiement' => ['required', 'string'],
            'date_paiement' => ['required', 'date'],
            'reference_transaction' => ['nullable', 'string', 'max:255'],
            'note_caissier' => ['nullable', 'string'],
            'justificatif' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:4096'],
        ]);

        unset($payload['justificatif']);

        if ($request->hasFile('justificatif')) {
            $payload['justificatif_path'] = $request->file('justificatif')->store('paiements/justificatifs', 'public');
        }

        $paiement = Paiement::query()->create([...$payload, 'encaisse_par' => $request->user()?->id]);

        $paiement->load('inscription.eleve');
        $eleve = $paiement->inscription?->eleve;
        $montantFormate = number_format((int) $payload['montant_paye'], 0, ',', ' ') . ' FCFA';

        AppNotification::notifyStaff(
            (int) $request->user()?->etablissement_id,
            new AppNotification(
                notifType: 'paiement',
                title:     'Paiement reçu',
                message:   ($eleve ? trim($eleve->nom . ' ' . $eleve->prenoms) . ' — ' : '') . $montantFormate,
                link:      '/finances/paiements',
            )
        );

        return back()->with('success', 'Paiement enregistré.');
    }


    public function updatePaiement(Request $request, Paiement $paiement): RedirectResponse
    {
        $payload = $request->validate([
            'montant_attendu' => ['required', 'integer', 'min:0'],
            'montant_paye' => ['required', 'integer', 'min:1'],
            'mode_paiement' => ['required', 'string'],
            'date_paiement' => ['required', 'date'],
            'reference_transaction' => ['nullable', 'string', 'max:255'],
            'note_caissier' => ['nullable', 'string'],
            'justificatif' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:4096'],
        ]);

        unset($payload['justificatif']);

        if ($paiement->statut === 'annule') {
            return back()->withErrors(['paiement' => 'Un paiement annulé ne peut pas être modifié.']);
        }

        if ($request->hasFile('justificatif')) {
            if ($paiement->justificatif_path) {
                Storage::disk('public')->delete($paiement->justificatif_path);
            }

            $payload['justificatif_path'] = $request->file('justificatif')->store('paiements/justificatifs', 'public');
        }

        $paiement->update($payload);

        return back()->with('success', 'Paiement modifié.');
    }

    public function annulerPaiement(Request $request, Paiement $paiement): RedirectResponse
    {
        $payload = $request->validate(['motif_annulation' => ['required', 'string', 'min:3']]);
        $paiement->update(['statut' => 'annule', 'note_caissier' => $payload['motif_annulation']]);

        return back()->with('success', 'Paiement annulé.');
    }


    public function storeDepense(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'montant' => ['required', 'integer', 'min:1'],
            'date_depense' => ['required', 'date'],
            'responsable_id' => ['nullable', 'integer', 'exists:personnel,id'],
            'mode_paiement' => ['nullable', 'string', 'max:255'],
            'observation' => ['nullable', 'string'],
            'justificatif' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:4096'],
        ]);

        unset($payload['justificatif']);

        if ($request->hasFile('justificatif')) {
            $payload['justificatif_path'] = $request->file('justificatif')->store('depenses/justificatifs', 'public');
        }

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
        $payload = $request->validate([
            'libelle' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:255'],
            'montant' => ['required', 'integer', 'min:1'],
            'date_depense' => ['required', 'date'],
            'responsable_id' => ['nullable', 'integer', 'exists:personnel,id'],
            'mode_paiement' => ['nullable', 'string', 'max:255'],
            'observation' => ['nullable', 'string'],
            'justificatif' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:4096'],
        ]);

        unset($payload['justificatif']);

        if ($depense->etablissement_id !== (int) $request->user()->etablissement_id) {
            abort(403);
        }

        if ($depense->statut === 'annulee') {
            return back()->withErrors(['depense' => 'Une dépense annulée ne peut pas être modifiée.']);
        }

        if ($request->hasFile('justificatif')) {
            if ($depense->justificatif_path) {
                Storage::disk('public')->delete($depense->justificatif_path);
            }

            $payload['justificatif_path'] = $request->file('justificatif')->store('depenses/justificatifs', 'public');
        }

        $depense->update($payload);

        return back()->with('success', 'Dépense modifiée.');
    }

    public function destroyDepense(Request $request, Depense $depense): RedirectResponse
    {
        if ($depense->etablissement_id !== (int) $request->user()->etablissement_id) {
            abort(403);
        }

        if ($depense->justificatif_path) {
            Storage::disk('public')->delete($depense->justificatif_path);
        }

        $depense->delete();

        return back()->with('success', 'Dépense supprimée.');
    }

    public function storeSalaire(Request $request): RedirectResponse
    {
        $etablissementId = (int) $request->user()->etablissement_id;

        $data = $request->validate([
            'personnel_id'      => ['required', 'integer', 'exists:personnel,id'],
            'annee_scolaire_id' => ['required', 'integer', 'exists:annees_scolaires,id'],
            'mois'              => ['required', 'integer', 'min:1', 'max:12'],
            'salaire_base'      => ['required', 'integer', 'min:0'],
            'primes'            => ['nullable', 'integer', 'min:0'],
            'deductions'        => ['nullable', 'integer', 'min:0'],
            'mode_paiement'     => ['required', 'string', 'in:especes,virement,orange_money,wave,mtn_momo'],
        ]);

        abort_unless(
            Personnel::query()->where('id', $data['personnel_id'])->where('etablissement_id', $etablissementId)->exists(),
            403
        );

        Salaire::query()->updateOrCreate(
            ['personnel_id' => $data['personnel_id'], 'annee_scolaire_id' => $data['annee_scolaire_id'], 'mois' => $data['mois']],
            ['salaire_base' => $data['salaire_base'], 'primes' => $data['primes'] ?? 0, 'deductions' => $data['deductions'] ?? 0,
             'mode_paiement' => $data['mode_paiement'], 'net_a_payer' => 0]
        );

        return back()->with('success', 'Salaire enregistré.');
    }

    public function updateSalaire(Request $request, Salaire $salaire): RedirectResponse
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        abort_unless($salaire->personnel?->etablissement_id === $etablissementId, 403);
        abort_if($salaire->statut === 'paye', 403, 'Un salaire payé ne peut pas être modifié.');

        $data = $request->validate([
            'salaire_base'  => ['required', 'integer', 'min:0'],
            'primes'        => ['nullable', 'integer', 'min:0'],
            'deductions'    => ['nullable', 'integer', 'min:0'],
            'mode_paiement' => ['required', 'string', 'in:especes,virement,orange_money,wave,mtn_momo'],
        ]);

        $salaire->update([
            'salaire_base'  => $data['salaire_base'],
            'primes'        => $data['primes'] ?? 0,
            'deductions'    => $data['deductions'] ?? 0,
            'mode_paiement' => $data['mode_paiement'],
        ]);

        return back()->with('success', 'Salaire mis à jour.');
    }

    public function payerSalaire(Request $request, Salaire $salaire): RedirectResponse
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        abort_unless($salaire->personnel?->etablissement_id === $etablissementId, 403);
        abort_if($salaire->statut === 'paye', 403, 'Salaire déjà payé.');

        $data = $request->validate([
            'date_paiement' => ['required', 'date'],
            'mode_paiement' => ['required', 'string', 'in:especes,virement,orange_money,wave,mtn_momo'],
        ]);

        $salaire->update([
            'statut'        => 'paye',
            'date_paiement' => $data['date_paiement'],
            'mode_paiement' => $data['mode_paiement'],
            'valide_par'    => $request->user()->id,
        ]);

        return back()->with('success', 'Salaire marqué comme payé.');
    }

    public function destroySalaire(Request $request, Salaire $salaire): RedirectResponse
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        abort_unless($salaire->personnel?->etablissement_id === $etablissementId, 403);
        abort_if($salaire->statut === 'paye', 403, 'Un salaire payé ne peut pas être supprimé.');

        $salaire->delete();

        return back()->with('success', 'Salaire supprimé.');
    }

    public function genererSalaires(Request $request): RedirectResponse
    {
        $etablissementId = (int) $request->user()->etablissement_id;

        $data = $request->validate([
            'annee_scolaire_id' => ['required', 'integer', 'exists:annees_scolaires,id'],
            'mois'              => ['required', 'integer', 'min:1', 'max:12'],
            'mode_paiement'     => ['required', 'string', 'in:especes,virement,orange_money,wave,mtn_momo'],
        ]);

        $personnel = Personnel::query()
            ->where('etablissement_id', $etablissementId)
            ->where('statut', 'actif')
            ->whereNotNull('salaire_base')
            ->where('salaire_base', '>', 0)
            ->get(['id', 'salaire_base']);

        $crees = 0;
        foreach ($personnel as $p) {
            $exists = Salaire::query()
                ->where('personnel_id', $p->id)
                ->where('annee_scolaire_id', $data['annee_scolaire_id'])
                ->where('mois', $data['mois'])
                ->exists();

            if (! $exists) {
                Salaire::query()->create([
                    'personnel_id'      => $p->id,
                    'annee_scolaire_id' => $data['annee_scolaire_id'],
                    'mois'              => $data['mois'],
                    'salaire_base'      => $p->salaire_base,
                    'primes'            => 0,
                    'deductions'        => 0,
                    'net_a_payer'       => 0,
                    'mode_paiement'     => $data['mode_paiement'],
                    'statut'            => 'en_attente',
                ]);
                $crees++;
            }
        }

        $msg = $crees > 0
            ? "{$crees} fiche(s) de salaire générée(s) pour ce mois."
            : 'Toutes les fiches existent déjà pour ce mois.';

        return back()->with('success', $msg);
    }

    private function buildFinanceDataset(Request $request): array
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        $anneeActive = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->active()->first();
        $anneeId = $request->integer('annee_id') ?: $anneeActive?->id;

        $paiements = Paiement::query()
            ->whereHas('inscription.classe', fn ($q) => $q->where('etablissement_id', $etablissementId))
            ->when($anneeId, fn ($q) => $q->whereHas('inscription', fn ($q2) => $q2->where('annee_scolaire_id', $anneeId)))
            ->with(['inscription.eleve', 'inscription.classe', 'typeFrais', 'encaissePar'])->latest('date_paiement')->get();
        $inscriptions = Inscription::query()
            ->whereHas('classe', fn ($q) => $q->where('etablissement_id', $etablissementId))
            ->when($anneeId, fn ($q) => $q->where('annee_scolaire_id', $anneeId))
            ->with(['eleve', 'classe', 'paiements', 'anneeScolaire'])->get();
        $classes = Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']);
        $annees = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']);
        $typesFrais = TypeFrais::query()->where('etablissement_id', $etablissementId)->when($anneeId, fn ($q) => $q->where('annee_scolaire_id', $anneeId))->orderBy('ordre')->get(['id', 'libelle', 'montant', 'classe_id', 'annee_scolaire_id']);
        $depenses = Depense::query()->where('etablissement_id', $etablissementId)->with('responsable:id,nom,prenoms')->latest('date_depense')->get();
        $personnel = Personnel::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom', 'prenoms', 'type', 'salaire_base']);
        $salaires = Salaire::query()->whereHas('personnel', fn ($q) => $q->where('etablissement_id', $etablissementId))->when($anneeId, fn ($q) => $q->where('annee_scolaire_id', $anneeId))->with('personnel:id,nom,prenoms,type')->latest('updated_at')->get();

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
            'justificatif_url' => $p->justificatif_path ? '/storage/'.$p->justificatif_path : null,
        ])->values();

        $impayes = $inscriptions->map(function (Inscription $i) {
            $attendu = (int) $i->paiements->sum('montant_attendu');
            $paye = (int) $i->paiements->whereNotIn('statut', ['annule'])->sum('montant_paye');
            $last = $i->paiements->sortByDesc('date_paiement')->first();
            return ['inscription_id' => $i->id,'eleve' => $i->eleve?->nom_complet ?? 'Non renseigné','classe' => $i->classe?->nom ?? 'Non renseigné','type_frais' => $last?->typeFrais?->libelle ?? 'Non renseigné','type_frais_id' => $last?->type_frais_id,'montant_du' => $attendu,'montant_paye' => $paye,'reste' => max(0, $attendu - $paye),'dernier_paiement' => $last?->date_paiement?->format('d/m/Y') ?? 'Non renseigné','statut' => $last?->statut ?? 'impaye','annee_scolaire' => $i->anneeScolaire?->libelle];
        })->filter(fn (array $r) => $r['reste'] > 0)->values();

        return ['metrics' => ['totalAttendu' => $totalAttendu, 'totalEncaisse' => $totalEncaisse, 'resteAPayer' => $reste, 'impayesEnCours' => $impayes->count(), 'tauxRecouvrement' => $totalAttendu > 0 ? round(($totalEncaisse / $totalAttendu) * 100, 2) : 0, 'paiementsDuMois' => $paiementsMois, 'paiementsAnnules' => $paiements->where('statut', 'annule')->count(), 'nombrePaiements' => $paiements->count()], 'payments' => $payments, 'impayes' => $impayes, 'classes' => $classes, 'anneesScolaires' => $annees, 'typesFrais' => $typesFrais, 'modesPaiement' => array_values(Paiement::MODES_PAIEMENT), 'eleves' => $inscriptions->map(fn (Inscription $i) => ['inscription_id' => $i->id, 'eleve_id' => $i->eleve_id, 'nom' => $i->eleve?->nom_complet ?? 'Non renseigné', 'classe' => $i->classe?->nom ?? 'Non renseigné', 'classe_id' => $i->classe_id])->values(), 'depenses' => $depenses->map(fn (Depense $d) => ['id' => $d->id, 'date' => $d->date_depense?->format('Y-m-d'), 'libelle' => $d->libelle, 'categorie' => $d->categorie, 'montant' => (int) $d->montant, 'mode_paiement' => $d->mode_paiement, 'responsable' => $d->responsable?->nom_complet, 'justificatif_url' => $d->justificatif_path ? '/storage/'.$d->justificatif_path : null, 'statut' => $d->statut, 'observation' => $d->observation, 'responsable_id' => $d->responsable_id])->values(), 'salaires' => $salaires->map(fn (Salaire $s) => ['id' => $s->id, 'personnel_id' => $s->personnel_id, 'employe' => $s->personnel?->nom_complet, 'poste' => $s->personnel?->type, 'mois' => (int) $s->mois, 'salaire_base' => (int) $s->salaire_base, 'primes' => (int) $s->primes, 'deductions' => (int) $s->deductions, 'avances' => (int) $s->deductions, 'retenues' => 0, 'net_a_payer' => (int) $s->net_a_payer, 'statut' => $s->statut]), 'personnel' => $personnel->map(fn (Personnel $p) => ['id' => $p->id, 'nom' => $p->nom_complet, 'poste' => $p->type, 'salaire_base' => (int) $p->salaire_base])->values()];
    }
}
