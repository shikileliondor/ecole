import { cn } from '@/lib/utils';
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import type { ComponentProps } from 'react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackAlertProps extends Omit<ComponentProps<'div'>, 'children'> {
    type?: FeedbackType;
    title?: string;
    message: string;
}

const typeStyles: Record<FeedbackType, string> = {
    success: 'border-green-300 bg-green-50 text-green-800',
    error: 'border-red-300 bg-red-50 text-red-800',
    warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
    info: 'border-blue-300 bg-blue-50 text-blue-800',
};

const icons = {
    success: CheckCircle2,
    error: CircleAlert,
    warning: TriangleAlert,
    info: Info,
} as const;

export default function FeedbackAlert({ type = 'info', title, message, className, ...props }: FeedbackAlertProps) {
    const Icon = icons[type];

    return (
        <div
            role="alert"
            className={cn(
                'flex items-start gap-2 rounded-xl border px-4 py-3 text-sm transition-all duration-200 ease-in-out motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.99]',
                typeStyles[type],
                className,
            )}
            {...props}
        >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
                {title ? <p className="font-semibold">{title}</p> : null}
                <p>{message}</p>
            </div>
        </div>
    );
}
