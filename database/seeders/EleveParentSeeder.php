<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\ParentTuteur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EleveParentSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $parentsParEtablissement = ParentTuteur::query()
                ->orderBy('id')
                ->get()
                ->groupBy(function (ParentTuteur $parent): int {
                    $user = $parent->user;

                    return $user?->etablissement_id ?? 0;
                })
                ->map(fn ($parents) => $parents->values());

            $indexParEtablissement = [];

            Eleve::query()
                ->orderBy('id')
                ->each(function (Eleve $eleve) use ($parentsParEtablissement, &$indexParEtablissement): void {
                    $pool = $parentsParEtablissement[$eleve->etablissement_id] ?? collect();
                    if ($pool->isEmpty()) {
                        return;
                    }

                    $index = $indexParEtablissement[$eleve->etablissement_id] ?? 0;
                    $principal = $pool[$index % $pool->count()];

                    DB::table('eleve_parents')->updateOrInsert(
                        [
                            'eleve_id' => $eleve->id,
                            'parent_id' => $principal->id,
                        ],
                        [
                            'est_principal' => true,
                            'peut_recuperer' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    if (($index + 1) % 3 !== 0 && $pool->count() > 1) {
                        $secondaire = $pool[($index + 1) % $pool->count()];

                        DB::table('eleve_parents')->updateOrInsert(
                            [
                                'eleve_id' => $eleve->id,
                                'parent_id' => $secondaire->id,
                            ],
                            [
                                'est_principal' => false,
                                'peut_recuperer' => fake()->boolean(85),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }

                    $indexParEtablissement[$eleve->etablissement_id] = $index + 2;
                });

            $this->command?->info('✓ Liaisons élève-parent générées dans la table pivot eleve_parents.');
        });
    }
}
