<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Niveau;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Création des classes A/B pour chaque année scolaire de chaque établissement
            $niveaux = Niveau::query()->orderBy('ordre')->get();

            Etablissement::query()->each(function (Etablissement $etablissement) use ($niveaux): void {
                $annees = AnneeScolaire::query()
                    ->where('etablissement_id', $etablissement->id)
                    ->orderBy('date_debut')
                    ->get();

                $compteurSalle = 1;

                foreach ($annees as $anneeScolaire) {
                    foreach ($niveaux as $niveau) {
                        foreach (['A', 'B'] as $suffixe) {
                            Classe::query()->updateOrCreate(
                                [
                                    'etablissement_id' => $etablissement->id,
                                    'annee_scolaire_id' => $anneeScolaire->id,
                                    'niveau_id' => $niveau->id,
                                    'nom' => "{$niveau->libelle} {$suffixe}",
                                ],
                                [
                                    'capacite_max' => random_int(35, 45),
                                    'salle' => 'Salle ' . $compteurSalle,
                                    'enseignant_titulaire_id' => null,
                                    'statut' => 'active',
                                ],
                            );

                            $compteurSalle++;
                        }
                    }
                }
            });

            $this->command?->info('✓ Classes (A/B) créées pour chaque année scolaire.');
        });
    }
}
