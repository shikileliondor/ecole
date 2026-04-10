<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Niveau;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NiveauSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            // Référentiel unique des niveaux du primaire ivoirien
            $niveaux = [
                ['libelle' => 'CP1', 'ordre' => 1, 'cycle' => 'CP'],
                ['libelle' => 'CP2', 'ordre' => 2, 'cycle' => 'CP'],
                ['libelle' => 'CE1', 'ordre' => 3, 'cycle' => 'CE'],
                ['libelle' => 'CE2', 'ordre' => 4, 'cycle' => 'CE'],
                ['libelle' => 'CM1', 'ordre' => 5, 'cycle' => 'CM'],
                ['libelle' => 'CM2', 'ordre' => 6, 'cycle' => 'CM'],
            ];

            foreach ($niveaux as $niveau) {
                Niveau::query()->updateOrCreate(['libelle' => $niveau['libelle']], $niveau);
            }

            $this->command?->info('✓ Niveaux du primaire seedés.');
        });
    }
}
