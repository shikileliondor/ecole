<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parametre_audits', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('onglet', 60);
            $table->string('action', 80);
            $table->string('cible_type', 120)->nullable();
            $table->unsignedBigInteger('cible_id')->nullable();
            $table->json('avant')->nullable();
            $table->json('apres')->nullable();
            $table->text('justification')->nullable();
            $table->ipAddress('ip')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['etablissement_id', 'onglet']);
            $table->index(['cible_type', 'cible_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parametre_audits');
    }
};
