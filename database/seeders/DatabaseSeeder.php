<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('✓ Seeder lancé: RolesAndPermissionsSeeder');
        $this->call(RolesAndPermissionsSeeder::class);

        $this->command?->info('✓ Seeder lancé: EtablissementSeeder');
        $this->call(EtablissementSeeder::class);

        $this->command?->info('✓ Seeder lancé: AnneeScolaireSeeder');
        $this->call(AnneeScolaireSeeder::class);

        $this->command?->info('✓ Seeder lancé: NiveauSeeder');
        $this->call(NiveauSeeder::class);

        $this->command?->info('✓ Seeder lancé: MatiereSeeder');
        $this->call(MatiereSeeder::class);

        $this->command?->info('✓ Seeder lancé: ClasseSeeder');
        $this->call(ClasseSeeder::class);

        $this->command?->info('✓ Seeder lancé: PersonnelSeeder');
        $this->call(PersonnelSeeder::class);

        $this->command?->info('✓ Seeder lancé: EleveSeeder');
        $this->call(EleveSeeder::class);

        $this->command?->info('✓ Seeder lancé: ParentTuteurSeeder');
        $this->call(ParentTuteurSeeder::class);

        $this->command?->info('✓ Seeder lancé: InscriptionSeeder');
        $this->call(InscriptionSeeder::class);

        $this->command?->info('✓ Seeder lancé: TypeFraisSeeder');
        $this->call(TypeFraisSeeder::class);

        $this->command?->info('✓ Seeder lancé: PaiementSeeder');
        $this->call(PaiementSeeder::class);

        $this->command?->info('✓ Seeder lancé: NoteSeeder');
        $this->call(NoteSeeder::class);

        $this->command?->info('✓ Seeder lancé: AbsenceSeeder');
        $this->call(AbsenceSeeder::class);

        $this->command?->info('✓ Seeder lancé: SalaireSeeder');
        $this->call(SalaireSeeder::class);
    }
}
