<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\TypeFrais;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function dashboard(Request $request): Response { return Inertia::render('Finances/Dashboard', $this->buildFinanceDataset($request)); }
    public function paiements(Request $request): Response { return Inertia::render('Finances/Paiements', $this->buildFinanceDataset($request)); }
    public function impayes(Request $request): Response { return Inertia::render('Finances/Impayes', $this->buildFinanceDataset($request)); }

    public function storePaiement(Request $request): JsonResponse
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
        ]);
        $paiement = Paiement::query()->create([...$payload, 'encaisse_par' => $request->user()?->id]);
        return response()->json(['message' => 'Paiement enregistré.', 'id' => $paiement->id], 201);
    }

    public function annulerPaiement(Request $request, Paiement $paiement): JsonResponse
    {
        $payload = $request->validate(['motif_annulation' => ['required', 'string', 'min:3']]);
        $paiement->update(['statut' => 'annule', 'note_caissier' => $payload['motif_annulation']]);
        return response()->json(['message' => 'Paiement annulé.']);
    }

    private function buildFinanceDataset(Request $request): array
    {
        $etablissementId = (int) $request->user()->etablissement_id;
        $paiements = Paiement::query()->whereHas('inscription.classe', fn ($q) => $q->where('etablissement_id', $etablissementId))->with(['inscription.eleve', 'inscription.classe', 'typeFrais', 'encaissePar'])->latest('date_paiement')->get();
        $inscriptions = Inscription::query()->whereHas('classe', fn ($q) => $q->where('etablissement_id', $etablissementId))->with(['eleve', 'classe', 'paiements', 'anneeScolaire'])->get();
        $classes = Classe::query()->where('etablissement_id', $etablissementId)->orderBy('nom')->get(['id', 'nom']);
        $annees = AnneeScolaire::query()->where('etablissement_id', $etablissementId)->orderByDesc('date_debut')->get(['id', 'libelle']);
        $typesFrais = TypeFrais::query()->where('etablissement_id', $etablissementId)->orderBy('ordre')->get(['id', 'libelle', 'montant', 'classe_id', 'annee_scolaire_id']);

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

        return ['metrics' => ['totalAttendu' => $totalAttendu, 'totalEncaisse' => $totalEncaisse, 'resteAPayer' => $reste, 'impayesEnCours' => $impayes->count(), 'tauxRecouvrement' => $totalAttendu > 0 ? round(($totalEncaisse / $totalAttendu) * 100, 2) : 0, 'paiementsDuMois' => $paiementsMois, 'paiementsAnnules' => $paiements->where('statut', 'annule')->count(), 'nombrePaiements' => $paiements->count()], 'payments' => $payments, 'impayes' => $impayes, 'classes' => $classes, 'anneesScolaires' => $annees, 'typesFrais' => $typesFrais, 'modesPaiement' => array_values(Paiement::MODES_PAIEMENT), 'eleves' => $inscriptions->map(fn (Inscription $i) => ['inscription_id' => $i->id, 'eleve_id' => $i->eleve_id, 'nom' => $i->eleve?->nom_complet ?? 'Non renseigné', 'classe' => $i->classe?->nom ?? 'Non renseigné', 'classe_id' => $i->classe_id])->values()];
    }
}
