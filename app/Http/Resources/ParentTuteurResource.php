<?php
declare(strict_types=1);
namespace App\Http\Resources;
use Illuminate\Http\Request;use Illuminate\Http\Resources\Json\JsonResource;
class ParentTuteurResource extends JsonResource{public function toArray(Request $request): array{return ['id'=>$this->id,'nom'=>$this->nom,'prenoms'=>$this->prenoms,'lien'=>$this->lien,'telephone_1'=>$this->telephone_1,'telephone_2'=>$this->telephone_2,'whatsapp'=>$this->whatsapp,'email'=>$this->email,'adresse_quartier'=>$this->adresse_quartier,'pivot'=>$this->whenPivotLoaded('eleve_parents',fn():array=>['est_principal'=>(bool)$this->pivot?->est_principal,'peut_recuperer'=>(bool)$this->pivot?->peut_recuperer])];}}
