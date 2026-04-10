<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Inscription;
use App\Models\Matiere;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NoteSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $matieres = Matiere::query()->orderBy('ordre_bulletin')->get();

            AnneeScolaire::query()->where('est_active', true)->each(function (AnneeScolaire $anneeActive) use ($matieres): void {
                $inscriptions = Inscription::query()
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->with('classe')
                    ->get();

                foreach ($inscriptions as $inscription) {
                    foreach ([1, 2] as $trimestre) {
                        foreach ($matieres as $matiere) {
                            $note = $matiere->type_evaluation === 'note' ? $this->noteNormale() : null;

                            Note::query()->updateOrCreate(
                                [
                                    'inscription_id' => $inscription->id,
                                    'matiere_id' => $matiere->id,
                                    'trimestre' => $trimestre,
                                    'type_note' => 'composition',
                                ],
                                [
                                    'annee_scolaire_id' => $anneeActive->id,
                                    'note' => $note,
                                    'appreciation' => $this->appreciation($note, $matiere->type_evaluation),
                                    'est_validee' => $trimestre === 1,
                                    'date_saisie' => $trimestre === 1
                                        ? fake()->dateTimeBetween('2024-11-01', '2024-12-20')->format('Y-m-d H:i:s')
                                        : fake()->dateTimeBetween('2025-02-01', '2025-03-31')->format('Y-m-d H:i:s'),
                                ],
                            );
                        }
                    }
                }

                // Calcul des rangs par classe et par trimestre
                $classeIds = $inscriptions->pluck('classe_id')->unique();
                foreach ($classeIds as $classeId) {
                    Note::calculerRangs((int) $classeId, 1);
                    Note::calculerRangs((int) $classeId, 2);
                }

                $this->command?->info("✓ Notes T1/T2 et rangs calculés pour {$anneeActive->etablissement->sigle}.");
            });
        });
    }

    private function noteNormale(): float
    {
        $u = mt_rand() / mt_getrandmax();
        $v = mt_rand() / mt_getrandmax();
        $z = sqrt(-2 * log(max($u, 1e-6))) * cos(2 * M_PI * $v);

        return round(min(19.5, max(5, 12 + (2.8 * $z))), 2);
    }

    private function appreciation(?float $note, string $typeEvaluation): string
    {
        if ($typeEvaluation === 'appreciation') {
            return fake()->randomElement(['TB', 'B', 'AB', 'Passable']);
        }

        return match (true) {
            $note >= 16 => 'TB',
            $note >= 14 => 'B',
            $note >= 12 => 'AB',
            $note >= 10 => 'Passable',
            default => 'Insuffisant',
        };
    }
}
