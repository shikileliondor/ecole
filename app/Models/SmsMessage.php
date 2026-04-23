<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'etablissement_id',
        'recipient_phone_number',
        'sender_name',
        'message',
        'provider',
        'provider_message_id',
        'status_local',
        'delivery_status',
        'delivered_at',
        'error_code',
        'error_message',
        'orange_response_raw',
    ];

    protected function casts(): array
    {
        return [
            'orange_response_raw' => 'array',
            'delivered_at' => 'datetime',
        ];
    }
}
