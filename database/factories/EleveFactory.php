<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\Etablissement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Eleve>
 */
class EleveFactory extends Factory
{
    protected $model = Eleve::class;

    /** @var array<int, string> */
    private const NOMS_IVOIRIENS = [
        'Koné', 'Coulibaly', 'Traoré', 'Diallo', 'Bamba', 'Ouattara', 'Yao', 'Koffi',
        "N'Guessan", 'Kouassi', 'Touré', 'Brou', 'Djè', 'Aka', 'Assi', 'Gnagne',
    ];

    /** @var array<int, string> */
    private const PRENOMS_MASCULINS = [
        'Kouamé', 'Kofi', 'Yao', 'Koffi', 'Amenan', 'Amani', 'Sylvain', 'Franck', 'Didier', 'Serge',
    ];

    /** @var array<int, string> */
    private const PRENOMS_FEMININS = [
        'Adjoua', 'Affoué', 'Amenan', 'Aya', 'Bintou', 'Clarisse', 'Danielle', 'Estelle', 'Fatou',
    ];

    /** @var array<int, string> */
    private const VILLES = [
        'Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'San-Pédro', 'Korhogo', 'Man', 'Gagnoa',
    ];

    public function definition(): array
    {
        $sexe = fake()->randomElement(['M', 'F']);
        $poolPrenoms = $sexe === 'M' ? self::PRENOMS_MASCULINS : self::PRENOMS_FEMININS;

        return [
            'etablissement_id' => Etablissement::query()->inRandomOrder()->value('id') ?? Etablissement::factory(),
            'nom' => fake()->randomElement(self::NOMS_IVOIRIENS),
            'prenoms' => fake()->randomElement($poolPrenoms) . (fake()->boolean(35) ? ' ' . fake()->randomElement($poolPrenoms) : ''),
            'date_naissance' => fake()->dateTimeBetween('2013-01-01', '2019-12-31')->format('Y-m-d'),
            'lieu_naissance' => fake()->randomElement(self::VILLES),
            'pays_naissance' => "Côte d'Ivoire",
            'sexe' => $sexe,
            'nationalite' => fake()->boolean(80) ? 'Ivoirienne' : fake()->randomElement(['Burkinabè', 'Mali', 'Sénégalaise', 'Guinéenne', 'Béninoise']),
            'situation_familiale' => fake()->randomElement(['parents_ensemble', 'divorces', 'orphelin_partiel', 'orphelin_total']),
            'est_boursier' => false,
            'statut' => 'actif',
        ];
    }

    public function masculin(): static
    {
        return $this->state(fn () => [
            'sexe' => 'M',
            'prenoms' => fake()->randomElement(self::PRENOMS_MASCULINS) . (fake()->boolean(35) ? ' ' . fake()->randomElement(self::PRENOMS_MASCULINS) : ''),
        ]);
    }

    public function feminin(): static
    {
        return $this->state(fn () => [
            'sexe' => 'F',
            'prenoms' => fake()->randomElement(self::PRENOMS_FEMININS) . (fake()->boolean(35) ? ' ' . fake()->randomElement(self::PRENOMS_FEMININS) : ''),
        ]);
    }

    public function boursier(): static
    {
        return $this->state(fn () => ['est_boursier' => true]);
    }

    public function actif(): static
    {
        return $this->state(fn () => ['statut' => 'actif']);
    }
}
