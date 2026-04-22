<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des élèves</title>
    <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1f2937; }
        .title { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 4pt; }
        .subtitle { text-align: center; color: #475569; margin-bottom: 14pt; }
        .meta { margin-bottom: 8pt; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1a56a0; color: #fff; text-align: left; border: 1px solid #d1d5db; padding: 6px; }
        td { border: 1px solid #d1d5db; padding: 6px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        .total { margin-top: 12pt; font-weight: bold; }
    </style>
</head>
<body>
<div class="title">LISTE DES ÉLÈVES</div>
<div class="subtitle">Classe : {{ $classe?->nom ?? 'Toutes classes' }}</div>
<div class="meta">Date d'édition : {{ $date_edition->format('d/m/Y H:i') }}</div>

<table>
    <thead>
    <tr>
        <th>N°</th>
        <th>Matricule</th>
        <th>Nom et Prénoms</th>
        <th>Sexe</th>
        <th>Date Naissance</th>
        <th>Parent</th>
        <th>Téléphone</th>
        <th>Statut</th>
    </tr>
    </thead>
    <tbody>
    @foreach($eleves as $index => $eleve)
        @php
            $parent = $eleve->parentsTuteurs->firstWhere('pivot.est_principal', true) ?? $eleve->parentsTuteurs->first();
        @endphp
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $eleve->matricule }}</td>
            <td>{{ $eleve->nom }} {{ $eleve->prenoms }}</td>
            <td>{{ $eleve->sexe === 'M' ? 'Garçon' : 'Fille' }}</td>
            <td>{{ optional($eleve->date_naissance)->format('d/m/Y') ?? $eleve->date_naissance }}</td>
            <td>{{ $parent?->nom }} {{ $parent?->prenoms }}</td>
            <td>{{ $parent?->telephone_1 }}</td>
            <td>{{ ucfirst($eleve->statut) }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

<div class="total">Total élèves : {{ $eleves->count() }}</div>
</body>
</html>
