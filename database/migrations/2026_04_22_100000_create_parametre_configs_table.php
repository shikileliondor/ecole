<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parametre_configs', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('onglet', 60);
            $table->json('donnees')->nullable();
            $table->timestamps();

            $table->unique(['etablissement_id', 'onglet']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parametre_configs');
    }
};
