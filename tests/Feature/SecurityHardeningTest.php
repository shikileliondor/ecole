<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use Spatie\Permission\Models\Permission;
use App\Models\TypeFrais;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_eleves_create_payload_is_minimized(): void
    {
        $user = User::factory()->create(['etablissement_id' => 1]);
        $niveau = Niveau::query()->create(['libelle' => 'CE1', 'ordre' => 2, 'cycle' => 'Primaire']);
        Classe::query()->create(['etablissement_id' => 1, 'niveau_id' => $niveau->id, 'nom' => 'CE1 A', 'capacite_max' => 30, 'statut' => 'active']);
        AnneeScolaire::query()->create(['etablissement_id' => 1, 'libelle' => '2025-2026', 'date_debut' => now()->startOfYear(), 'date_fin' => now()->endOfYear(), 'statut' => 'active']);

        $response = $this->actingAs($user)->get(route('eleves.create'));
        $response->assertOk();
        foreach (['etablissement_id', 'annee_scolaire_id', 'enseignant_titulaire_id', 'created_at', 'updated_at'] as $needle) {
            $response->assertDontSee($needle, false);
        }
    }

    public function test_finance_routes_are_forbidden_without_permission(): void
    {
        $user = User::factory()->create(['etablissement_id' => 1]);

        $this->actingAs($user)->get(route('finances.paiements'))->assertForbidden();
        $this->actingAs($user)->get(route('finances.depenses'))->assertForbidden();
        $this->actingAs($user)->get(route('finances.salaires'))->assertForbidden();
        $this->actingAs($user)->get(route('finances.rapports.financiers'))->assertForbidden();
    }

    public function test_csrf_is_enforced_on_web_post_routes(): void
    {
        $user = User::factory()->create(['etablissement_id' => 1]);

        $this->withMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->actingAs($user)
            ->post(route('sms.test.store'), ['to' => '0707000000', 'message' => 'Test'])
            ->assertStatus(419);
    }

    public function test_idor_protection_on_payment_update_between_schools(): void
    {
        Permission::findOrCreate('finance.access', 'web');

        $schoolA = User::factory()->create(['etablissement_id' => 1]);
        $schoolA->givePermissionTo('finance.access');

        $schoolB = User::factory()->create(['etablissement_id' => 2]);
        $schoolB->givePermissionTo('finance.access');

        $niveau = Niveau::query()->create(['libelle' => 'CM2', 'ordre' => 6, 'cycle' => 'Primaire']);
        $classeB = Classe::query()->create(['etablissement_id' => 2, 'niveau_id' => $niveau->id, 'nom' => 'CM2 B', 'capacite_max' => 30, 'statut' => 'active']);
        $anneeB = AnneeScolaire::query()->create(['etablissement_id' => 2, 'libelle' => '2025-2026', 'date_debut' => now()->startOfYear(), 'date_fin' => now()->endOfYear(), 'statut' => 'active']);
        $eleveB = Eleve::factory()->create(['etablissement_id' => 2]);
        $inscriptionB = Inscription::query()->create(['eleve_id' => $eleveB->id, 'classe_id' => $classeB->id, 'annee_scolaire_id' => $anneeB->id, 'type' => Inscription::TYPES['nouvelle_inscription'], 'date_inscription' => now()->toDateString(), 'statut' => Inscription::STATUTS['inscrit']]);
        $typeB = TypeFrais::query()->create(['etablissement_id' => 2, 'libelle' => 'Scolarité', 'montant' => 10000, 'ordre' => 1]);
        $paiement = \App\Models\Paiement::query()->create(['inscription_id' => $inscriptionB->id, 'type_frais_id' => $typeB->id, 'montant_attendu' => 10000, 'montant_paye' => 5000, 'mode_paiement' => 'especes', 'date_paiement' => now()->toDateString()]);

        $this->actingAs($schoolA)->put(route('finances.paiements.update', $paiement), [
            'montant_paye' => 8000,
            'mode_paiement' => 'especes',
            'date_paiement' => now()->toDateString(),
        ])->assertForbidden();
    }
}
