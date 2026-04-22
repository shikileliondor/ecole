<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('etablissements', static function (Blueprint $table): void {
            $table->string('slogan')->nullable()->after('devise');
        });

        DB::table('etablissements')
            ->whereRaw('CHAR_LENGTH(devise) > 10')
            ->update([
                'slogan' => DB::raw('devise'),
                'devise' => null,
            ]);
    }

    public function down(): void
    {
        Schema::table('etablissements', static function (Blueprint $table): void {
            $table->dropColumn('slogan');
        });
    }
};
