<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('eleves', function (Blueprint $table): void {
            $table->ulid('ulid')->nullable()->unique()->after('id');
        });

        DB::table('eleves')->select(['id'])->orderBy('id')->chunkById(200, function ($eleves): void {
            foreach ($eleves as $eleve) {
                DB::table('eleves')->where('id', $eleve->id)->update(['ulid' => (string) Str::ulid()]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('eleves', function (Blueprint $table): void {
            $table->dropUnique(['ulid']);
            $table->dropColumn('ulid');
        });
    }
};
