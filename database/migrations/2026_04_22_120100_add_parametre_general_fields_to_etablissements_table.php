<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('etablissements', static function (Blueprint $table): void {
            $table->string('logo_pdf')->nullable()->after('logo');
            $table->string('site_web')->nullable()->after('contact_email');
            $table->string('adresse')->nullable()->after('localisation_quartier');
            $table->string('pays')->nullable()->after('adresse');
            $table->string('code_postal')->nullable()->after('pays');
            $table->string('langue_defaut', 10)->nullable()->after('devise');
            $table->string('fuseau_horaire', 60)->nullable()->after('langue_defaut');
            $table->string('format_date', 30)->nullable()->after('fuseau_horaire');
        });
    }

    public function down(): void
    {
        Schema::table('etablissements', static function (Blueprint $table): void {
            $table->dropColumn([
                'logo_pdf',
                'site_web',
                'adresse',
                'pays',
                'code_postal',
                'langue_defaut',
                'fuseau_horaire',
                'format_date',
            ]);
        });
    }
};
