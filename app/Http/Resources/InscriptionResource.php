<?php
declare(strict_types=1);
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class InscriptionResource extends JsonResource{public function toArray(Request $request): array{return ['id'=>$this->id,'type'=>$this->type,'statut'=>$this->statut,'date_inscription'=>$this->date_inscription,'classe'=>$this->whenLoaded('classe',fn()=>ClasseResource::make($this->classe)),'annee_scolaire'=>$this->whenLoaded('anneeScolaire',fn()=>['id'=>$this->anneeScolaire?->id,'libelle'=>$this->anneeScolaire?->libelle])];}}
