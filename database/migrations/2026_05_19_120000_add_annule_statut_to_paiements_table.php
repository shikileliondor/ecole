<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE paiements MODIFY statut ENUM('paye','partiel','impaye','annule') NOT NULL DEFAULT 'impaye'");
    }

    public function down(): void
    {
        DB::statement("UPDATE paiements SET statut = 'impaye' WHERE statut = 'annule'");

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE paiements MODIFY statut ENUM('paye','partiel','impaye') NOT NULL DEFAULT 'impaye'");
    }
};
