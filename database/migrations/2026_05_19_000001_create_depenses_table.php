<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('libelle');
            $table->string('categorie')->nullable();
            $table->unsignedInteger('montant');
            $table->date('date_depense')->index();
            $table->foreignId('responsable_id')->nullable()->constrained('personnel')->nullOnDelete();
            $table->string('mode_paiement')->nullable();
            $table->string('justificatif_path')->nullable();
            $table->text('observation')->nullable();
            $table->enum('statut', ['active', 'annulee'])->default('active')->index();
            $table->text('motif_annulation')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depenses');
    }
};
