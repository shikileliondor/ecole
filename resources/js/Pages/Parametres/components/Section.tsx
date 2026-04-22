import { type ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-start justify-between gap-3 text-left"
                aria-expanded={isOpen}
            >
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
                <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen ? <div className="mt-4">{children}</div> : null}
        </section>
    );
}
