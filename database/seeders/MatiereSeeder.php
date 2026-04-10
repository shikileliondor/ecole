<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Matiere;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Matières du programme officiel MENA Côte d'Ivoire
            $matieres = [
                ['libelle' => 'Lecture', 'code' => 'LEC', 'coefficient' => 3, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 1],
                ['libelle' => 'Écriture', 'code' => 'ECR', 'coefficient' => 2, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 2],
                ['libelle' => 'Mathématiques', 'code' => 'MATH', 'coefficient' => 3, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 3],
                ['libelle' => "Sciences d'Éveil", 'code' => 'SCI', 'coefficient' => 2, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 4],
                ['libelle' => 'Langue Vivante 1', 'code' => 'LV1', 'coefficient' => 2, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 5],
                ['libelle' => 'EPS', 'code' => 'EPS', 'coefficient' => 1, 'est_notee' => false, 'type_evaluation' => 'appreciation', 'ordre_bulletin' => 6],
                ['libelle' => 'Dessin & Travaux Manuels', 'code' => 'DTM', 'coefficient' => 1, 'est_notee' => true, 'type_evaluation' => 'note', 'ordre_bulletin' => 7],
            ];

            foreach ($matieres as $matiere) {
                Matiere::query()->updateOrCreate(['code' => $matiere['code']], $matiere);
            }

            $this->command?->info('✓ Matières MENA CI créées.');
        });
    }
}
