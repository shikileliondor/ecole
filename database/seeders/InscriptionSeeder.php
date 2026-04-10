<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Niveau;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InscriptionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $niveaux = Niveau::query()->orderBy('ordre')->get()->keyBy('libelle');

            AnneeScolaire::query()->where('est_active', true)->each(function (AnneeScolaire $anneeActive) use ($niveaux): void {
                $anneePrecedente = AnneeScolaire::query()
                    ->where('etablissement_id', $anneeActive->etablissement_id)
                    ->where('libelle', '2023-2024')
                    ->firstOrFail();

                $classesActives = Classe::query()
                    ->where('etablissement_id', $anneeActive->etablissement_id)
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->get()
                    ->groupBy(fn (Classe $classe) => $classe->niveau->libelle);

                $ordreParClasse = [];

                Eleve::query()
                    ->where('etablissement_id', $anneeActive->etablissement_id)
                    ->orderBy('id')
                    ->each(function (Eleve $eleve) use ($classesActives, &$ordreParClasse, $anneeActive, $anneePrecedente, $niveaux): void {
                        $niveauActuel = $this->deduireNiveauActuel($eleve);
                        $candidates = $classesActives[$niveauActuel] ?? collect();

                        $classe = $candidates->sortBy(fn (Classe $classe): int => $ordreParClasse[$classe->id] ?? 0)->first();
                        if (! $classe instanceof Classe) {
                            return;
                        }

                        $ordreParClasse[$classe->id] = ($ordreParClasse[$classe->id] ?? 0) + 1;

                        Inscription::query()->updateOrCreate(
                            ['eleve_id' => $eleve->id, 'annee_scolaire_id' => $anneeActive->id],
                            [
                                'classe_id' => $classe->id,
                                'date_inscription' => fake()->dateTimeBetween('2024-09-02', '2024-10-31')->format('Y-m-d'),
                                'type' => $niveauActuel === 'CP1' ? 'nouvelle_inscription' : 'reinscription',
                                'statut' => 'inscrit',
                                'numero_ordre' => $ordreParClasse[$classe->id],
                            ]
                        );

                        $niveauHistorique = $this->niveauInferieur($niveauActuel);
                        $classeHistorique = Classe::query()
                            ->where('etablissement_id', $anneeActive->etablissement_id)
                            ->where('annee_scolaire_id', $anneePrecedente->id)
                            ->where('niveau_id', $niveaux[$niveauHistorique]->id)
                            ->where('nom', 'like', "% {$this->suffixeClasse($classe->nom)}")
                            ->first();

                        if ($classeHistorique === null) {
                            $classeHistorique = $classesActives[$niveauHistorique]?->first();
                        }

                        if ($classeHistorique instanceof Classe) {
                            Inscription::query()->updateOrCreate(
                                ['eleve_id' => $eleve->id, 'annee_scolaire_id' => $anneePrecedente->id],
                                [
                                    'classe_id' => $classeHistorique->id,
                                    'date_inscription' => fake()->dateTimeBetween('2023-09-04', '2023-10-31')->format('Y-m-d'),
                                    'type' => 'reinscription',
                                    'statut' => 'inscrit',
                                    'numero_ordre' => null,
                                ]
                            );
                        }
                    });

                $this->command?->info("✓ Inscriptions actives + historiques créées pour {$anneeActive->etablissement->sigle}.");
            });
        });
    }

    private function deduireNiveauActuel(Eleve $eleve): string
    {
        $annee = (int) $eleve->date_naissance->format('Y');

        return match (true) {
            $annee >= 2018 => 'CP1',
            $annee === 2017 => 'CP2',
            $annee === 2016 => 'CE1',
            $annee === 2015 => 'CE2',
            $annee === 2014 => 'CM1',
            default => 'CM2',
        };
    }

    private function niveauInferieur(string $niveau): string
    {
        return match ($niveau) {
            'CP2' => 'CP1',
            'CE1' => 'CP2',
            'CE2' => 'CE1',
            'CM1' => 'CE2',
            'CM2' => 'CM1',
            default => 'CP1',
        };
    }

    private function suffixeClasse(string $nomClasse): string
    {
        return str_ends_with($nomClasse, 'B') ? 'B' : 'A';
    }
}
