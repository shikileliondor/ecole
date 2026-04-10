<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Personnel;
use App\Models\Salaire;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SalaireSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            AnneeScolaire::query()->where('est_active', true)->each(function (AnneeScolaire $anneeActive): void {
                $personnels = Personnel::query()
                    ->where('etablissement_id', $anneeActive->etablissement_id)
                    ->where('statut', 'actif')
                    ->get();

                foreach ($personnels as $personnel) {
                    foreach ([9, 10, 11, 12, 1, 2] as $mois) {
                        $statut = $mois === 2 ? 'en_attente' : 'paye';
                        $primes = fake()->boolean(20) ? random_int(10000, 25000) : 0;
                        $deductions = fake()->boolean(10) ? random_int(5000, 15000) : 0;

                        Salaire::query()->updateOrCreate(
                            [
                                'personnel_id' => $personnel->id,
                                'annee_scolaire_id' => $anneeActive->id,
                                'mois' => $mois,
                            ],
                            [
                                'salaire_base' => $personnel->salaire_base,
                                'primes' => $primes,
                                'deductions' => $deductions,
                                'mode_paiement' => fake()->randomElement([
                                    ...array_fill(0, 60, 'especes'),
                                    ...array_fill(0, 30, 'orange_money'),
                                    ...array_fill(0, 10, 'virement'),
                                ]),
                                'statut' => $statut,
                                'date_paiement' => $statut === 'paye'
                                    ? Carbon::create($mois <= 2 ? 2025 : 2024, $mois, 1)->endOfMonth()->toDateString()
                                    : null,
                                'valide_par' => null,
                            ],
                        );
                    }
                }

                $this->command?->info("✓ Salaires septembre 2024 → février 2025 générés pour {$anneeActive->etablissement->sigle}.");
            });
        });
    }
}
