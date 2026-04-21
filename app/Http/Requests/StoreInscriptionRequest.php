<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\ParentTuteur;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type_inscription' => ['required', Rule::in(['nouvelle', 'reinscription'])],
            'eleve_id' => ['nullable', 'required_if:type_inscription,reinscription', 'exists:eleves,id'],

            'nom' => ['required_if:type_inscription,nouvelle', 'string', 'max:100'],
            'prenoms' => ['required_if:type_inscription,nouvelle', 'string', 'max:150'],
            'sexe' => ['required_if:type_inscription,nouvelle', Rule::in(array_values(Eleve::SEXES))],
            'date_naissance' => ['required_if:type_inscription,nouvelle', 'date', 'before:today'],
            'lieu_naissance' => ['required_if:type_inscription,nouvelle', 'string', 'max:100'],
            'nationalite' => ['required_if:type_inscription,nouvelle', 'string', 'max:100'],
            'reference_extrait' => ['nullable', 'string', 'max:50'],
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png'],

            'mode_tuteur' => ['nullable', Rule::in(['create', 'attach', 'replace'])],
            'parent_tuteur_id' => ['nullable', 'required_if:mode_tuteur,attach', 'exists:parents_tuteurs,id'],

            'nom_tuteur' => ['required_unless:mode_tuteur,attach', 'string', 'max:100'],
            'prenoms_tuteur' => ['required_unless:mode_tuteur,attach', 'string', 'max:150'],
            'telephone_tuteur' => ['required_unless:mode_tuteur,attach', 'string', 'regex:/^0[0-9]{9}$/'],
            'email_tuteur' => ['nullable', 'email', 'max:150'],
            'adresse_tuteur' => ['nullable', 'string', 'max:150'],
            'lien_parente' => ['required_unless:mode_tuteur,attach', Rule::in(array_values(ParentTuteur::LIENS))],

            'nom_urgence' => ['required', 'string', 'max:100'],
            'telephone_urgence' => ['required', 'string', 'regex:/^0[0-9]{9}$/'],
            'lien_urgence' => ['required', 'string', 'max:100'],
            'adresse_urgence' => ['nullable', 'string', 'max:150'],

            'annee_scolaire_id' => ['required', 'exists:annees_scolaires,id'],
            'classe_id' => ['required', 'exists:classes,id'],
            'date_inscription' => ['required', 'date'],
            'statut' => ['required', Rule::in(array_values(Inscription::STATUTS))],
            'boursier' => ['boolean'],

            'documents' => ['array'],
            'documents.*.libelle' => ['nullable', 'string', 'max:100'],
            'documents.*.description' => ['nullable', 'string', 'max:200'],
            'documents.*.fichier' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
