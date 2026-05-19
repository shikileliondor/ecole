import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import type { PaginationLink } from '@/types/eleve';

type PaginationProps = {
    links: PaginationLink[];
};

function decodeLabel(label: string): string {
    return label.replace('&laquo;', '«').replace('&raquo;', '»');
}

export default function Pagination({ links }: PaginationProps) {
    if (!links.length) {
        return null;
    }
    return (
        <div className="flex flex-wrap items-center gap-2">
                {links.map((link, index) => {
                    const isEdge = index === 0 || index === links.length - 1;
                    const baseClass = link.active
                        ? 'bg-[#1a56a0] text-white hover:bg-[#164983]'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';

                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`${baseClass}`}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url, { preserveState: true, replace: true })}
                        >
                            {isEdge ? (index === 0 ? 'Précédent' : 'Suivant') : decodeLabel(link.label)}
                        </Button>
                    );
                })}
            </div>
    );
}
