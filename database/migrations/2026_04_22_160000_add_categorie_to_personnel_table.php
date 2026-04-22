<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personnel', function (Blueprint $table): void {
            $table->string('categorie', 30)->default('personnel_ecole')->after('photo');
            $table->index('categorie');
        });

        DB::table('personnel')
            ->where('type', 'enseignant')
            ->update(['categorie' => 'enseignant']);

        DB::table('personnel')
            ->where('type', '!=', 'enseignant')
            ->update(['categorie' => 'personnel_ecole']);
    }

    public function down(): void
    {
        Schema::table('personnel', function (Blueprint $table): void {
            $table->dropIndex(['categorie']);
            $table->dropColumn('categorie');
        });
    }
};
