<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catalogue des matières évaluées selon le programme MENA.
     */
    public function up(): void
    {
        Schema::create('matieres', function (Blueprint $table) {
            $table->id();
            $table->string('libelle');
            $table->string('code');
            $table->tinyInteger('coefficient')->default(1);
            $table->boolean('est_notee')->default(true);
            $table->enum('type_evaluation', ['note', 'appreciation'])->default('note');
            $table->tinyInteger('ordre_bulletin');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matieres');
    }
};
