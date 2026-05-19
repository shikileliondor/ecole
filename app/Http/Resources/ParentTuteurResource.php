<?php
declare(strict_types=1);
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class ParentTuteurResource extends JsonResource{public function toArray(Request $request): array{$c=(bool)$request->user()?->can('eleves.voir_contacts');$p=(bool)$request->user()?->can('eleves.gerer_portail');return ['id'=>$this->id,'nom'=>$this->nom,'prenoms'=>$this->prenoms,'lien'=>$this->lien,'profession'=>$this->profession,'telephone_1'=>$this->when($c,$this->telephone_1),'telephone_2'=>$this->when($c,$this->telephone_2),'whatsapp'=>$this->when($c,$this->whatsapp),'email'=>$this->when($c,$this->email),'adresse_quartier'=>$this->when($c,$this->adresse_quartier),'can_portal_access'=>$this->when($p,$this->can_portal_access),'portal_login'=>$this->when($p,$this->portal_login),'pivot'=>$this->whenPivotLoaded('eleve_parents',fn()=>['est_principal'=>(bool)$this->pivot?->est_principal,'peut_recuperer'=>(bool)$this->pivot?->peut_recuperer])];}}
