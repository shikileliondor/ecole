<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Étend les utilisateurs Breeze pour staff et parents dans un contexte multi-établissements.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('etablissement_id')->nullable()->after('id')->constrained()->nullOnDelete()->index();
            $table->foreignId('personnel_id')->nullable()->after('etablissement_id')->constrained('personnel')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->after('personnel_id')->constrained('parents_tuteurs')->nullOnDelete();
            $table->enum('type', ['staff', 'parent'])->default('staff')->after('password');
            $table->timestamp('dernier_connexion')->nullable()->after('remember_token');
            $table->enum('statut', ['actif', 'bloque'])->default('actif')->after('dernier_connexion')->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['etablissement_id']);
            $table->dropForeign(['personnel_id']);
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'etablissement_id',
                'personnel_id',
                'parent_id',
                'type',
                'dernier_connexion',
                'statut',
            ]);
        });
    }
};
