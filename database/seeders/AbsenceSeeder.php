<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Inscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AbsenceSeeder extends Seeder
{
    /** @var array<int, string> */
    private const JOURS_FERIES_CI = [
        '2024-11-01', // Toussaint
        '2024-11-15', // Paix
        '2024-12-25', // Noël
        '2025-01-01', // Nouvel an
        '2025-03-31', // Fin Ramadan (approx.)
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            AnneeScolaire::query()->where('est_active', true)->each(function (AnneeScolaire $anneeActive): void {
                $inscriptionsParClasse = Inscription::query()
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->get()
                    ->groupBy('classe_id');

                foreach ($inscriptionsParClasse as $inscriptions) {
                    $selection = $inscriptions->shuffle()->take((int) ceil($inscriptions->count() * 0.30));

                    foreach ($selection as $inscription) {
                        $nbAbsences = random_int(1, 8);

                        foreach (range(1, $nbAbsences) as $index) {
                            $motif = fake()->randomElement([
                                ...array_fill(0, 50, 'maladie'),
                                ...array_fill(0, 35, 'sans_motif'),
                                ...array_fill(0, 15, 'autre'),
                            ]);

                            $dateAbsence = $this->dateValideAbsence();

                            DB::table('absences')->updateOrInsert(
                                [
                                    'inscription_id' => $inscription->id,
                                    'date_absence' => $dateAbsence,
                                    'type' => fake()->randomElement([
                                        ...array_fill(0, 60, 'journee'),
                                        ...array_fill(0, 25, 'matin'),
                                        ...array_fill(0, 15, 'apres_midi'),
                                    ]),
                                ],
                                [
                                    'motif' => $motif,
                                    'est_justifiee' => $motif === 'maladie' ? fake()->boolean(70) : false,
                                    'parent_notifie' => fake()->boolean(80),
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ]
                            );
                        }
                    }
                }

                $this->command?->info("✓ Absences réalistes générées pour {$anneeActive->etablissement->sigle}.");
            });
        });
    }

    private function dateValideAbsence(): string
    {
        do {
            $date = Carbon::parse(fake()->dateTimeBetween('2024-09-02', '2025-03-31')->format('Y-m-d'));
        } while ($date->isWeekend() || in_array($date->toDateString(), self::JOURS_FERIES_CI, true));

        return $date->toDateString();
    }
}
