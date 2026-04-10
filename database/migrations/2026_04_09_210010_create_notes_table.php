<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enregistre les notes et appréciations trimestrielles des élèves.
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('matiere_id')->constrained()->restrictOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained('annees_scolaires')->restrictOnDelete();
            $table->tinyInteger('trimestre')->index();
            $table->enum('type_note', ['composition', 'interrogation', 'devoir']);
            $table->decimal('note', 5, 2)->nullable();
            $table->enum('appreciation', ['TB', 'B', 'AB', 'Passable', 'Insuffisant'])->nullable();
            $table->smallInteger('rang_classe')->nullable();
            $table->foreignId('saisi_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_saisie')->nullable();
            $table->boolean('est_validee')->default(false);
            $table->timestamps();

            $table->unique(['inscription_id', 'matiere_id', 'trimestre', 'type_note']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
