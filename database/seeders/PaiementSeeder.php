<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Inscription;
use App\Models\Paiement;
use App\Models\TypeFrais;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaiementSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            AnneeScolaire::query()->where('est_active', true)->each(function (AnneeScolaire $anneeActive): void {
                $typesFrais = TypeFrais::query()
                    ->where('etablissement_id', $anneeActive->etablissement_id)
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->whereIn('libelle', ["Frais d'inscription", 'Scolarité T1', 'Scolarité T2', 'Scolarité T3'])
                    ->get()
                    ->keyBy('libelle');

                Inscription::query()
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->orderBy('id')
                    ->each(function (Inscription $inscription) use ($typesFrais): void {
                        $scenario = fake()->randomElement([
                            ...array_fill(0, 40, 'tout_paye'),
                            ...array_fill(0, 30, 'jusqua_t2'),
                            ...array_fill(0, 20, 'jusqua_t1'),
                            ...array_fill(0, 10, 'inscription_seule'),
                        ]);

                        $toPay = ["Frais d'inscription"];
                        if (in_array($scenario, ['tout_paye', 'jusqua_t2', 'jusqua_t1'], true)) {
                            $toPay[] = 'Scolarité T1';
                        }
                        if (in_array($scenario, ['tout_paye', 'jusqua_t2'], true)) {
                            $toPay[] = 'Scolarité T2';
                        }
                        if ($scenario === 'tout_paye') {
                            $toPay[] = 'Scolarité T3';
                        }

                        foreach ($toPay as $libelleFrais) {
                            $typeFrais = $typesFrais->get($libelleFrais);
                            if (! $typeFrais instanceof TypeFrais) {
                                continue;
                            }

                            $mode = fake()->randomElement([
                                ...array_fill(0, 40, 'especes'),
                                ...array_fill(0, 30, 'orange_money'),
                                ...array_fill(0, 20, 'wave'),
                                ...array_fill(0, 7, 'mtn_momo'),
                                ...array_fill(0, 3, 'moov_money'),
                            ]);

                            $attendu = (int) $typeFrais->montant;
                            $paye = fake()->boolean(20)
                                ? (int) round($attendu * (fake()->numberBetween(50, 80) / 100))
                                : $attendu;

                            Paiement::query()->create([
                                'inscription_id' => $inscription->id,
                                'type_frais_id' => $typeFrais->id,
                                'montant_attendu' => $attendu,
                                'montant_paye' => $paye,
                                'mode_paiement' => $mode,
                                'reference_transaction' => $this->referenceTransaction($mode),
                                'date_paiement' => $this->datePaiementSelonTrimestre($libelleFrais),
                                'trimestre' => $this->trimestreDepuisLibelle($libelleFrais),
                            ]);
                        }
                    });

                $this->command?->info("✓ Paiements réalistes générés pour {$anneeActive->etablissement->sigle}.");
            });
        });
    }

    private function trimestreDepuisLibelle(string $libelleFrais): ?int
    {
        return match ($libelleFrais) {
            'Scolarité T1' => 1,
            'Scolarité T2' => 2,
            'Scolarité T3' => 3,
            default => null,
        };
    }

    private function datePaiementSelonTrimestre(string $libelleFrais): string
    {
        return match ($libelleFrais) {
            'Scolarité T1' => fake()->dateTimeBetween('2024-09-01', '2024-11-30')->format('Y-m-d'),
            'Scolarité T2' => fake()->dateTimeBetween('2025-01-01', '2025-03-31')->format('Y-m-d'),
            'Scolarité T3' => fake()->dateTimeBetween('2025-04-01', '2025-06-30')->format('Y-m-d'),
            default => fake()->dateTimeBetween('2024-09-01', '2024-10-31')->format('Y-m-d'),
        };
    }

    private function referenceTransaction(string $mode): ?string
    {
        return match ($mode) {
            'orange_money' => 'OM' . fake()->numerify('########'),
            'wave' => 'WV' . fake()->numerify('########'),
            'mtn_momo' => 'MTN' . fake()->numerify('#######'),
            'moov_money' => 'MV' . fake()->numerify('########'),
            default => null,
        };
    }
}
