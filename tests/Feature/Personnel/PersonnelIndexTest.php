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
}
