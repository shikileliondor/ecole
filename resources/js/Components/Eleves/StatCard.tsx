import { type ReactNode } from 'react';

type StatCardProps = {
    icon: ReactNode;
    label: string;
    value: string | number;
    color: string;
    subtitle?: string;
};

export default function StatCard({ icon, label, value, color, subtitle }: StatCardProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">{label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>{icon}</div>
            </div>
            <p className="text-2xl font-medium text-gray-800">{value}</p>
            {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
        </div>
    );
}
