<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('types_frais', function (Blueprint $table) {
            $table->foreignId('classe_id')->nullable()->after('niveau_id')->constrained('classes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('types_frais', function (Blueprint $table) {
            $table->dropConstrainedForeignId('classe_id');
        });
    }
};
