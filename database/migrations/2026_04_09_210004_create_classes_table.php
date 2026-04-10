<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Organise les classes par établissement, année scolaire et niveau.
     */
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained()->cascadeOnDelete();
            $table->foreignId('niveau_id')->constrained()->restrictOnDelete();
            $table->string('nom');
            $table->tinyInteger('capacite_max')->default(40);
            $table->string('salle')->nullable();
            $table->foreignId('enseignant_titulaire_id')->nullable()->index();
            $table->enum('statut', ['active', 'inactive'])->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
