type NiveauBadgeProps = {
    niveau: string;
};

const colorMap: Record<string, string> = {
    CP1: 'bg-blue-100 text-blue-700',
    CP2: 'bg-blue-100 text-blue-700',
    CE1: 'bg-green-100 text-green-700',
    CE2: 'bg-green-100 text-green-700',
    CM1: 'bg-amber-100 text-amber-700',
    CM2: 'bg-amber-100 text-amber-700',
};

export default function NiveauBadge({ niveau }: NiveauBadgeProps) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colorMap[niveau] ?? 'bg-gray-100 text-gray-700'}`}>
            {niveau}
        </span>
    );
}
