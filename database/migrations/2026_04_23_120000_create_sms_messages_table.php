<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('etablissement_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_phone_number', 20);
            $table->string('sender_name', 11);
            $table->text('message');
            $table->string('provider')->default('orange');
            $table->string('provider_message_id')->nullable()->index();
            $table->string('status_local', 20)->index();
            $table->string('error_code', 60)->nullable();
            $table->text('error_message')->nullable();
            $table->json('orange_response_raw')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_messages');
    }
};
