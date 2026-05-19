<?php

declare(strict_types=1);

namespace App\Http\Requests\Sms;

use Illuminate\Foundation\Http\FormRequest;

class SendSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()?->can('eleves.voir');
    }

    public function rules(): array
    {
        return [
            'to' => ['required', 'string', 'regex:/^(\+?225)?[0-9]{10}$/'],
            'eleve' => ['required', 'string', 'exists:eleves,ulid'],
            'message' => ['required', 'string', 'max:160'],
            'senderName' => ['nullable', 'string', 'max:11', 'regex:/^[A-Za-z0-9 ]+$/'],
        ];
    }
}
