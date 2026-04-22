import { type ReactNode } from 'react';

export default function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
            </table>
        </div>
    );
}
