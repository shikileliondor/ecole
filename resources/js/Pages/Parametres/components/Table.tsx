import { type ReactNode } from 'react';

export default function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600 dark:bg-gray-700/50 dark:text-gray-300">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-gray-700 dark:bg-gray-800 [&_td]:text-gray-700 dark:[&_td]:text-gray-300">{children}</tbody>
            </table>
        </div>
    );
}
