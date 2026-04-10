<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            foreach (['super_admin', 'directeur', 'enseignant', 'caissier', 'secretaire', 'parent'] as $roleName) {
                Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            }

            $this->command?->info('✓ Rôles Spatie créés/actualisés.');
        });
    }
}
