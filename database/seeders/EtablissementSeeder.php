<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Etablissement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtablissementSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Création des établissements de démonstration ivoiriens
            $etablissements = [
                [
                    'nom' => 'Groupe Scolaire La Lumière',
                    'sigle' => 'GSL',
                    'type' => 'prive_catholique',
                    'cycle' => 'primaire',
                    'localisation_ville' => 'Abidjan',
                    'localisation_commune' => 'Cocody',
                    'localisation_quartier' => 'Angré',
                    'contact_telephone' => '0727181234',
                    'statut' => 'actif',
                    'devise' => "L'excellence avant tout",
                ],
                [
                    'nom' => 'École Primaire Les Étoiles',
                    'sigle' => 'EPE',
                    'type' => 'prive_laic',
                    'cycle' => 'primaire',
                    'localisation_ville' => 'Abidjan',
                    'localisation_commune' => 'Yopougon',
                    'localisation_quartier' => 'Selmer',
                    'contact_telephone' => '0707654321',
                    'statut' => 'actif',
                    'devise' => 'Savoir, Partager, Réussir',
                ],
                [
                    'nom' => 'Institut Scolaire Al Iman',
                    'sigle' => 'ISA',
                    'type' => 'prive_islamique',
                    'cycle' => 'primaire',
                    'localisation_ville' => 'Abidjan',
                    'localisation_commune' => 'Abobo',
                    'localisation_quartier' => 'Nouveau Quartier',
                    'contact_telephone' => '0101234567',
                    'statut' => 'actif',
                    'devise' => 'La connaissance est une lumière',
                ],
            ];

            foreach ($etablissements as $payload) {
                Etablissement::query()->updateOrCreate(['sigle' => $payload['sigle']], $payload);
            }

            $this->command?->info('✓ Établissements ivoiriens seedés.');
        });
    }
}
