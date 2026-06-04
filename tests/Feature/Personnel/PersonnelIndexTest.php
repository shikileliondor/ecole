<?php

declare(strict_types=1);

namespace Tests\Feature\Personnel;

use App\Models\Etablissement;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Tests\TestCase;

class PersonnelIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_teacher_rows_are_listed_as_enseignants(): void
    {
        $this->withoutMiddleware(PermissionMiddleware::class);

        $school = Etablissement::query()->create([
            'nom' => 'Groupe Scolaire Test',
            'type' => Etablissement::TYPES['prive_laic'],
            'cycle' => Etablissement::CYCLES['primaire'],
            'localisation_ville' => 'Abidjan',
            'contact_telephone' => '0102030405',
        ]);

        $user = User::factory()->create(['etablissement_id' => $school->id]);

        $legacyTeacher = Personnel::factory()->create([
            'etablissement_id' => $school->id,
            'categorie' => Personnel::CATEGORIES['personnel_ecole'],
            'type' => Personnel::TYPES['enseignant'],
            'nom' => 'AKA',
            'prenoms' => 'Franck',
        ]);

        Personnel::factory()->caissier()->create([
            'etablissement_id' => $school->id,
            'nom' => 'ASSI',
            'prenoms' => 'Clarisse',
        ]);

        $this
            ->actingAs($user)
            ->get(route('personnel.index', ['categorie' => Personnel::CATEGORIES['enseignant']]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Personnel/Index')
                ->where('stats.total', 2)
                ->where('stats.enseignants', 1)
                ->where('stats.personnel_ecole', 1)
                ->where('personnel.total', 1)
                ->where('personnel.data.0.id', $legacyTeacher->id)
            );
    }

    public function test_personnel_can_be_updated_with_patch_method_spoofing(): void
    {
        $this->withoutMiddleware(PermissionMiddleware::class);

        $school = Etablissement::query()->create([
            'nom' => 'Groupe Scolaire Test',
            'type' => Etablissement::TYPES['prive_laic'],
            'cycle' => Etablissement::CYCLES['primaire'],
            'localisation_ville' => 'Abidjan',
            'contact_telephone' => '0102030405',
        ]);

        $user = User::factory()->create(['etablissement_id' => $school->id]);
        $personnel = Personnel::factory()->create([
            'etablissement_id' => $school->id,
            'nom' => 'AKA',
            'prenoms' => 'Franck',
            'telephone' => '0700000000',
        ]);

        $payload = [
            'nom' => 'KOUASSI',
            'prenoms' => 'Jean',
            'sexe' => 'M',
            'date_naissance' => '1985-02-15',
            'lieu_naissance' => 'Abidjan',
            'nationalite' => 'Ivoirienne',
            'telephone' => '0712345678',
            'whatsapp' => null,
            'email' => 'jean.kouassi@example.test',
            'categorie' => Personnel::CATEGORIES['enseignant'],
            'type' => Personnel::TYPES['enseignant'],
            'poste' => null,
            'specialite' => 'Mathématiques',
            'diplome' => 'BAC',
            'est_certifie_mena' => true,
            'numero_badge_mena' => 'MENA-123',
            'date_embauche' => '2024-09-01',
            'type_contrat' => 'CDI',
            'salaire_base' => 150000,
            'statut' => 'actif',
            'classes_ids' => [],
            '_method' => 'PATCH',
        ];

        $this
            ->actingAs($user)
            ->post(route('personnel.update', $personnel), $payload)
            ->assertRedirect(route('personnel.index'));

        $this->assertDatabaseHas('personnel', [
            'id' => $personnel->id,
            'nom' => 'KOUASSI',
            'prenoms' => 'Jean',
            'telephone' => '0712345678',
            'specialite' => 'Mathématiques',
        ]);
    }
}
