<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compositions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('periode_academique_id')->constrained('periodes_academiques')->restrictOnDelete();
            $table->string('libelle', 120);
            $table->enum('type', ['simple', 'passage'])->default('simple');
            $table->unsignedSmallInteger('bareme')->default(20);
            $table->decimal('seuil_validation', 6, 2)->default(10);
            $table->enum('regle_moyenne', ['simple', 'ponderee_coefficient'])->default('ponderee_coefficient');
            $table->enum('mode_arrondi', ['unite_inferieure', 'unite_superieure', 'demi_point', 'dixieme_inferieur', 'dixieme_superieur'])->default('dixieme_superieur');
            $table->text('appreciations_auto')->nullable();
            $table->boolean('est_publie')->default(false);
            $table->timestamps();
        });

        Schema::create('composition_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('composition_id')->constrained('compositions')->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('matiere_id')->constrained()->restrictOnDelete();
            $table->decimal('moyenne', 6, 2);
            $table->timestamps();

            $table->unique(['composition_id', 'classe_id', 'matiere_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composition_notes');
        Schema::dropIfExists('compositions');
    }
};
