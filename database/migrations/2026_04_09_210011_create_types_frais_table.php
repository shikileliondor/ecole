<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Définit la grille tarifaire des frais scolaires en FCFA.
     */
    public function up(): void
    {
        Schema::create('types_frais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete()->index();
            $table->foreignId('annee_scolaire_id')->constrained()->cascadeOnDelete()->index();
            $table->foreignId('niveau_id')->nullable()->constrained()->nullOnDelete();
            $table->string('libelle');
            $table->unsignedInteger('montant');
            $table->boolean('est_obligatoire')->default(true);
            $table->enum('frequence', ['unique', 'trimestriel', 'mensuel']);
            $table->tinyInteger('ordre')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('types_frais');
    }
};
