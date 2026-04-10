<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnneeScolaireSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Création des deux années scolaires par établissement
            $annees = [
                [
                    'libelle' => '2023-2024',
                    'date_debut' => '2023-09-04',
                    'date_fin' => '2024-07-05',
                    'est_active' => false,
                    'statut' => 'cloturee',
                    'date_rentree_officielle' => '2023-09-04',
                    'nb_trimestres' => 3,
                ],
                [
                    'libelle' => '2024-2025',
                    'date_debut' => '2024-09-02',
                    'date_fin' => '2025-07-04',
                    'est_active' => true,
                    'statut' => 'en_cours',
                    'date_rentree_officielle' => '2024-09-02',
                    'nb_trimestres' => 3,
                ],
            ];

            Etablissement::query()->each(function (Etablissement $etablissement) use ($annees): void {
                AnneeScolaire::query()
                    ->where('etablissement_id', $etablissement->id)
                    ->update(['est_active' => false]);

                foreach ($annees as $annee) {
                    AnneeScolaire::query()->updateOrCreate(
                        [
                            'etablissement_id' => $etablissement->id,
                            'libelle' => $annee['libelle'],
                        ],
                        $annee,
                    );
                }
            });

            $this->command?->info('✓ Années scolaires créées pour chaque établissement.');
        });
    }
}
