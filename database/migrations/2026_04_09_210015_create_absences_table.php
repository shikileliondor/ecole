<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gère les absences et justifications des élèves inscrits.
     */
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->date('date_absence')->index();
            $table->enum('type', ['matin', 'apres_midi', 'journee']);
            $table->enum('motif', ['maladie', 'sans_motif', 'deces_famille', 'autre']);
            $table->boolean('est_justifiee')->default(false);
            $table->string('justificatif')->nullable();
            $table->foreignId('signale_par')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('parent_notifie')->default(false);
            $table->timestamps();

            $table->unique(['inscription_id', 'date_absence', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
