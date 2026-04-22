<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGeneralParametreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:120'],
            'sigle' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:120'],
            'contact_telephone' => ['required', 'string', 'max:30'],
            'contact_whatsapp' => ['nullable', 'string', 'max:30'],
            'site_web' => ['nullable', 'url', 'max:255'],
            'localisation_ville' => ['required', 'string', 'max:120'],
            'localisation_commune' => ['nullable', 'string', 'max:120'],
            'localisation_quartier' => ['nullable', 'string', 'max:120'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'pays' => ['nullable', 'string', 'max:120'],
            'code_postal' => ['nullable', 'string', 'max:30'],
            'devise' => ['nullable', 'string', 'max:10'],
            'langue_defaut' => ['nullable', 'string', 'max:10'],
            'fuseau_horaire' => ['nullable', 'string', 'max:60'],
            'format_date' => ['nullable', 'string', 'max:30'],
            'directeur_nom' => ['nullable', 'string', 'max:120'],
            'agrement_mena' => ['nullable', 'string', 'max:120'],
            'annee_creation' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();

        foreach ($input as $key => $value) {
            if (is_string($value)) {
                $input[$key] = trim($value);
            }
        }

        $this->replace($input);
    }
}
