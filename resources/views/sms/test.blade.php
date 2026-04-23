<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test envoi SMS Orange</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .success { background: #eafaf1; border-color: #27ae60; }
        .error { background: #fff1f0; border-color: #e74c3c; }
        .field { margin-bottom: 1rem; }
        label { display: block; font-weight: 600; margin-bottom: .35rem; }
        input, textarea { width: 100%; padding: .6rem; border: 1px solid #ccc; border-radius: 6px; }
        button { background: #2563eb; color: white; border: 0; padding: .7rem 1rem; border-radius: 6px; cursor: pointer; }
        ul { margin: .3rem 0 0 1.2rem; }
        code { background: #f5f5f5; padding: .15rem .35rem; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Test SMS Orange (Côte d'Ivoire)</h1>
    <p>Exemple numéro: <code>0799245071</code>, <code>+2250799245071</code>.</p>

    <div class="card" style="background:#fff9db;border-color:#f59f00;">
        <strong>Important:</strong> <code>accepted</code> signifie "accepté par l'API Orange", pas forcément livré sur le téléphone.
        La livraison finale dépend des Delivery Receipts (DR).
    </div>

    @if(session('sms_success'))
        <div class="card success">
            <strong>SMS soumis à Orange ✅</strong>
            <ul>
                <li>ID local: {{ session('sms_success.id') }}</li>
                <li>ProviderMessageId: {{ session('sms_success.providerMessageId') ?? '-' }}</li>
                <li>Status: {{ session('sms_success.status') }}</li>
                <li>Livraison finale: en attente du DR (delivery receipt)</li>
            </ul>
        </div>
    @endif

    @if(session('sms_error'))
        <div class="card error">
            <strong>Échec envoi ❌</strong>
            <ul>
                <li>ID local: {{ session('sms_error.id') }}</li>
                <li>Code: {{ session('sms_error.code') }}</li>
                <li>Message: {{ session('sms_error.message') }}</li>
            </ul>
        </div>
    @endif

    @if($errors->any())
        <div class="card error">
            <strong>Erreurs de validation ⚠️</strong>
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('sms.test.store') }}" class="card">
        @csrf

        <div class="field">
            <label for="to">Numéro destinataire</label>
            <input id="to" name="to" value="{{ old('to', '0799245071') }}" required>
        </div>

        <div class="field">
            <label for="senderName">Sender name personnalisé (optionnel)</label>
            <input id="senderName" name="senderName" value="{{ old('senderName') }}" maxlength="11" placeholder="Laisser vide pour sender par défaut">
        </div>

        <div class="field">
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="4" required>{{ old('message', 'Bonjour depuis la vue de test') }}</textarea>
        </div>

        <button type="submit">Envoyer le SMS</button>
    </form>
</body>
</html>
