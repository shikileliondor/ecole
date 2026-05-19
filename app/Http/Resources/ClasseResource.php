<?php
declare(strict_types=1);
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class ClasseResource extends JsonResource{public function toArray(Request $request): array{return ['id'=>$this->id,'nom'=>$this->nom,'niveau'=>$this->whenLoaded('niveau',fn()=>['id'=>$this->niveau?->id,'libelle'=>$this->niveau?->libelle])];}}
