<?php

declare(strict_types=1);

namespace App\Http\Requests\Sms;

use Illuminate\Foundation\Http\FormRequest;

class SendSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to' => ['required', 'string', 'regex:/^(\+?225)?0?[0-9]{8,10}$/'],
            'message' => ['required', 'string', 'max:1000'],
            'senderName' => ['required', 'string', 'max:11', 'regex:/^[A-Za-z0-9 ]+$/'],
        ];
    }
}
