<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\ParentTuteur;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParentTuteurSeeder extends Seeder
{
    /** @var array<int, string> */
    private const PROFESSIONS = [
        'Commerçant', 'Fonctionnaire', 'Enseignant', 'Chauffeur', 'Infirmier',
        'Ingénieur', 'Technicien', 'Artisan', 'Vendeur', 'Agent de sécurité',
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            Eleve::query()->each(function (Eleve $eleve): void {
                $lienPrincipal = fake()->randomElement(['pere', 'mere']);
                $tel1 = $this->telephoneIvoirien();

                // Création du parent principal
                $principal = ParentTuteur::query()->create([
                    'nom' => fake()->randomElement(EleveFactoryNames::NOMS),
                    'prenoms' => fake()->randomElement(EleveFactoryNames::PRENOMS_MIXTES),
                    'lien' => $lienPrincipal,
                    'profession' => fake()->randomElement(self::PROFESSIONS),
                    'telephone_1' => $tel1,
                    'telephone_2' => fake()->boolean(60) ? $this->telephoneIvoirien() : null,
                    'whatsapp' => fake()->boolean(80) ? $tel1 : null,
                    'adresse_quartier' => fake()->randomElement(['Cocody', 'Yopougon', 'Abobo', 'Marcory', 'Adjamé', 'Koumassi', 'Port-Bouët', 'Riviera 1', 'Riviera 3', 'Angré', 'Deux Plateaux', 'Williamsville', 'Attécoubé']),
                    'est_contact_urgence' => true,
                    'est_payeur' => true,
                    'can_portal_access' => fake()->boolean(60),
                    'portal_login' => null,
                    'portal_password' => null,
                ]);

                if ($principal->can_portal_access) {
                    $principal->update([
                        'portal_login' => $principal->telephone_1,
                        'portal_password' => Hash::make('Parent@123'),
                    ]);

                    User::query()->updateOrCreate(
                        ['parent_id' => $principal->id],
                        [
                            'name' => trim($principal->prenoms . ' ' . $principal->nom),
                            'email' => sprintf('parent.%s@portal.ci', $principal->portal_login),
                            'password' => Hash::make('Parent@123'),
                            'etablissement_id' => $eleve->etablissement_id,
                            'type' => 'parent',
                            'statut' => 'actif',
                        ]
                    )->syncRoles(['parent']);
                }

                // Création du parent secondaire dans 70% des cas
                if (fake()->boolean(70)) {
                    ParentTuteur::query()->create([
                        'nom' => fake()->randomElement(EleveFactoryNames::NOMS),
                        'prenoms' => fake()->randomElement(EleveFactoryNames::PRENOMS_MIXTES),
                        'lien' => $lienPrincipal === 'pere' ? 'mere' : 'pere',
                        'profession' => fake()->randomElement(self::PROFESSIONS),
                        'telephone_1' => $this->telephoneIvoirien(),
                        'telephone_2' => fake()->boolean(40) ? $this->telephoneIvoirien() : null,
                        'whatsapp' => null,
                        'adresse_quartier' => fake()->randomElement(['Cocody', 'Yopougon', 'Abobo', 'Marcory', 'Adjamé', 'Koumassi', 'Port-Bouët']),
                        'est_contact_urgence' => false,
                        'est_payeur' => false,
                        'can_portal_access' => false,
                    ]);
                }
            });

            $this->command?->info('✓ Parents/tuteurs créés.');
        });
    }

    private function telephoneIvoirien(): string
    {
        return fake()->randomElement(['07', '05', '01']) . fake()->numerify('########');
    }
}

final class EleveFactoryNames
{
    /** @var array<int, string> */
    public const NOMS = [
        'Koné', 'Coulibaly', 'Traoré', 'Diallo', 'Bamba', 'Ouattara', 'Yao', 'Koffi',
        "N'Guessan", 'Kouassi', 'Touré', 'Brou', 'Djè', 'Aka', 'Assi', 'Gnagne',
    ];

    /** @var array<int, string> */
    public const PRENOMS_MIXTES = [
        'Kouamé', 'Kofi', 'Yao', 'Koffi', 'Amenan', 'Amani', 'Sylvain', 'Franck',
        'Didier', 'Serge', 'Adjoua', 'Affoué', 'Aya', 'Bintou', 'Clarisse', 'Danielle', 'Estelle', 'Fatou',
    ];
}
