<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport général</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }

        .page-header { width: 100%; border-bottom: 3px solid #1a56a0; padding-bottom: 10px; margin-bottom: 12px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: middle; padding: 0 6px; }
        .logo-cell { width: 90px; }
        .logo-cell img { width: 80px; height: 80px; object-fit: contain; }
        .logo-placeholder {
            width: 80px; height: 80px; background: #1a56a0; border-radius: 8px;
            color: #fff; font-size: 22px; font-weight: bold; text-align: center; line-height: 80px;
        }
        .school-info-cell { width: 38%; }
        .school-name { font-size: 15px; font-weight: bold; color: #1a56a0; }
        .school-meta { font-size: 10px; color: #475569; line-height: 1.6; margin-top: 3px; }
        .school-badge { display: inline-block; background: #e8f0fb; color: #1a56a0; font-size: 9px; padding: 2px 7px; border-radius: 10px; margin-top: 4px; font-weight: bold; }
        .doc-title-cell { text-align: center; }
        .doc-title { font-size: 18px; font-weight: bold; color: #1a56a0; text-transform: uppercase; letter-spacing: 1px; }
        .doc-subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
        .meta-right-cell { text-align: right; width: 22%; }
        .meta-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-value { font-size: 11px; color: #334155; font-weight: bold; margin-bottom: 4px; }

        .section-title {
            font-size: 11px; font-weight: bold; color: #1a56a0;
            text-transform: uppercase; letter-spacing: 0.5px;
            border-bottom: 2px solid #1a56a0; padding-bottom: 4px;
            margin: 14px 0 8px 0;
        }

        .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .kpi-box { border-radius: 6px; padding: 8px 12px; text-align: center; }
        .kpi-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
        .kpi-value { font-size: 20px; font-weight: bold; color: #1a56a0; line-height: 1.2; }
        .kpi-blue  { background: #e8f0fb; border: 1px solid #bfdbfe; }
        .kpi-green { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .kpi-orange{ background: #fff7ed; border: 1px solid #fed7aa; }
        .kpi-purple{ background: #f5f3ff; border: 1px solid #ddd6fe; }

        .cols2 { width: 100%; border-collapse: collapse; }
        .cols2 td { vertical-align: top; padding: 0 5px 0 0; width: 50%; }
        .cols2 td:last-child { padding: 0; }

        .listing { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .listing thead tr { background: #1a56a0; }
        .listing th { color: #fff; text-align: left; font-size: 9px; font-weight: bold; padding: 6px 8px; border: 1px solid #1a4f90; text-transform: uppercase; }
        .listing td { padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 9.5px; vertical-align: middle; }
        .listing tbody tr:nth-child(even) { background: #f8fafc; }

        .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 8px; font-weight: bold; }
        .badge-ok  { background: #dcfce7; color: #166534; }
        .badge-nok { background: #fee2e2; color: #991b1b; }

        .stat-row { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .stat-cell { padding: 6px 10px; border-radius: 6px; text-align: center; }
        .stat-label { font-size: 8px; text-transform: uppercase; color: #64748b; }
        .stat-value { font-size: 16px; font-weight: bold; }

        .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 10px; width: 100%; }
        .footer-table { width: 100%; border-collapse: collapse; }
        .watermark { font-size: 8px; color: #94a3b8; text-align: center; margin-top: 6px; }
        .signature-block { text-align: right; font-size: 10px; color: #475569; }
        .signature-line { margin-top: 32px; border-top: 1px solid #94a3b8; width: 140px; float: right; }

        @page { margin: 12mm 10mm 12mm 10mm; }
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
            <td class="school-info-cell">
                <div class="school-name">{{ $etablissement?->nom ?? 'Établissement scolaire' }}</div>
                @if($etablissement?->sigle)<div class="school-badge">{{ $etablissement->sigle }}</div>@endif
                <div class="school-meta">
                    @if($etablissement?->adresse_complete)📍 {{ $etablissement->adresse_complete }}<br>@endif
                    @if($etablissement?->contact_telephone)📞 {{ $etablissement->contact_telephone }}@if($etablissement?->contact_email) · ✉ {{ $etablissement->contact_email }}@endif<br>@endif
                    @if($etablissement?->agrement_mena)Agrément MENA : <strong>{{ $etablissement->agrement_mena }}</strong><br>@endif
                    @if($etablissement?->directeur_nom)Direction : <strong>{{ $etablissement->directeur_nom }}</strong>@endif
                </div>
            </td>
            <td class="doc-title-cell">
                <div class="doc-title">Rapport général</div>
                <div class="doc-subtitle">{{ $annee_active?->libelle ?? 'Toutes années' }}</div>
                @if($etablissement?->devise)<div style="font-size:9px;color:#94a3b8;margin-top:4px;font-style:italic;">"{{ $etablissement->devise }}"</div>@endif
            </td>
            <td class="meta-right-cell">
                <div class="meta-label">Date d'édition</div>
                <div class="meta-value">{{ $date_edition->format('d/m/Y') }}</div>
                <div class="meta-label">Heure</div>
                <div class="meta-value">{{ $date_edition->format('H:i') }}</div>
            </td>
        </tr>
    </table>
</div>

{{-- ── KPIs ── --}}
<table class="kpi-table">
    <tr>
        @foreach([
            ['Élèves inscrits',   $kpis['elevesInscrits'],   'kpi-blue'],
            ['Classes actives',   $kpis['classesActives'],   'kpi-green'],
            ['Enseignants',       $kpis['enseignants'],      'kpi-purple'],
            ['Bulletins générés', $kpis['bulletinsGeneres'], 'kpi-green'],
            ['Absences (mois)',   $kpis['absencesMois'],     'kpi-orange'],
            ['Nouveaux inscrits', $kpis['nouveauxInscrits'], 'kpi-blue'],
        ] as [$label, $val, $cls])
        <td style="padding: 0 4px 0 0;">
            <div class="kpi-box {{ $cls }}">
                <div class="kpi-value">{{ $val }}</div>
                <div class="kpi-label">{{ $label }}</div>
            </div>
        </td>
        @endforeach
    </tr>
</table>

{{-- ── Deux colonnes principales ── --}}
<table class="cols2">
<tr>

{{-- Colonne gauche : Effectif par classe --}}
<td>
    <div class="section-title">Effectif par classe</div>
    @if($effectifParClasse->isEmpty())
        <p style="color:#94a3b8;font-size:9px;padding:6px 0;">Aucune donnée.</p>
    @else
    <table class="listing">
        <thead><tr><th>Classe</th><th style="text-align:right;width:70px;">Élèves</th></tr></thead>
        <tbody>
            @foreach($effectifParClasse as $row)
            <tr>
                <td>{{ $row->nom }}</td>
                <td style="text-align:right;font-weight:bold;color:#1a56a0;">{{ $row->total }}</td>
            </tr>
            @endforeach
            <tr style="background:#e8f0fb;">
                <td style="font-weight:bold;">Total</td>
                <td style="text-align:right;font-weight:bold;color:#1a56a0;">{{ $kpis['elevesInscrits'] }}</td>
            </tr>
        </tbody>
    </table>
    @endif

    <div class="section-title" style="margin-top:14px;">Répartition par sexe</div>
    <table class="listing">
        <thead><tr><th>Sexe</th><th style="text-align:right;width:70px;">Effectif</th></tr></thead>
        <tbody>
            @foreach($repartitionSexe as $row)
            <tr>
                <td>{{ $row->sexe === 'M' ? 'Masculin' : 'Féminin' }}</td>
                <td style="text-align:right;font-weight:bold;color:#1a56a0;">{{ $row->total }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title" style="margin-top:14px;">Personnel</div>
    <table class="listing">
        <thead><tr><th>Type</th><th style="text-align:right;width:70px;">Nombre</th></tr></thead>
        <tbody>
            @foreach($personnelStats['par_poste'] as $row)
            <tr>
                <td>{{ ucfirst(str_replace('_', ' ', $row->type)) }}</td>
                <td style="text-align:right;font-weight:bold;">{{ $row->total }}</td>
            </tr>
            @endforeach
            <tr style="background:#e8f0fb;">
                <td style="font-weight:bold;">Total</td>
                <td style="text-align:right;font-weight:bold;color:#1a56a0;">{{ $personnelStats['total'] }}</td>
            </tr>
        </tbody>
    </table>
</td>

{{-- Colonne droite : Effectif par niveau + Absences + Moyennes --}}
<td>
    <div class="section-title">Effectif par niveau</div>
    @if($effectifParNiveau->isEmpty())
        <p style="color:#94a3b8;font-size:9px;padding:6px 0;">Aucune donnée.</p>
    @else
    <table class="listing">
        <thead><tr><th>Niveau</th><th style="text-align:right;width:70px;">Élèves</th></tr></thead>
        <tbody>
            @foreach($effectifParNiveau as $row)
            <tr>
                <td>{{ $row->libelle }}</td>
                <td style="text-align:right;font-weight:bold;color:#1a56a0;">{{ $row->total }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="section-title" style="margin-top:14px;">Absences</div>
    <table class="listing">
        <thead><tr><th>Indicateur</th><th style="text-align:right;width:70px;">Valeur</th></tr></thead>
        <tbody>
            <tr><td>Total (toute période)</td><td style="text-align:right;font-weight:bold;">{{ $absencesStats['total'] }}</td></tr>
            <tr><td>Justifiées</td><td style="text-align:right;"><span class="badge badge-ok">{{ $absencesStats['justifiees'] }}</span></td></tr>
            <tr><td>Non justifiées</td><td style="text-align:right;"><span class="badge badge-nok">{{ $absencesStats['non_justifiees'] }}</span></td></tr>
            <tr><td>Ce mois-ci</td><td style="text-align:right;font-weight:bold;color:#f97316;">{{ $absencesStats['du_mois'] }}</td></tr>
        </tbody>
    </table>

    @if($moyennesParClasse->isNotEmpty())
    <div class="section-title" style="margin-top:14px;">Moyennes par classe</div>
    <table class="listing">
        <thead><tr><th>Classe</th><th style="text-align:right;width:70px;">Moyenne</th></tr></thead>
        <tbody>
            @foreach($moyennesParClasse as $row)
            @php $moy = (float)$row->moyenne; @endphp
            <tr>
                <td>{{ $row->nom }}</td>
                <td style="text-align:right;font-weight:bold;color:{{ $moy >= 10 ? '#16a34a' : '#dc2626' }};">
                    {{ number_format($moy, 2, ',', ' ') }}/20
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
</td>

</tr>
</table>

{{-- ── Pied de page ── --}}
<div class="footer">
    <table class="footer-table">
        <tr>
            <td>
                <div style="font-size:10px;color:#334155;">
                    Rapport édité le <strong>{{ $date_edition->format('d/m/Y à H:i') }}</strong>
                    &nbsp;·&nbsp; Édité par : <strong>{{ auth()->user()?->name ?? '—' }}</strong>
                </div>
                <div class="watermark">Document généré automatiquement — ERP Scolaire CI</div>
            </td>
            <td style="text-align:right;width:180px;">
                <div class="signature-block">
                    <div style="font-weight:bold;color:#1e293b;">{{ $etablissement?->directeur_nom ? 'Le Directeur' : 'La Direction' }}</div>
                    @if($etablissement?->directeur_nom)<div style="color:#475569;font-size:10px;">{{ $etablissement->directeur_nom }}</div>@endif
                    <div class="signature-line"></div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
