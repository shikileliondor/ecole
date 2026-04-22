<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel_classe_affectations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnel')->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['personnel_id', 'classe_id'], 'uniq_personnel_classe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel_classe_affectations');
    }
};
