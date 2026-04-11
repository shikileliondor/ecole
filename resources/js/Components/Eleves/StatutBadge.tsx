type StatutBadgeProps = {
    statut: string;
};

const config = {
    actif: { className: 'bg-green-100 text-green-700', label: 'Actif' },
    transfere: { className: 'bg-orange-100 text-orange-700', label: 'Transféré' },
    exclu: { className: 'bg-red-100 text-red-700', label: 'Exclu' },
    sorti: { className: 'bg-gray-100 text-gray-700', label: 'Sorti' },
} as const;

export default function StatutBadge({ statut }: StatutBadgeProps) {
    const current = config[statut as keyof typeof config] ?? { className: 'bg-gray-100 text-gray-700', label: statut };

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${current.className}`}>{current.label}</span>;
}
