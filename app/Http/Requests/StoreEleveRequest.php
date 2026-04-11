<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Eleve;
use App\Models\ParentTuteur;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEleveRequest extends FormRequest
{
    /** Temporaire: permissions désactivées pendant la phase de développement. */
    public function authorize(): bool
    {
        return true;
    }

    /** Prépare les valeurs par défaut métier avant validation. */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'pays_naissance' => $this->input('pays_naissance', "Côte d'Ivoire"),
            'nationalite' => $this->input('nationalite', 'Ivoirienne'),
        ]);
    }

    /** Retourne les règles de validation du formulaire d'inscription. */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenoms' => ['required', 'string', 'max:150'],
            'date_naissance' => ['required', 'date', 'before:today'],
            'lieu_naissance' => ['required', 'string', 'max:100'],
            'pays_naissance' => ['required', 'string', 'max:100'],
            'sexe' => ['required', Rule::in(array_values(Eleve::SEXES))],
            'nationalite' => ['required', 'string', 'max:100'],
            'situation_familiale' => ['nullable', Rule::in(array_values(Eleve::SITUATIONS_FAMILIALES))],
            'est_boursier' => ['boolean'],
            'extrait_naissance_numero' => ['nullable', 'string', 'max:50'],
            'classe_id' => ['required', 'exists:classes,id'],
            'photo' => ['nullable', 'image', 'max:2048', 'mimes:jpg,jpeg,png'],

            'parent.nom' => ['required', 'string', 'max:100'],
            'parent.prenoms' => ['required', 'string', 'max:150'],
            'parent.lien' => ['required', Rule::in(array_values(ParentTuteur::LIENS))],
            'parent.profession' => ['nullable', 'string', 'max:100'],
            'parent.telephone_1' => ['required', 'string', 'regex:/^0[0-9]{9}$/'],
            'parent.telephone_2' => ['nullable', 'string', 'max:20'],
            'parent.whatsapp' => ['nullable', 'string', 'max:20'],
            'parent.email' => ['nullable', 'email', 'max:150'],
            'parent.adresse_quartier' => ['nullable', 'string', 'max:150'],
            'parent.est_payeur' => ['boolean'],
            'parent.can_portal_access' => ['boolean'],
            'parent.est_contact_urgence' => ['boolean'],
        ];
    }

    /** Messages personnalisés FR pour les erreurs principales du formulaire. */
    public function messages(): array
    {
        return [
            'nom.required' => "Le nom de l'élève est obligatoire",
            'prenoms.required' => 'Les prénoms sont obligatoires',
            'date_naissance.required' => 'La date de naissance est obligatoire',
            'date_naissance.before' => 'La date de naissance doit être dans le passé',
            'sexe.required' => 'Le sexe est obligatoire',
            'classe_id.required' => 'Veuillez choisir une classe',
            'classe_id.exists' => "Cette classe n'existe pas",
            'parent.telephone_1.required' => 'Le téléphone du parent est obligatoire',
            'parent.telephone_1.regex' => 'Format invalide. Ex: 0707000000',
        ];
    }
}
