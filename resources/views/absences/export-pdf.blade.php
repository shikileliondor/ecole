<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport des absences</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1e293b;
            background: #fff;
        }

        /* ── En-tête ── */
        .page-header {
            width: 100%;
            border-bottom: 3px solid #1a56a0;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: middle; padding: 0 6px; }

        .logo-cell { width: 90px; }
        .logo-cell img { width: 80px; height: 80px; object-fit: contain; }
        .logo-placeholder {
            width: 80px; height: 80px;
            background: #1a56a0;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 22px; font-weight: bold;
            text-align: center; line-height: 80px;
        }

        .school-info-cell { width: 38%; }
        .school-name { font-size: 15px; font-weight: bold; color: #1a56a0; }
        .school-meta { font-size: 10px; color: #475569; line-height: 1.6; margin-top: 3px; }
        .school-badge {
            display: inline-block;
            background: #e8f0fb;
            color: #1a56a0;
            font-size: 9px;
            padding: 2px 7px;
            border-radius: 10px;
            margin-top: 4px;
            font-weight: bold;
        }

        .doc-title-cell { text-align: center; }
        .doc-title {
            font-size: 18px;
            font-weight: bold;
            color: #1a56a0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .doc-subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }

        .meta-right-cell { text-align: right; width: 22%; }
        .meta-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-value { font-size: 11px; color: #334155; font-weight: bold; margin-bottom: 4px; }

        /* ── Bande de contexte ── */
        .context-band {
            background: #f1f5f9;
            border-left: 4px solid #1a56a0;
            padding: 7px 12px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
        }
        .context-band table { width: 100%; border-collapse: collapse; }
        .context-band td { padding: 1px 12px 1px 0; font-size: 10px; color: #475569; }
        .context-band td strong { color: #1e293b; }

        /* ── Stats ── */
        .stats-row { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .stat-box { border-radius: 6px; padding: 8px 12px; text-align: center; width: 33%; }
        .stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 20px; font-weight: bold; line-height: 1.2; }
        .stat-total   { background: #e8f0fb; border: 1px solid #bfdbfe; }
        .stat-total .stat-value { color: #1a56a0; }
        .stat-total .stat-label { color: #3b82f6; }
        .stat-ok      { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .stat-ok .stat-value { color: #16a34a; }
        .stat-ok .stat-label { color: #22c55e; }
        .stat-nok     { background: #fff1f2; border: 1px solid #fecdd3; }
        .stat-nok .stat-value { color: #dc2626; }
        .stat-nok .stat-label { color: #ef4444; }

        /* ── Tableau ── */
        .listing { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .listing thead tr { background: #1a56a0; }
        .listing th {
            color: #fff;
            text-align: left;
            font-size: 9.5px;
            font-weight: bold;
            padding: 7px 8px;
            border: 1px solid #1a4f90;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .listing td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            font-size: 10px;
            vertical-align: middle;
        }
        .listing tbody tr:nth-child(even) { background: #f8fafc; }
        .listing tbody tr:hover { background: #eff6ff; }

        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-oui  { background: #dcfce7; color: #166534; }
        .badge-non  { background: #fee2e2; color: #991b1b; }
        .badge-matin      { background: #dbeafe; color: #1d4ed8; }
        .badge-apres_midi { background: #fef3c7; color: #92400e; }
        .badge-journee    { background: #ede9fe; color: #6d28d9; }

        /* ── Pied de page ── */
        .footer {
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            width: 100%;
        }
        .footer-table { width: 100%; border-collapse: collapse; }
        .footer-table td { vertical-align: bottom; }
        .footer-total { font-size: 11px; color: #334155; }
        .footer-total strong { font-size: 13px; color: #1a56a0; }
        .signature-block { text-align: right; font-size: 10px; color: #475569; }
        .signature-line  { margin-top: 38px; border-top: 1px solid #94a3b8; width: 160px; float: right; }
        .watermark {
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            margin-top: 10px;
        }

        @page { margin: 15mm 12mm 15mm 12mm; }
    </style>
</head>
<body>

{{-- ── En-tête ── --}}
<div class="page-header">
    <table class="header-table">
        <tr>
            {{-- Logo --}}
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

            {{-- Infos école --}}
            <td class="school-info-cell">
                <div class="school-name">{{ $etablissement?->nom ?? 'Établissement scolaire' }}</div>
                @if($etablissement?->sigle)
                    <div class="school-badge">{{ $etablissement->sigle }}</div>
                @endif
                <div class="school-meta">
                    @if($etablissement?->adresse_complete)
                        📍 {{ $etablissement->adresse_complete }}<br>
                    @endif
                    @if($etablissement?->contact_telephone)
                        📞 {{ $etablissement->contact_telephone }}
                        @if($etablissement?->contact_email)  ·  ✉ {{ $etablissement->contact_email }}@endif
                        <br>
                    @endif
                    @if($etablissement?->agrement_mena)
                        Agrément MENA : <strong>{{ $etablissement->agrement_mena }}</strong><br>
                    @endif
                    @if($etablissement?->directeur_nom)
                        Direction : <strong>{{ $etablissement->directeur_nom }}</strong>
                    @endif
                </div>
            </td>

            {{-- Titre du document --}}
            <td class="doc-title-cell">
                <div class="doc-title">Rapport des absences</div>
                <div class="doc-subtitle">
                    {{ $annee_active?->libelle ?? 'Année scolaire non définie' }}
                </div>
                @if($etablissement?->devise)
                    <div style="font-size:9px; color:#94a3b8; margin-top:5px; font-style:italic;">"{{ $etablissement->devise }}"</div>
                @endif
            </td>

            {{-- Date d'édition --}}
            <td class="meta-right-cell">
                <div class="meta-label">Date d'édition</div>
                <div class="meta-value">{{ $date_edition->format('d/m/Y') }}</div>
                <div class="meta-label">Heure</div>
                <div class="meta-value">{{ $date_edition->format('H:i') }}</div>
            </td>
        </tr>
    </table>
</div>

{{-- ── Contexte du rapport ── --}}
<div class="context-band">
    <table>
        <tr>
            <td><strong>Classe :</strong> {{ $classe?->nom ?? 'Toutes les classes' }}</td>
            <td>
                <strong>Période :</strong>
                @if(!empty($filters['date_debut']) || !empty($filters['date_fin']))
                    {{ !empty($filters['date_debut']) ? \Carbon\Carbon::parse($filters['date_debut'])->format('d/m/Y') : '—' }}
                    au
                    {{ !empty($filters['date_fin']) ? \Carbon\Carbon::parse($filters['date_fin'])->format('d/m/Y') : '—' }}
                @else
                    Toute la période
                @endif
            </td>
            <td>
                <strong>Filtre :</strong>
                @if(isset($filters['est_justifiee']) && $filters['est_justifiee'] !== '')
                    {{ $filters['est_justifiee'] === 'true' ? 'Justifiées uniquement' : 'Non justifiées uniquement' }}
                @else
                    Toutes
                @endif
            </td>
            <td><strong>Édité par :</strong> {{ auth()->user()?->name ?? '—' }}</td>
        </tr>
    </table>
</div>

{{-- ── Stats ── --}}
<table class="stats-row">
    <tr>
        <td style="padding: 0 5px 10px 0;">
            <table width="100%"><tr>
                <td style="padding-right: 6px;">
                    <div class="stat-box stat-total">
                        <div class="stat-value">{{ $stats['total'] }}</div>
                        <div class="stat-label">Total absences</div>
                    </div>
                </td>
                <td style="padding-right: 6px;">
                    <div class="stat-box stat-ok">
                        <div class="stat-value">{{ $stats['justifiees'] }}</div>
                        <div class="stat-label">Justifiées</div>
                    </div>
                </td>
                <td>
                    <div class="stat-box stat-nok">
                        <div class="stat-value">{{ $stats['non_justifiees'] }}</div>
                        <div class="stat-label">Non justifiées</div>
                    </div>
                </td>
            </tr></table>
        </td>
    </tr>
</table>

{{-- ── Tableau des absences ── --}}
@if($absences->isEmpty())
    <p style="text-align:center; color:#94a3b8; padding: 20px 0;">Aucune absence à afficher pour les critères sélectionnés.</p>
@else
<table class="listing">
    <thead>
        <tr>
            <th style="width:4%">N°</th>
            <th style="width:9%">Date</th>
            <th style="width:22%">Élève</th>
            <th style="width:8%">Matricule</th>
            <th style="width:10%">Classe</th>
            <th style="width:10%">Type</th>
            <th style="width:12%">Motif</th>
            <th style="width:8%">Justifiée</th>
            <th style="width:9%">Parent notifié</th>
            <th style="width:8%">Justificatif</th>
        </tr>
    </thead>
    <tbody>
        @foreach($absences as $i => $absence)
        @php
            $typeLabels  = ['matin' => 'Matin', 'apres_midi' => 'Après-midi', 'journee' => 'Journée'];
            $motifLabels = ['maladie' => 'Maladie', 'sans_motif' => 'Sans motif', 'deces_famille' => 'Décès famille', 'autre' => 'Autre'];
        @endphp
        <tr>
            <td style="text-align:center; color:#64748b;">{{ $i + 1 }}</td>
            <td style="font-family: monospace; font-size:10px;">
                {{ optional($absence->date_absence)->format('d/m/Y') }}
            </td>
            <td>
                <strong>{{ $absence->inscription?->eleve?->nom }}</strong>
                {{ $absence->inscription?->eleve?->prenoms }}
            </td>
            <td style="font-family: monospace; font-size:9px; color:#64748b;">
                {{ $absence->inscription?->eleve?->matricule }}
            </td>
            <td>{{ $absence->inscription?->classe?->nom }}</td>
            <td>
                <span class="badge badge-{{ $absence->type }}">
                    {{ $typeLabels[$absence->type] ?? $absence->type }}
                </span>
            </td>
            <td>{{ $motifLabels[$absence->motif] ?? $absence->motif }}</td>
            <td style="text-align:center;">
                @if($absence->est_justifiee)
                    <span class="badge badge-oui">✓ Oui</span>
                @else
                    <span class="badge badge-non">✗ Non</span>
                @endif
            </td>
            <td style="text-align:center;">
                @if($absence->parent_notifie)
                    <span class="badge badge-oui">✓ Oui</span>
                @else
                    <span class="badge badge-non">✗ Non</span>
                @endif
            </td>
            <td style="font-size:9px; color:#64748b;">{{ $absence->justificatif ?? '—' }}</td>
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
                <div class="footer-total">
                    Total : <strong>{{ $stats['total'] }} absence(s)</strong>
                    &nbsp;·&nbsp;
                    <span style="color:#16a34a;">✓ {{ $stats['justifiees'] }} justifiée(s)</span>
                    &nbsp;·&nbsp;
                    <span style="color:#dc2626;">✗ {{ $stats['non_justifiees'] }} non justifiée(s)</span>
                </div>
                <div class="watermark" style="margin-top:8px;">
                    Document généré le {{ $date_edition->format('d/m/Y à H:i') }} — ERP Scolaire CI
                </div>
            </td>
            <td style="text-align:right; width:200px;">
                <div class="signature-block">
                    <div style="font-weight:bold; color:#1e293b;">
                        {{ $etablissement?->directeur_nom ? 'Le Directeur' : 'La Direction' }}
                    </div>
                    @if($etablissement?->directeur_nom)
                        <div style="color:#475569; font-size:10px;">{{ $etablissement->directeur_nom }}</div>
                    @endif
                    <div class="signature-line"></div>
                </div>
            </td>
        </tr>
    </table>
</div>

</body>
</html>