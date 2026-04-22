<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParametreConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $onglet = (string) $this->route('onglet');

        $common = ['donnees' => ['required', 'array']];

        return match ($onglet) {
            'inscriptions' => $common + [
                'donnees.regle_matricule' => ['required', 'string', 'max:120'],
                'donnees.format_matricule' => ['required', 'string', 'max:160', 'regex:/\{(annee|niveau|compteur(?::\d+)?)\}/'],
                'donnees.boursier_par_defaut' => ['required', 'boolean'],
                'donnees.age_par_niveau' => ['nullable', 'string', 'max:4000'],
                'donnees.documents_requis' => ['nullable', 'string', 'max:4000'],
            ],
            'finance' => $common + [
                'donnees.prefixe_recu' => ['required', 'string', 'max:20', 'regex:/^[A-Z0-9_-]+$/'],
                'donnees.prochain_numero_recu' => ['required', 'string', 'max:20', 'regex:/^[0-9]+$/'],
                'donnees.politique_echeance' => ['nullable', 'string', 'max:255'],
                'donnees.remises_autorisees' => ['required', 'boolean'],
                'donnees.penalites_retard' => ['nullable', 'string', 'max:255'],
            ],
            'evaluations' => $common + [
                'donnees.bareme_principal' => ['required', 'integer', 'min:1', 'max:100'],
                'donnees.mode_arrondi' => ['required', Rule::in(['unite_inferieure', 'unite_superieure', 'demi_point', 'dixieme_inferieur', 'dixieme_superieur'])],
                'donnees.seuil_validation' => ['required', 'numeric', 'min:0'],
                'donnees.regle_moyenne' => ['required', Rule::in(['simple', 'ponderee_coefficient'])],
                'donnees.appreciations_auto' => ['nullable', 'string', 'max:4000'],
            ],
            'absences' => $common + [
                'donnees.types_absence' => ['nullable', 'string', 'max:4000'],
                'donnees.motifs' => ['nullable', 'string', 'max:4000'],
                'donnees.statuts_justification' => ['nullable', 'string', 'max:4000'],
                'donnees.sanctions' => ['nullable', 'string', 'max:4000'],
                'donnees.types_incident' => ['nullable', 'string', 'max:4000'],
                'donnees.niveaux_gravite' => ['nullable', 'string', 'max:4000'],
            ],
            'documents' => $common + [
                'donnees.entete' => ['nullable', 'string', 'max:4000'],
                'donnees.pied_page' => ['nullable', 'string', 'max:4000'],
                'donnees.signature' => ['nullable', 'string', 'max:255'],
                'donnees.cachet' => ['nullable', 'string', 'max:255'],
                'donnees.variables' => ['nullable', 'string', 'max:4000'],
            ],
            default => $common,
        };
    }

    protected function prepareForValidation(): void
    {
        if (! is_array($this->donnees)) {
            return;
        }

        $normalized = $this->donnees;
        array_walk($normalized, static function (&$value): void {
            if (is_string($value)) {
                $value = trim($value);
            }
        });

        $this->merge(['donnees' => $normalized]);
    }
}
