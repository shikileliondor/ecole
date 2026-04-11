import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import type { PaginationLink, PaginationMeta } from '@/types/eleve';

type PaginationProps = {
    links: PaginationLink[];
    meta: PaginationMeta;
};

function decodeLabel(label: string): string {
    return label.replace('&laquo;', '«').replace('&raquo;', '»');
}

export default function Pagination({ links, meta }: PaginationProps) {
    if (!links.length) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row">
            <p className="text-sm text-gray-500">
                Affichage de {meta.from ?? 0} à {meta.to ?? 0} sur {meta.total} résultats
            </p>

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
        </div>
    );
}
