<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bulletin — {{ $classe->nom }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #1e293b; background: #fff; }

        .page-header { width: 100%; border-bottom: 3px solid #1a56a0; padding-bottom: 8px; margin-bottom: 10px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: middle; padding: 0 6px; }
        .logo-cell { width: 80px; }
        .logo-cell img { width: 70px; height: 70px; object-fit: contain; }
        .logo-placeholder {
            width: 70px; height: 70px; background: #1a56a0; border-radius: 8px;
            color: #fff; font-size: 20px; font-weight: bold; text-align: center; line-height: 70px;
        }
        .school-name { font-size: 13px; font-weight: bold; color: #1a56a0; }
        .school-meta { font-size: 9px; color: #475569; line-height: 1.5; margin-top: 2px; }
        .school-badge { display: inline-block; background: #e8f0fb; color: #1a56a0; font-size: 8px; padding: 1px 6px; border-radius: 10px; margin-top: 3px; font-weight: bold; }
        .doc-title { font-size: 16px; font-weight: bold; color: #1a56a0; text-transform: uppercase; letter-spacing: 1px; }
        .doc-subtitle { font-size: 10px; color: #64748b; margin-top: 3px; }
        .meta-label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-value { font-size: 10px; color: #334155; font-weight: bold; margin-bottom: 3px; }

        .context-band {
            background: #f1f5f9; border-left: 4px solid #1a56a0;
            padding: 6px 12px; margin-bottom: 10px; border-radius: 0 4px 4px 0;
        }
        .context-band table { width: 100%; border-collapse: collapse; }
        .context-band td { padding: 1px 12px 1px 0; font-size: 9px; color: #475569; }
        .context-band td strong { color: #1e293b; }

        .stats-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .stat-box { border-radius: 6px; padding: 6px 10px; text-align: center; }
        .stat-label { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 17px; font-weight: bold; line-height: 1.2; }
        .stat-total  { background: #e8f0fb; border: 1px solid #bfdbfe; }
        .stat-total .stat-value { color: #1a56a0; } .stat-total .stat-label { color: #3b82f6; }
        .stat-ok     { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .stat-ok .stat-value { color: #16a34a; } .stat-ok .stat-label { color: #22c55e; }
        .stat-nok    { background: #fff1f2; border: 1px solid #fecdd3; }
        .stat-nok .stat-value { color: #dc2626; } .stat-nok .stat-label { color: #ef4444; }
        .stat-avg    { background: #f5f3ff; border: 1px solid #ddd6fe; }
        .stat-avg .stat-value { color: #7c3aed; } .stat-avg .stat-label { color: #8b5cf6; }
        .stat-rate   { background: #fff7ed; border: 1px solid #fed7aa; }
        .stat-rate .stat-value { color: #ea580c; } .stat-rate .stat-label { color: #f97316; }

        .listing { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .listing thead tr { background: #1a56a0; }
        .listing th {
            color: #fff; text-align: center; font-size: 7.5px; font-weight: bold;
            padding: 5px 4px; border: 1px solid #1a4f90; text-transform: uppercase;
        }
        .listing th.left { text-align: left; }
        .listing td {
            padding: 4px 5px; border: 1px solid #e2e8f0; font-size: 8.5px;
            vertical-align: middle; text-align: center;
        }
        .listing td.left { text-align: left; }
        .listing tbody tr:nth-child(even) { background: #f8fafc; }

        .note-ok  { color: #16a34a; font-weight: bold; }
        .note-nok { color: #dc2626; }
        .note-absent { color: #94a3b8; font-style: italic; }

        .badge { display: inline-block; padding: 1px 5px; border-radius: 8px; font-size: 7.5px; font-weight: bold; }
        .badge-tb   { background: #d1fae5; color: #065f46; }
        .badge-b    { background: #dbeafe; color: #1e40af; }
        .badge-ab   { background: #e0f2fe; color: #0369a1; }
        .badge-pass { background: #fef9c3; color: #854d0e; }
        .badge-ins  { background: #fee2e2; color: #991b1b; }

        .footer { margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px; width: 100%; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .signature-block { text-align: right; font-size: 9px; color: #475569; }
        .signature-line { margin-top: 28px; border-top: 1px solid #94a3b8; width: 130px; float: right; }
        .watermark { font-size: 7.5px; color: #94a3b8; text-align: center; margin-top: 6px; }

        @page { margin: 10mm 8mm 10mm 8mm; }
    </style>
</head>
<body>

{{-- ── En-tête ── --}}
<div class="page-header">
    <table class="header-table">
        <tr>
            <td class="logo-cell">
                @if($etablissement?->logo_pdf || $etablissement?->logo)
                    @php $logoPath = public_path('storage/' . ($etablissement->logo_pdf ?? $etablissement->logo)); @endphp
                    @if(file_exists($logoPath))
                        <img src="{{ $logoPath }}" alt="Logo">
                    @else
                        <div class="logo-placeholder">{{ mb_strtoupper(mb_substr($etablissement->sigle ?? $etablissement->nom ?? 'E', 0, 2)) }}</div>
                    @endif
                @else
                    <div class="logo-placeholder">{{ mb_strtoupper(mb_substr($etablissement?->sigle ?? $etablissement?->nom ?? 'E', 0, 2)) }}</div>
                @endif
            </td>
            <td style="width:36%;">
                <div class="school-name">{{ $etablissement?->nom ?? 'Établissement scolaire' }}</div>
                @if($etablissement?->sigle)<div class="school-badge">{{ $etablissement->sigle }}</div>@endif
                <div class="school-meta">
                    @if($etablissement?->adresse_complete)📍 {{ $etablissement->adresse_complete }}<br>@endif
                    @if($etablissement?->agrement_mena)Agrément MENA : <strong>{{ $etablissement->agrement_mena }}</strong>@endif
                </div>
            </td>
            <td style="text-align:center;">
                <div class="doc-title">Bulletin de composition</div>
                <div class="doc-subtitle">{{ $composition->periodeAcademique?->libelle ?? '—' }}</div>
                @if($etablissement?->devise)<div style="font-size:8px;color:#94a3b8;margin-top:3px;font-style:italic;">"{{ $etablissement->devise }}"</div>@endif
            </td>
            <td style="text-align:right;width:20%;">
                <div class="meta-label">Date d'édition</div>
                <div class="meta-value">{{ $date_edition->format('d/m/Y') }}</div>
                <div class="meta-label">Heure</div>
                <div class="meta-value">{{ $date_edition->format('H:i') }}</div>
            </td>
        </tr>
    </table>
</div>

{{-- ── Contexte ── --}}
<div class="context-band">
    <table>
        <tr>
            <td><strong>Classe :</strong> {{ $classe->nom }}@if($classe->niveau) ({{ $classe->niveau->libelle }})@endif</td>
            <td><strong>Composition :</strong> {{ $composition->libelle }}</td>
            <td><strong>Type :</strong> {{ $composition->type === 'passage' ? 'Examen de passage' : 'Composition simple' }}</td>
            <td><strong>Seuil :</strong> {{ $composition->seuil_validation }}/20</td>
            <td><strong>Barème :</strong> /{{ $composition->bareme }}</td>
        </tr>
    </table>
</div>

{{-- ── Stats ── --}}
<table class="stats-table">
    <tr>
        <td style="padding:0 4px 8px 0;">
            <div class="stat-box stat-total">
                <div class="stat-value">{{ $stats['total'] }}</div>
                <div class="stat-label">Élèves</div>
            </div>
        </td>
        <td style="padding:0 4px 8px 0;">
            <div class="stat-box stat-ok">
                <div class="stat-value">{{ $stats['admis'] }}</div>
                <div class="stat-label">Admis</div>
            </div>
        </td>
        <td style="padding:0 4px 8px 0;">
            <div class="stat-box stat-nok">
                <div class="stat-value">{{ $stats['en_echec'] }}</div>
                <div class="stat-label">En échec</div>
            </div>
        </td>
        <td style="padding:0 4px 8px 0;">
            <div class="stat-box stat-avg">
                <div class="stat-value">{{ $stats['moyenne_classe'] !== null ? number_format($stats['moyenne_classe'], 2, ',', ' ') : '—' }}</div>
                <div class="stat-label">Moy. classe</div>
            </div>
        </td>
        <td style="padding:0 0 8px 0;">
            <div class="stat-box stat-rate">
                <div class="stat-value">{{ $stats['taux_reussite'] }}%</div>
                <div class="stat-label">Taux réussite</div>
            </div>
        </td>
    </tr>
</table>

{{-- ── Tableau des notes ── --}}
@if($resultats->isEmpty())
    <p style="text-align:center;color:#94a3b8;padding:16px 0;">Aucune donnée à afficher.</p>
@else
<table class="listing">
    <thead>
        <tr>
            <th style="width:22px;">Rg</th>
            <th class="left" style="width:28%;">Élève</th>
            <th style="width:10px;">Mtri.</th>
            @foreach($matieres as $matiere)
                <th title="{{ $matiere->libelle }}" style="max-width:32px;overflow:hidden;">
                    {{ mb_strimwidth($matiere->libelle, 0, 7, '…') }}<br>
                    <span style="font-size:6.5px;opacity:0.8;">(×{{ $matiere->coefficient }})</span>
                </th>
            @endforeach
            <th style="width:34px;">Moy.</th>
            <th style="width:38px;">Mention</th>
        </tr>
    </thead>
    <tbody>
        @foreach($resultats as $resultat)
        @php
            $moy = $resultat['moyenne'];
            $seuil = (float) $composition->seuil_validation;
            $admis = $moy !== null && $moy >= $seuil;
        @endphp
        <tr>
            <td>{{ $resultat['rang'] }}</td>
            <td class="left">
                <strong>{{ $resultat['eleve']?->nom }}</strong>
                {{ $resultat['eleve']?->prenoms }}
            </td>
            <td style="font-family:monospace;font-size:7.5px;color:#64748b;">
                {{ $resultat['eleve']?->matricule }}
            </td>
            @foreach($matieres as $matiere)
            @php $note = $resultat['notesParMatiere'][$matiere->id] ?? null; @endphp
            <td class="{{ $note === null ? 'note-absent' : ($note >= $seuil ? 'note-ok' : 'note-nok') }}">
                {{ $note !== null ? number_format($note, 2, ',', ' ') : '—' }}
            </td>
            @endforeach
            <td style="font-weight:bold;{{ $moy !== null ? ($admis ? 'color:#16a34a;' : 'color:#dc2626;') : 'color:#94a3b8;' }}">
                {{ $moy !== null ? number_format($moy, 2, ',', ' ') : '—' }}
            </td>
            <td>
                @if($moy !== null)
                @php
                    $cls = match(true) {
                        $moy >= 16 => 'badge-tb',
                        $moy >= 14 => 'badge-b',
                        $moy >= 12 => 'badge-ab',
                        $moy >= 10 => 'badge-pass',
                        default    => 'badge-ins',
                    };
                @endphp
                <span class="badge {{ $cls }}">{{ $resultat['mention'] }}</span>
                @else
                    <span style="color:#94a3b8;">—</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ── Pied de page ── --}}
<div class="footer">
    <table class="footer-table">
        <tr>
            <td>
                <div style="font-size:9px;color:#334155;">
                    {{ $stats['avec_notes'] }} élève(s) noté(s) sur {{ $stats['total'] }}
                    &nbsp;·&nbsp; Admis : <strong style="color:#16a34a;">{{ $stats['admis'] }}</strong>
                    &nbsp;·&nbsp; En échec : <strong style="color:#dc2626;">{{ $stats['en_echec'] }}</strong>
                </div>
                <div class="watermark">Document généré le {{ $date_edition->format('d/m/Y à H:i') }} — ERP Scolaire CI</div>
            </td>
            <td style="text-align:right;width:170px;">
                <div class="signature-block">
                    <div style="font-weight:bold;color:#1e293b;">{{ $etablissement?->directeur_nom ? 'Le Directeur' : 'La Direction' }}</div>
                    @if($etablissement?->directeur_nom)<div style="font-size:9px;color:#475569;">{{ $etablissement->directeur_nom }}</div>@endif
                    <div class="signature-line"></div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
