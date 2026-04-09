<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enregistre les parents/tuteurs légaux et leurs accès portail.
     */
    public function up(): void
    {
        Schema::create('parents_tuteurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenoms');
            $table->enum('lien', ['pere', 'mere', 'tuteur', 'grand_parent', 'oncle_tante']);
            $table->string('profession')->nullable();
            $table->string('telephone_1');
            $table->string('telephone_2')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('adresse_quartier')->nullable();
            $table->boolean('est_contact_urgence')->default(false);
            $table->boolean('est_payeur')->default(false);
            $table->boolean('can_portal_access')->default(false);
            $table->string('portal_login')->nullable()->unique();
            $table->string('portal_password')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parents_tuteurs');
    }
};
