<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gère le personnel administratif et enseignant de chaque établissement.
     */
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('matricule_interne')->nullable();
            $table->string('nom');
            $table->string('prenoms');
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->enum('sexe', ['M', 'F']);
            $table->string('nationalite')->default('Ivoirienne');
            $table->string('telephone');
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('photo')->nullable();
            $table->enum('type', ['enseignant', 'directeur', 'caissier', 'secretaire', 'agent_entretien', 'surveillant']);
            $table->enum('diplome', ['BEPC', 'BAC', 'BTS', 'Licence', 'Master'])->nullable();
            $table->boolean('est_certifie_mena')->default(false);
            $table->string('numero_badge_mena')->nullable();
            $table->date('date_embauche');
            $table->enum('type_contrat', ['CDI', 'CDD', 'vacataire']);
            $table->unsignedInteger('salaire_base');
            $table->enum('statut', ['actif', 'suspendu', 'parti'])->default('actif')->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->foreign('enseignant_titulaire_id')
                ->references('id')
                ->on('personnel')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['enseignant_titulaire_id']);
        });

        Schema::dropIfExists('personnel');
    }
};
