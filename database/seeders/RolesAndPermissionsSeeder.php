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

            $permissionNames = array_keys(config('ecole_permissions.permissions', []));

            foreach ($permissionNames as $permissionName) {
                Permission::query()->firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
            }

            $roles = [];
            foreach (array_keys(config('ecole_permissions.role_defaults', [])) as $roleName) {
                $roles[$roleName] = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            }

            foreach (config('ecole_permissions.role_defaults', []) as $roleName => $defaultPermissions) {
                $roles[$roleName]->syncPermissions(
                    in_array('*', $defaultPermissions, true) ? $permissionNames : $defaultPermissions
                );
            }

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
