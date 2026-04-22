<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Personnel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePersonnelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'matricule_interne' => ['nullable', 'string', 'max:100'],
            'nom' => ['required', 'string', 'max:120'],
            'prenoms' => ['required', 'string', 'max:160'],
            'sexe' => ['required', Rule::in(array_keys(Personnel::SEXES))],
            'date_naissance' => ['nullable', 'date'],
            'lieu_naissance' => ['nullable', 'string', 'max:150'],
            'nationalite' => ['nullable', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:180'],
            'categorie' => ['required', Rule::in(array_keys(Personnel::CATEGORIES))],
            'type' => ['required', Rule::in(array_keys(Personnel::TYPES))],
            'poste' => ['nullable', 'string', 'max:150'],
            'date_embauche' => ['required', 'date'],
            'type_contrat' => ['required', Rule::in(array_keys(Personnel::TYPES_CONTRAT))],
            'salaire_base' => ['required', 'integer', 'min:0'],
            'statut' => ['required', Rule::in(array_keys(Personnel::STATUTS))],
            'documents' => ['array'],
            'documents.*.libelle' => ['required', 'string', 'max:120'],
            'documents.*.description' => ['nullable', 'string', 'max:255'],
            'documents.*.fichier' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'classes_ids' => ['array'],
            'classes_ids.*' => ['integer', 'exists:classes,id'],
        ];
    }
}
