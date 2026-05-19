<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EleveListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $inscription = $this->inscriptions->first();

        return [
            'id' => $this->ulid ?? (string) $this->id,
            'matricule' => $this->matricule,
            'nom' => $this->nom,
            'prenoms' => $this->prenoms,
            'sexe' => $this->sexe,
            'statut' => $this->statut,
            'photo' => $this->photo,
            'classe' => $inscription?->classe?->nom,
            'niveau' => $inscription?->classe?->niveau?->libelle,
        ];
    }
}
