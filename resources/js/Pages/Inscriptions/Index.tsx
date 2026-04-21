import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useState } from 'react';

type Props = {
    inscriptions: { data: Array<any>; links: Array<any> };
    filters: { search?: string };
};

export default function InscriptionsIndex({ inscriptions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = () => {
        router.get(route('inscriptions.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Inscriptions">
            <Head title="Inscriptions" />
            <div className="space-y-4 rounded-xl bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Liste des inscriptions</h1>
                    <Link href={route('inscriptions.create')}><Button>Nouvelle inscription</Button></Link>
                </div>

                <div className="flex gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par élève ou matricule" />
                    <Button type="button" onClick={submitSearch}>Filtrer</Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">Matricule</th>
                                <th className="px-3 py-2">Élève</th>
                                <th className="px-3 py-2">Classe</th>
                                <th className="px-3 py-2">Année</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Statut</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscriptions.data.map((inscription) => (
                                <tr key={inscription.id} className="border-t">
                                    <td className="px-3 py-2">{inscription.eleve?.matricule}</td>
                                    <td className="px-3 py-2">{inscription.eleve?.nom} {inscription.eleve?.prenoms}</td>
                                    <td className="px-3 py-2">{inscription.classe?.nom}</td>
                                    <td className="px-3 py-2">{inscription.annee_scolaire?.libelle}</td>
                                    <td className="px-3 py-2">{inscription.date_inscription}</td>
                                    <td className="px-3 py-2">{inscription.statut}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <Link href={route('inscriptions.show', inscription.id)} className="text-blue-600">Détail</Link>
                                            <Link href={route('inscriptions.edit', inscription.id)} className="text-blue-600">Éditer</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
