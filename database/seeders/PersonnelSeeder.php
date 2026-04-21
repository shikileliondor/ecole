<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Etablissement;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PersonnelSeeder extends Seeder
{
    /** @var array<int, string> */
    private const NOMS_IVOIRIENS = [
        'Koné', 'Coulibaly', 'Traoré', 'Diallo', 'Bamba', 'Ouattara', 'Yao', 'Koffi',
        "N'Guessan", 'Kouassi', 'Touré', 'Brou', 'Djè', 'Aka', 'Assi', 'Gnagne',
    ];

    /** @var array<int, string> */
    private const PRENOMS = [
        'Kouamé', 'Kofi', 'Yao', 'Koffi', 'Amenan', 'Amani', 'Sylvain', 'Franck', 'Didier',
        'Serge', 'Adjoua', 'Affoué', 'Aya', 'Bintou', 'Clarisse', 'Danielle', 'Estelle', 'Fatou',
    ];

    /** @var array<int, string> */
    private const VILLES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'Korhogo'];

    private int $emailSequence = 0;

    public function run(): void
    {
        DB::transaction(function (): void {
            Etablissement::query()->each(function (Etablissement $etablissement): void {
                $anneeActive = AnneeScolaire::query()
                    ->where('etablissement_id', $etablissement->id)
                    ->where('est_active', true)
                    ->firstOrFail();

                $classes = Classe::query()
                    ->where('etablissement_id', $etablissement->id)
                    ->where('annee_scolaire_id', $anneeActive->id)
                    ->orderBy('id')
                    ->get();

                // Création du directeur
                $directeur = $this->creerPersonnelAvecUser($etablissement, [
                    'type' => 'directeur',
                    'diplome' => fake()->randomElement(['Licence', 'Master']),
                    'est_certifie_mena' => true,
                    'type_contrat' => 'CDI',
                    'salaire_base' => random_int(250000, 350000),
                ], 'directeur');

                // Création des 12 enseignants puis affectation aux classes
                $enseignants = collect();
                foreach ($classes as $classe) {
                    $enseignant = $this->creerPersonnelAvecUser($etablissement, [
                        'type' => 'enseignant',
                        'diplome' => fake()->randomElement(['BAC', 'BTS']),
                        'est_certifie_mena' => fake()->boolean(),
                        'type_contrat' => fake()->randomElement(['CDI', 'CDD']),
                        'salaire_base' => random_int(80000, 180000),
                    ], 'enseignant');

                    $classe->update(['enseignant_titulaire_id' => $enseignant->id]);
                    $enseignants->push($enseignant);
                }

                // Création du caissier
                $caissier = $this->creerPersonnelAvecUser($etablissement, [
                    'type' => 'caissier',
                    'diplome' => 'BTS',
                    'est_certifie_mena' => false,
                    'type_contrat' => 'CDI',
                    'salaire_base' => random_int(80000, 120000),
                ], 'caissier');

                // Création de la secrétaire
                $secretaire = $this->creerPersonnelAvecUser($etablissement, [
                    'type' => 'secretaire',
                    'diplome' => 'BTS',
                    'est_certifie_mena' => false,
                    'type_contrat' => 'CDI',
                    'salaire_base' => random_int(80000, 120000),
                ], 'secretaire');

                // Création de deux agents d'entretien
                foreach (range(1, 2) as $index) {
                    $this->creerPersonnelAvecUser($etablissement, [
                        'type' => 'agent_entretien',
                        'diplome' => null,
                        'est_certifie_mena' => false,
                        'type_contrat' => 'CDD',
                        'salaire_base' => random_int(40000, 60000),
                    ], null, 'agent' . $index);
                }

                $etablissement->update(['directeur_nom' => $directeur->nom_complet]);

                if ($etablissement->sigle === 'GSL') {
                    $this->creerCompteConnexionGsl($etablissement);
                }

                $this->command?->info("✓ Personnel seedé pour {$etablissement->sigle} ({$enseignants->count()} enseignants + admin).");

                unset($caissier, $secretaire);
            });
        });
    }

    private function creerPersonnelAvecUser(Etablissement $etablissement, array $overrides, ?string $role, ?string $emailSuffix = null): Personnel
    {
        $prenom = fake()->randomElement(self::PRENOMS);
        $nom = fake()->randomElement(self::NOMS_IVOIRIENS);
        $telephone = $this->telephoneIvoirien();

        $personnel = Personnel::factory()->create(array_merge([
            'etablissement_id' => $etablissement->id,
            'nom' => $nom,
            'prenoms' => $prenom,
            'date_naissance' => fake()->dateTimeBetween('1970-01-01', '2000-12-31')->format('Y-m-d'),
            'lieu_naissance' => fake()->randomElement(self::VILLES),
            'sexe' => fake()->randomElement(['M', 'F']),
            'telephone' => $telephone,
            'whatsapp' => fake()->boolean(80) ? $telephone : null,
            'email' => null,
            'date_embauche' => fake()->dateTimeBetween('2020-01-01', '2024-09-30')->format('Y-m-d'),
            'statut' => 'actif',
        ], $overrides));

        $slugPrenom = strtolower(str_replace([' ', "'", 'é', 'è'], ['', '', 'e', 'e'], $prenom));
        $slugNom = strtolower(str_replace([' ', "'", 'é', 'è'], ['', '', 'e', 'e'], $nom));
        $this->emailSequence++;
        $email = sprintf(
            '%s.%s%s.%d@%s.ci',
            $slugPrenom,
            $slugNom,
            $emailSuffix ? ".{$emailSuffix}" : '',
            $this->emailSequence,
            strtolower($etablissement->sigle)
        );

        $user = User::query()->create([
            'name' => trim($prenom . ' ' . $nom),
            'email' => $email,
            'password' => Hash::make('Password@123'),
            'etablissement_id' => $etablissement->id,
            'personnel_id' => null,
            'type' => 'staff',
            'statut' => 'actif',
        ]);

        $personnel->update([
            'user_id' => $user->id,
            'email' => $email,
        ]);

        $user->update(['personnel_id' => $personnel->id]);

        if ($role !== null) {
            $user->syncRoles([$role]);
        }

        return $personnel;
    }

    private function telephoneIvoirien(): string
    {
        $prefixe = fake()->randomElement(['07', '05', '01']);

        return $prefixe . fake()->numerify('########');
    }

    private function creerCompteConnexionGsl(Etablissement $etablissement): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'kouame.aka.2@gsl.ci'],
            [
                'name' => 'Kouame Aka',
                'password' => Hash::make('admin123'),
                'etablissement_id' => $etablissement->id,
                'type' => 'staff',
                'statut' => 'actif',
            ]
        );

        $user->syncRoles(['super_admin']);
    }
}
