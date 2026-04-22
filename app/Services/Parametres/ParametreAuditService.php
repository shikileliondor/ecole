<?php

declare(strict_types=1);

namespace App\Services\Parametres;

use App\Models\ParametreAudit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ParametreAuditService
{
    public function log(
        Request $request,
        int $etablissementId,
        string $onglet,
        string $action,
        ?Model $cible,
        ?array $avant,
        ?array $apres,
        ?string $justification = null,
    ): void {
        ParametreAudit::query()->create([
            'etablissement_id' => $etablissementId,
            'user_id' => $request->user()?->id,
            'onglet' => $onglet,
            'action' => $action,
            'cible_type' => $cible ? $cible::class : null,
            'cible_id' => $cible?->getKey(),
            'avant' => $avant,
            'apres' => $apres,
            'justification' => $justification,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
