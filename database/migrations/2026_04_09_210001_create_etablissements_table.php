<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crée les établissements privés du primaire en Côte d'Ivoire (multi-établissements).
     */
    public function up(): void
    {
        Schema::create('etablissements', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('sigle')->nullable();
            $table->enum('type', ['prive_laic', 'prive_catholique', 'prive_protestant', 'prive_islamique']);
            $table->enum('cycle', ['primaire', 'maternel_primaire']);
            $table->string('agrement_mena')->nullable();
            $table->string('directeur_nom')->nullable();
            $table->string('localisation_ville');
            $table->string('localisation_commune')->nullable();
            $table->string('localisation_quartier')->nullable();
            $table->string('contact_telephone');
            $table->string('contact_whatsapp')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('logo')->nullable();
            $table->string('devise')->nullable();
            $table->year('annee_creation')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissements');
    }
};
