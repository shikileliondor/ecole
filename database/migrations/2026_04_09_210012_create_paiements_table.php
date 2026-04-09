<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Historise les paiements de frais scolaires en FCFA et modes Mobile Money.
     */
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('type_frais_id')->constrained('types_frais')->restrictOnDelete();
            $table->unsignedInteger('montant_attendu');
            $table->unsignedInteger('montant_paye');
            $table->unsignedInteger('montant_restant');
            $table->enum('mode_paiement', ['especes', 'orange_money', 'wave', 'mtn_momo', 'moov_money', 'cheque', 'virement']);
            $table->string('reference_transaction')->nullable();
            $table->date('date_paiement')->index();
            $table->string('recu_numero')->unique();
            $table->foreignId('encaisse_par')->nullable()->constrained('users')->nullOnDelete();
            $table->tinyInteger('trimestre')->nullable()->index();
            $table->enum('statut', ['paye', 'partiel', 'impaye'])->default('impaye')->index();
            $table->text('note_caissier')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
