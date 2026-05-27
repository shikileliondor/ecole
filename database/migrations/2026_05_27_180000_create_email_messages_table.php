<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('etablissement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_tuteur_id')->nullable()->constrained('parents_tuteurs')->nullOnDelete();
            $table->foreignId('eleve_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_email');
            $table->string('subject', 180);
            $table->text('message');
            $table->string('status_local', 32)->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['etablissement_id', 'status_local']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_messages');
    }
};
