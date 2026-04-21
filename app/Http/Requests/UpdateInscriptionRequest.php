<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Inscription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'classe_id' => ['required', 'exists:classes,id'],
            'date_inscription' => ['required', 'date'],
            'statut' => ['required', Rule::in(array_values(Inscription::STATUTS))],
            'boursier' => ['boolean'],
        ];
    }
}
