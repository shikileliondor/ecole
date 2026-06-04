<?php

declare(strict_types=1);

namespace Tests\Feature\Parametres;

use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_create_user_and_assign_role(): void
    {
        $school = $this->createEtablissement('Ecole Gestion');
        $manager = $this->createManager($school);
        $teacherRole = Role::query()->create(['name' => 'enseignant', 'guard_name' => 'web']);

        $this->actingAs($manager)
            ->post(route('parametres.users.store'), [
                'name' => 'Kouadio Jean',
                'email' => 'kouadio.jean@example.test',
                'password' => 'motdepasse123',
                'password_confirmation' => 'motdepasse123',
                'type' => 'staff',
                'statut' => 'actif',
                'role' => $teacherRole->name,
            ])
            ->assertRedirect();

        $user = User::query()->where('email', 'kouadio.jean@example.test')->firstOrFail();

        $this->assertSame($school->id, $user->etablissement_id);
        $this->assertSame('staff', $user->type);
        $this->assertSame('actif', $user->statut);
        $this->assertTrue(Hash::check('motdepasse123', $user->password));
        $this->assertTrue($user->hasRole('enseignant'));
    }

    public function test_user_permission_sync_rejects_users_from_another_school(): void
    {
        $schoolA = $this->createEtablissement('Ecole A');
        $schoolB = $this->createEtablissement('Ecole B');
        $manager = $this->createManager($schoolA);
        $otherUser = User::factory()->create(['etablissement_id' => $schoolB->id]);

        Role::query()->create(['name' => 'enseignant', 'guard_name' => 'web']);

        $this->actingAs($manager)
            ->put(route('parametres.users.permissions.sync', $otherUser), [
                'role' => 'enseignant',
                'allows' => [],
                'denies' => [],
            ])
            ->assertForbidden();
    }

    private function createManager(Etablissement $school): User
    {
        $permission = Permission::query()->firstOrCreate([
            'name' => 'permissions.utilisateurs.gerer',
            'guard_name' => 'web',
        ]);

        $role = Role::query()->firstOrCreate(['name' => 'gestionnaire', 'guard_name' => 'web']);
        $role->givePermissionTo($permission);

        $manager = User::factory()->create(['etablissement_id' => $school->id]);
        $manager->assignRole($role);

        return $manager;
    }

    private function createEtablissement(string $nom): Etablissement
    {
        return Etablissement::query()->create([
            'nom' => $nom,
            'type' => 'prive_laic',
            'cycle' => 'primaire',
            'localisation_ville' => 'Abidjan',
            'contact_telephone' => '0102030405',
            'statut' => 'actif',
        ]);
    }
}
