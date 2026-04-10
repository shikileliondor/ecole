<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\Etablissement;
use App\Models\Niveau;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EleveSeeder extends Seeder
{
    /** @var array<string, array{string, string}> */
    private const PLAGES_NAISSANCE = [
        'CP1' => ['2018-01-01', '2019-12-31'],
        'CP2' => ['2017-01-01', '2018-12-31'],
        'CE1' => ['2016-01-01', '2017-12-31'],
        'CE2' => ['2015-01-01', '2016-12-31'],
        'CM1' => ['2014-01-01', '2015-12-31'],
        'CM2' => ['2013-01-01', '2014-12-31'],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            $niveaux = Niveau::query()->orderBy('ordre')->get();

            Etablissement::query()->each(function (Etablissement $etablissement) use ($niveaux): void {
                foreach ($niveaux as $niveau) {
                    [$debut, $fin] = self::PLAGES_NAISSANCE[$niveau->libelle];

                    foreach (range(1, 30) as $index) {
                        $sexe = $index % 2 === 0 ? 'M' : 'F';
                        $factory = $sexe === 'M' ? Eleve::factory()->masculin() : Eleve::factory()->feminin();
                        if (fake()->boolean(10)) {
                            $factory = $factory->boursier();
                        }

                        $factory->actif()->create([
                            'etablissement_id' => $etablissement->id,
                            'date_naissance' => fake()->dateTimeBetween($debut, $fin)->format('Y-m-d'),
                            'lieu_naissance' => fake()->randomElement(['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'Korhogo', 'San-Pédro']),
                            'nationalite' => fake()->boolean(80) ? 'Ivoirienne' : fake()->randomElement(['Burkinabè', 'Mali', 'Sénégalaise', 'Guinéenne', 'Béninoise']),
                            'situation_familiale' => fake()->randomElement([
                                ...array_fill(0, 60, 'parents_ensemble'),
                                ...array_fill(0, 20, 'divorces'),
                                ...array_fill(0, 15, 'orphelin_partiel'),
                                ...array_fill(0, 5, 'orphelin_total'),
                            ]),
                        ]);
                    }
                }

                $this->command?->info("✓ 180 élèves créés pour {$etablissement->sigle}.");
            });
        });
    }
}
