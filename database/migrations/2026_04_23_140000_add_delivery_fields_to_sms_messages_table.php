<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sms_messages', function (Blueprint $table): void {
            $table->string('delivery_status', 40)->nullable()->after('status_local')->index();
            $table->timestamp('delivered_at')->nullable()->after('delivery_status');
        });
    }

    public function down(): void
    {
        Schema::table('sms_messages', function (Blueprint $table): void {
            $table->dropColumn(['delivery_status', 'delivered_at']);
        });
    }
};
