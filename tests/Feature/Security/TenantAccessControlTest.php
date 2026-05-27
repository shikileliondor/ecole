<?php

declare(strict_types=1);

namespace Tests\Feature\Security;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Inscription;
use App\Models\Niveau;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantAccessControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_inscription_show_endpoint(): void
    {
        $this->get('/inscriptions/1')->assertRedirect('/login');
    }

    public function test_user_cannot_access_inscription_from_another_school(): void
    {
        $schoolA = $this->createEtablissement('Ecole A');
        $schoolB = $this->createEtablissement('Ecole B');

        $userA = User::factory()->create(['etablissement_id' => $schoolA->id]);

        $niveauB = Niveau::query()->create(['libelle' => 'CP1', 'ordre' => 1, 'description' => '']);
        $anneeB = AnneeScolaire::query()->create([
            'etablissement_id' => $schoolB->id,
            'libelle' => '2025-2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-07-01',
            'est_active' => true,
            'statut' => 'en_cours',
        ]);
        $classeB = Classe::query()->create([
            'etablissement_id' => $schoolB->id,
            'niveau_id' => $niveauB->id,
            'annee_scolaire_id' => $anneeB->id,
            'nom' => 'CP1 B',
            'capacite' => 30,
            'statut' => 'active',
        ]);
        $eleveB = Eleve::factory()->create(['etablissement_id' => $schoolB->id]);

        $inscriptionB = Inscription::query()->create([
            'eleve_id' => $eleveB->id,
            'classe_id' => $classeB->id,
            'annee_scolaire_id' => $anneeB->id,
            'date_inscription' => '2025-09-15',
            'type' => Inscription::TYPES['nouvelle_inscription'],
            'statut' => Inscription::STATUTS['inscrit'],
        ]);

        $this->actingAs($userA)->get('/inscriptions/' . $inscriptionB->id)->assertNotFound();
    }

    public function test_sql_injection_payload_in_search_does_not_break_class_listing(): void
    {
        $school = $this->createEtablissement('Ecole Test');
        $user = User::factory()->create(['etablissement_id' => $school->id]);

        $this->actingAs($user)
            ->get('/classes?search=' . urlencode("' OR 1=1 --"))
            ->assertOk();
    }

    public function test_unallowed_ordering_is_rejected(): void
    {
        $school = $this->createEtablissement('Ecole Test');
        $user = User::factory()->create(['etablissement_id' => $school->id]);

        $this->actingAs($user)
            ->get('/classes?ordering=' . urlencode('nom;DROP TABLE users'))
            ->assertStatus(422);
    }

    private function createEtablissement(string $nom): Etablissement
    {
        return Etablissement::query()->create([
            'nom' => $nom,
            'type' => 'prive_laic',
            'cycle' => 'primaire',
            'localisation_ville' => 'Abidjan',
            'contact_telephone' => '0102030405',
            'statut' => 'actif',
        ]);
    }
}
