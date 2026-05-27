<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personnel', function (Blueprint $table): void {
            $table->string('poste', 150)->nullable()->after('type');
            $table->string('specialite', 150)->nullable()->after('poste');
            $table->string('whatsapp', 40)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('personnel', function (Blueprint $table): void {
            $table->dropColumn(['poste', 'specialite']);
        });
    }
};
