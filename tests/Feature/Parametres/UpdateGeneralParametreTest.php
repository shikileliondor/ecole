<?php

namespace Tests\Feature\Parametres;

use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateGeneralParametreTest extends TestCase
{
    use RefreshDatabase;

    public function test_general_settings_accept_optional_empty_fields(): void
    {
        $etablissement = Etablissement::query()->create([
            'nom' => 'Ecole Test',
            'sigle' => 'ET',
            'type' => 'prive_laic',
            'cycle' => 'primaire',
            'localisation_ville' => 'Abidjan',
            'contact_telephone' => '0102030405',
            'statut' => 'actif',
        ]);

        $user = User::factory()->create([
            'etablissement_id' => $etablissement->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->patch(route('parametres.general.update'), [
                'nom' => 'Groupe Scolaire La Lumière',
                'sigle' => '',
                'contact_email' => '',
                'contact_telephone' => '0727181234',
                'contact_whatsapp' => '',
                'site_web' => '',
                'localisation_ville' => 'Abidjan',
                'localisation_commune' => 'Cocody',
                'localisation_quartier' => 'Angré',
                'adresse' => '',
                'pays' => "Côte d'Ivoire",
                'code_postal' => '',
                'devise' => 'XOF',
                'langue_defaut' => 'fr',
                'fuseau_horaire' => 'Africa/Abidjan',
                'format_date' => 'DD/MM/YYYY',
                'directeur_nom' => 'Estelle COULIBALY',
                'agrement_mena' => '',
                'annee_creation' => '',
            ]);

        $response->assertSessionHasNoErrors();

        $etablissement->refresh();

        $this->assertSame('Groupe Scolaire La Lumière', $etablissement->nom);
        $this->assertSame('0727181234', $etablissement->contact_telephone);
        $this->assertNull($etablissement->contact_email);
        $this->assertNull($etablissement->site_web);
        $this->assertNull($etablissement->annee_creation);
    }
}
