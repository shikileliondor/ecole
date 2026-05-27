<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport des absences</title>
    <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; color: #000; }
        h1 { font-size: 16pt; text-align: center; color: #1a56a0; margin-bottom: 4px; }
        .subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 16px; }
        .meta-box { border: 1px solid #c0c0c0; padding: 8px 12px; margin-bottom: 14px; font-size: 10pt; }
        .meta-box table { width: 100%; border-collapse: collapse; }
        .meta-box td { padding: 2px 10px 2px 0; }
        .stats { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .stats td { text-align: center; padding: 8px; border: 1px solid #c0c0c0; }
        .stats .label { font-size: 9pt; color: #555; }
        .stats .value { font-size: 18pt; font-weight: bold; }
        table.listing { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .listing th { background: #1a56a0; color: #fff; padding: 6px 8px; border: 1px solid #1a4f90; text-align: left; }
        .listing td { padding: 5px 8px; border: 1px solid #c0c0c0; }
        .listing tr:nth-child(even) td { background: #f5f5f5; }
        .footer { margin-top: 20px; font-size: 9pt; color: #888; text-align: center; }
        .sign { text-align: right; margin-top: 40px; font-size: 11pt; }
        .sign-line { margin-top: 38px; border-top: 1px solid #000; width: 180px; float: right; }
    </style>
</head>
<body>

<h1>RAPPORT DES ABSENCES</h1>
<div class="subtitle">{{ $etablissement?->nom ?? 'Établissement scolaire' }} — {{ $annee_active?->libelle ?? '' }}</div>

<div class="meta-box">
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
            <td><strong>Édité le :</strong> {{ $date_edition->format('d/m/Y à H:i') }}</td>
            <td><strong>Par :</strong> {{ auth()->user()?->name ?? '—' }}</td>
        </tr>
        @if($etablissement?->adresse_complete)
        <tr>
            <td colspan="2"><strong>Adresse :</strong> {{ $etablissement->adresse_complete }}</td>
            <td><strong>Tél :</strong> {{ $etablissement->contact_telephone ?? '—' }}</td>
            <td><strong>Agrément :</strong> {{ $etablissement->agrement_mena ?? '—' }}</td>
        </tr>
        @endif
    </table>
</div>

<table class="stats">
    <tr>
        <td><div class="value" style="color:#1a56a0;">{{ $stats['total'] }}</div><div class="label">Total absences</div></td>
        <td><div class="value" style="color:#16a34a;">{{ $stats['justifiees'] }}</div><div class="label">Justifiées</div></td>
        <td><div class="value" style="color:#dc2626;">{{ $stats['non_justifiees'] }}</div><div class="label">Non justifiées</div></td>
    </tr>
</table>

@if($absences->isEmpty())
    <p style="text-align:center; color:#888;">Aucune absence à afficher.</p>
@else
<table class="listing">
    <thead>
        <tr>
            <th>N°</th>
            <th>Date</th>
            <th>Élève</th>
            <th>Matricule</th>
            <th>Classe</th>
            <th>Type</th>
            <th>Motif</th>
            <th>Justifiée</th>
            <th>Parent notifié</th>
        </tr>
    </thead>
    <tbody>
        @foreach($absences as $i => $absence)
        @php
            $typeLabels  = ['matin' => 'Matin', 'apres_midi' => 'Après-midi', 'journee' => 'Journée'];
            $motifLabels = ['maladie' => 'Maladie', 'sans_motif' => 'Sans motif', 'deces_famille' => 'Décès famille', 'autre' => 'Autre'];
        @endphp
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ optional($absence->date_absence)->format('d/m/Y') }}</td>
            <td><strong>{{ $absence->inscription?->eleve?->nom }}</strong> {{ $absence->inscription?->eleve?->prenoms }}</td>
            <td>{{ $absence->inscription?->eleve?->matricule }}</td>
            <td>{{ $absence->inscription?->classe?->nom }}</td>
            <td>{{ $typeLabels[$absence->type] ?? $absence->type }}</td>
            <td>{{ $motifLabels[$absence->motif] ?? $absence->motif }}</td>
            <td>{{ $absence->est_justifiee ? 'Oui' : 'Non' }}</td>
            <td>{{ $absence->parent_notifie ? 'Oui' : 'Non' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<div class="sign">
    <div>{{ $etablissement?->directeur_nom ? 'Le Directeur : ' . $etablissement->directeur_nom : 'La Direction' }}</div>
    <div class="sign-line"></div>
</div>

<div class="footer">
    Document généré le {{ $date_edition->format('d/m/Y à H:i') }} — ERP Scolaire CI
</div>

</body>
</html>