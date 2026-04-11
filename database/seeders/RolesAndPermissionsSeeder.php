<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            $permissions = [
                'eleves.voir',
                'eleves.creer',
                'eleves.modifier',
                'eleves.supprimer',
            ];

            foreach ($permissions as $permissionName) {
                Permission::query()->firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
            }

            $roles = [];
            foreach (['super_admin', 'directeur', 'enseignant', 'caissier', 'secretaire', 'parent'] as $roleName) {
                $roles[$roleName] = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            }

            $roles['super_admin']->syncPermissions($permissions);
            $roles['directeur']->syncPermissions(['eleves.voir', 'eleves.creer', 'eleves.modifier']);
            $roles['secretaire']->syncPermissions(['eleves.voir', 'eleves.creer']);
            $roles['enseignant']->syncPermissions(['eleves.voir']);
            $roles['caissier']->syncPermissions(['eleves.voir']);
            $roles['parent']->syncPermissions([]);

            $superAdmin = User::query()->updateOrCreate(
                ['email' => 'morelyann@10gmail.com'],
                [
                    'name' => 'Super Admin',
                    'password' => Hash::make('super123'),
                    'type' => 'staff',
                    'statut' => 'actif',
                ]
            );
            $superAdmin->syncRoles(['super_admin']);

            $this->command?->info('✓ Rôles Spatie créés/actualisés.');
            $this->command?->info('✓ Permissions Spatie créées/actualisées et associées aux rôles.');
            $this->command?->info('✓ Super admin créé/mis à jour: morelyann@10gmail.com');
        });
    }
}
