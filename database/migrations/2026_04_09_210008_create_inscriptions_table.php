<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Suit les inscriptions/réinscriptions par année scolaire.
     */
    public function up(): void
    {
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained()->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained()->restrictOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained()->restrictOnDelete()->index();
            $table->date('date_inscription');
            $table->enum('type', ['nouvelle_inscription', 'reinscription']);
            $table->string('provenance_ecole')->nullable();
            $table->enum('statut', ['inscrit', 'transfere', 'abandonne'])->default('inscrit')->index();
            $table->smallInteger('numero_ordre')->nullable();
            $table->timestamps();

            $table->unique(['eleve_id', 'annee_scolaire_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
