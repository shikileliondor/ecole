import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, type ReactNode } from 'react';

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: ReactNode;
    error?: string;
}

export default function InputWithIcon({
    icon,
    error,
    className,
    ...props
}: InputWithIconProps) {
    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </span>

            <Input
                {...props}
                className={cn(
                    'h-11 border border-gray-200 rounded-md pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    error ? 'border-red-400 focus:ring-red-500' : '',
                    className,
                )}
            />
        </div>
    );
}
