<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Suit le paiement mensuel des salaires du personnel en FCFA.
     */
    public function up(): void
    {
        Schema::create('salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnel')->cascadeOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained()->restrictOnDelete()->index();
            $table->tinyInteger('mois');
            $table->unsignedInteger('salaire_base');
            $table->unsignedInteger('primes')->default(0);
            $table->unsignedInteger('deductions')->default(0);
            $table->unsignedInteger('net_a_payer');
            $table->enum('mode_paiement', ['especes', 'virement', 'orange_money', 'wave', 'mtn_momo']);
            $table->date('date_paiement')->nullable()->index();
            $table->enum('statut', ['paye', 'en_attente'])->default('en_attente')->index();
            $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['personnel_id', 'annee_scolaire_id', 'mois']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salaires');
    }
};
