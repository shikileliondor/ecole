import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';

type EleveAvatarProps = {
    photo?: string | null;
    nom: string;
    prenoms: string;
    size?: 'sm' | 'md' | 'lg';
};

const sizeMap: Record<NonNullable<EleveAvatarProps['size']>, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
};

function buildColorFromName(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 65% 45%)`;
}

export default function EleveAvatar({ photo, nom, prenoms, size = 'md' }: EleveAvatarProps) {
    const initials = `${nom.charAt(0)}${prenoms.charAt(0)}`.toUpperCase();
    const bgColor = buildColorFromName(nom);

    return (
        <Avatar className={`${sizeMap[size]} border border-gray-200`}>
            {photo ? <AvatarImage src={photo} alt={`${nom} ${prenoms}`} className="object-cover" /> : null}
            <AvatarFallback style={{ backgroundColor: bgColor }} className="text-white">
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
