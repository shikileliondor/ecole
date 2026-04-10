<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Etablissement;
use App\Models\TypeFrais;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeFraisSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Types de frais communs pour l'année active
            $types = [
                ['libelle' => "Frais d'inscription", 'montant' => 25000, 'frequence' => 'unique', 'est_obligatoire' => true, 'ordre' => 1],
                ['libelle' => 'Scolarité T1', 'montant' => 45000, 'frequence' => 'trimestriel', 'est_obligatoire' => true, 'ordre' => 2],
                ['libelle' => 'Scolarité T2', 'montant' => 45000, 'frequence' => 'trimestriel', 'est_obligatoire' => true, 'ordre' => 3],
                ['libelle' => 'Scolarité T3', 'montant' => 45000, 'frequence' => 'trimestriel', 'est_obligatoire' => true, 'ordre' => 4],
                ['libelle' => 'Assurance scolaire', 'montant' => 3000, 'frequence' => 'unique', 'est_obligatoire' => true, 'ordre' => 5],
                ['libelle' => 'Cantine', 'montant' => 20000, 'frequence' => 'trimestriel', 'est_obligatoire' => false, 'ordre' => 6],
                ['libelle' => 'Transport', 'montant' => 25000, 'frequence' => 'trimestriel', 'est_obligatoire' => false, 'ordre' => 7],
                ['libelle' => 'Tenue scolaire', 'montant' => 15000, 'frequence' => 'unique', 'est_obligatoire' => false, 'ordre' => 8],
            ];

            Etablissement::query()->each(function (Etablissement $etablissement) use ($types): void {
                $anneeActive = AnneeScolaire::query()
                    ->where('etablissement_id', $etablissement->id)
                    ->where('est_active', true)
                    ->firstOrFail();

                foreach ($types as $type) {
                    TypeFrais::query()->updateOrCreate(
                        [
                            'etablissement_id' => $etablissement->id,
                            'annee_scolaire_id' => $anneeActive->id,
                            'niveau_id' => null,
                            'libelle' => $type['libelle'],
                        ],
                        $type,
                    );
                }
            });

            $this->command?->info('✓ Types de frais créés pour les années actives.');
        });
    }
}
