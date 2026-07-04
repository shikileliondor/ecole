import { AlertCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type FormErrorAlertProps = {
    errors?: Record<string, unknown>;
    error?: string | null;
};

function collectMessages(value: unknown): string[] {
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    if (Array.isArray(value)) return value.flatMap(collectMessages);
    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).flatMap(collectMessages);
    }

    return [];
}

export default function FormErrorAlert({ errors = {}, error }: FormErrorAlertProps) {
    const messages = useMemo(
        () => [...new Set([...collectMessages(error), ...collectMessages(errors)])],
        [error, errors],
    );
    const signature = messages.join('\n');
    const [dismissedSignature, setDismissedSignature] = useState('');

    useEffect(() => {
        if (signature && signature !== dismissedSignature) setDismissedSignature('');
    }, [signature]);

    if (!signature || dismissedSignature === signature) return null;

    return (
        <div
            role="alert"
            aria-live="assertive"
            className="fixed right-4 top-20 z-[100] w-[calc(100%-2rem)] max-w-md rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-2xl dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
            <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold">Le formulaire contient une erreur</p>
                    {messages.length === 1 ? (
                        <p className="mt-1 text-sm">{messages[0]}</p>
                    ) : (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                            {messages.map((message) => <li key={message}>{message}</li>)}
                        </ul>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setDismissedSignature(signature)}
                    className="rounded-md p-1 text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
                    aria-label="Fermer le message d'erreur"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
