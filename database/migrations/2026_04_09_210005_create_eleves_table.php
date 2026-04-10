<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stocke le dossier administratif des élèves du primaire privé.
     */
    public function up(): void
    {
        Schema::create('eleves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenoms');
            $table->date('date_naissance');
            $table->string('lieu_naissance');
            $table->string('pays_naissance')->default("Côte d'Ivoire");
            $table->enum('sexe', ['M', 'F']);
            $table->string('nationalite')->default('Ivoirienne');
            $table->string('langue_maternelle')->nullable();
            $table->enum('situation_familiale', ['parents_ensemble', 'divorces', 'orphelin_partiel', 'orphelin_total'])->nullable();
            $table->boolean('est_boursier')->default(false);
            $table->string('photo')->nullable();
            $table->string('extrait_naissance_numero')->nullable();
            $table->enum('statut', ['actif', 'transfere', 'exclu', 'sorti'])->default('actif')->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};
