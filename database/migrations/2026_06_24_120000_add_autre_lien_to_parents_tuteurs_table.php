<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('parents_tuteurs', 'lien_precision')) {
            Schema::table('parents_tuteurs', function (Blueprint $table): void {
                $table->string('lien_precision')->nullable()->after('lien');
            });
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE parents_tuteurs MODIFY lien ENUM('pere','mere','tuteur','grand_parent','oncle_tante','autre') NOT NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::table('parents_tuteurs')->where('lien', 'autre')->update(['lien' => 'tuteur']);
            DB::statement("ALTER TABLE parents_tuteurs MODIFY lien ENUM('pere','mere','tuteur','grand_parent','oncle_tante') NOT NULL");
        }

        Schema::table('parents_tuteurs', function (Blueprint $table): void {
            $table->dropColumn('lien_precision');
        });
    }
};
