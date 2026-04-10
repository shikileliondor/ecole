<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Etablissement;
use App\Models\Personnel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Personnel>
 */
class PersonnelFactory extends Factory
{
    protected $model = Personnel::class;

    /** @var array<int, string> */
    private const NOMS_IVOIRIENS = [
        'Koné', 'Coulibaly', 'Traoré', 'Diallo', 'Bamba', 'Ouattara', 'Yao', 'Koffi',
        "N'Guessan", 'Kouassi', 'Touré', 'Brou', 'Djè', 'Aka', 'Assi', 'Gnagne',
    ];

    /** @var array<int, string> */
    private const PRENOMS = [
        'Kouamé', 'Kofi', 'Yao', 'Koffi', 'Amenan', 'Amani', 'Sylvain', 'Franck',
        'Didier', 'Serge', 'Adjoua', 'Affoué', 'Aya', 'Bintou', 'Clarisse', 'Danielle', 'Estelle', 'Fatou',
    ];

    public function definition(): array
    {
        return [
            'etablissement_id' => Etablissement::query()->inRandomOrder()->value('id') ?? Etablissement::factory(),
            'nom' => fake()->randomElement(self::NOMS_IVOIRIENS),
            'prenoms' => fake()->randomElement(self::PRENOMS),
            'date_naissance' => fake()->dateTimeBetween('1970-01-01', '2000-12-31')->format('Y-m-d'),
            'lieu_naissance' => fake()->randomElement(['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'Korhogo']),
            'sexe' => fake()->randomElement(['M', 'F']),
            'nationalite' => 'Ivoirienne',
            'telephone' => '07' . fake()->numerify('########'),
            'whatsapp' => null,
            'email' => fake()->unique()->safeEmail(),
            'type' => 'enseignant',
            'diplome' => 'BAC',
            'est_certifie_mena' => fake()->boolean(),
            'date_embauche' => fake()->dateTimeBetween('2020-01-01', '2024-09-30')->format('Y-m-d'),
            'type_contrat' => fake()->randomElement(['CDI', 'CDD']),
            'salaire_base' => fake()->numberBetween(80000, 180000),
            'statut' => 'actif',
        ];
    }

    public function enseignant(): static
    {
        return $this->state(fn () => [
            'type' => 'enseignant',
            'diplome' => fake()->randomElement(['BAC', 'BTS']),
            'salaire_base' => fake()->numberBetween(80000, 180000),
        ]);
    }

    public function directeur(): static
    {
        return $this->state(fn () => [
            'type' => 'directeur',
            'diplome' => fake()->randomElement(['Licence', 'Master']),
            'est_certifie_mena' => true,
            'type_contrat' => 'CDI',
            'salaire_base' => fake()->numberBetween(250000, 350000),
        ]);
    }

    public function caissier(): static
    {
        return $this->state(fn () => [
            'type' => 'caissier',
            'diplome' => 'BTS',
            'type_contrat' => 'CDI',
            'salaire_base' => fake()->numberBetween(80000, 120000),
        ]);
    }
}
