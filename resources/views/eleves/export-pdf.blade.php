<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des élèves</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; }
        .header { width: 100%; margin-bottom: 14px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .title { text-align: center; font-size: 20px; font-weight: bold; margin: 8px 0 2px; }
        .subtitle { text-align: center; font-size: 12px; color: #475569; }
        .date-edition { text-align: right; font-size: 11px; color: #64748b; }
        .school { font-size: 16px; font-weight: bold; }
        .muted { color: #64748b; font-size: 11px; }
        table.listing { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .listing th { background: #1a56a0; color: #fff; text-align: left; font-size: 10px; padding: 6px; border: 1px solid #e2e8f0; }
        .listing td { padding: 5px; border: 1px solid #e2e8f0; font-size: 10px; }
        .listing tbody tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 20px; width: 100%; }
        .signature { text-align: right; margin-top: 35px; }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 33%;">
                    @if($logoPath)
                        <img src="{{ $logoPath }}" alt="Logo" style="width: 65px;">
                    @endif
                    <div class="school">{{ $etablissement?->nom ?? 'Établissement scolaire' }}</div>
                    <div class="muted">{{ $etablissement?->adresse_complete ?: 'Adresse non renseignée' }}</div>
                    <div class="muted">{{ $etablissement?->contact_telephone ?? '' }}</div>
                </td>
                <td style="width: 34%;">
                    <div class="title">LISTE DES ÉLÈVES</div>
                    <div class="subtitle">
                        Classe : {{ $classe?->nom ?? 'Toutes classes' }} |
                        Année scolaire : {{ $anneeScolaire ?: '—' }}
                    </div>
                </td>
                <td style="width: 33%;" class="date-edition">Date d'édition : {{ $date_edition->format('d/m/Y H:i') }}</td>
            </tr>
        </table>
    </div>

    <table class="listing">
        <thead>
            <tr>
                <th>N°</th>
                <th>Matricule</th>
                <th>Nom et Prénoms</th>
                <th>Sexe</th>
                <th>Date naissance</th>
                <th>Parent</th>
                <th>Téléphone</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @forelse($eleves as $eleve)
                <tr>
                    <td>{{ $eleve['numero'] }}</td>
                    <td>{{ $eleve['matricule'] }}</td>
                    <td>{{ $eleve['nom_complet'] }}</td>
                    <td>{{ $eleve['sexe'] }}</td>
                    <td>{{ $eleve['date_naissance'] }}</td>
                    <td>{{ $eleve['parent'] ?: '—' }}</td>
                    <td>{{ $eleve['telephone'] ?: '—' }}</td>
                    <td>{{ $eleve['statut'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center; color: #64748b;">Aucun élève trouvé.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <div><strong>Total élèves : {{ $eleves->count() }}</strong></div>
        <div class="signature">
            <div>Le Directeur</div>
            <div style="margin-top: 40px;">__________________________</div>
        </div>
    </div>
</body>
</html>
