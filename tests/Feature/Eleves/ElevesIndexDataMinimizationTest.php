<?php

declare(strict_types=1);

namespace Tests\Feature\Eleves;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ElevesIndexDataMinimizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_eleves_index_page_does_not_leak_sensitive_payload_fields(): void
    {
        $user = User::factory()->create(['etablissement_id' => 1]);

        $niveau = Niveau::query()->create(['libelle' => 'CM1', 'ordre' => 5, 'cycle' => 'CM']);
        $classe = Classe::query()->create(['etablissement_id' => 1, 'niveau_id' => $niveau->id, 'nom' => 'CM1 A', 'capacite_max' => 35, 'statut' => 'active']);
        $annee = AnneeScolaire::query()->create(['etablissement_id' => 1, 'libelle' => '2025-2026', 'date_debut' => now()->startOfYear(), 'date_fin' => now()->endOfYear(), 'statut' => 'active']);

        $eleve = Eleve::query()->create([
            'etablissement_id' => 1,
            'nom' => 'KONE',
            'prenoms' => 'Kofi',
            'sexe' => 'M',
            'statut' => 'actif',
        ]);

        Inscription::query()->create([
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'annee_scolaire_id' => $annee->id,
            'type' => Inscription::TYPES['nouvelle_inscription'],
            'date_inscription' => now()->toDateString(),
            'statut' => Inscription::STATUTS['inscrit'],
        ]);

        $response = $this->actingAs($user)->get(route('eleves.index'));
        $response->assertOk();

        foreach ([
            'inscriptions', 'inscription_active', 'date_inscription', 'created_at', 'updated_at', 'deleted_at',
            'parents_tuteurs', 'telephone_1', 'telephone_2', 'whatsapp', 'adresse_quartier', 'portal_login',
            'can_portal_access', 'total_boursiers', 'parametres.roles.destroy', 'finances.paiements.cancel',
            'storage.local', 'api.sms.send',
        ] as $needle) {
            $response->assertDontSee($needle, false);
        }
    }
}
