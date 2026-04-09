<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table pivot liant élèves et responsables légaux.
     */
    public function up(): void
    {
        Schema::create('eleve_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->constrained('parents_tuteurs')->cascadeOnDelete();
            $table->boolean('est_principal')->default(false);
            $table->boolean('peut_recuperer')->default(true);
            $table->timestamps();

            $table->unique(['eleve_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleve_parents');
    }
};
