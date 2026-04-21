<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('periodes_academiques', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('annee_scolaire_id')->constrained('annees_scolaires')->cascadeOnDelete();
            $table->string('libelle');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->unsignedSmallInteger('ordre')->default(1);
            $table->boolean('est_active')->default(false);
            $table->timestamps();

            $table->unique(['annee_scolaire_id', 'libelle']);
        });

        Schema::create('modes_paiement', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('libelle');
            $table->string('code')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->unsignedSmallInteger('ordre')->default(1);
            $table->timestamps();

            $table->unique(['etablissement_id', 'libelle']);
        });

        Schema::create('statuts_inscription', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('libelle');
            $table->string('code')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->unsignedSmallInteger('ordre')->default(1);
            $table->timestamps();

            $table->unique(['etablissement_id', 'libelle']);
        });

        Schema::create('modeles_impression', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('type_document');
            $table->string('nom');
            $table->text('description')->nullable();
            $table->text('template_html')->nullable();
            $table->boolean('est_defaut')->default(false);
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modeles_impression');
        Schema::dropIfExists('statuts_inscription');
        Schema::dropIfExists('modes_paiement');
        Schema::dropIfExists('periodes_academiques');
    }
};
