import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';

type Props = { inscription: any };

export default function InscriptionsShow({ inscription }: Props) {
    return (
        <AppLayout title="Détail inscription">
            <Head title="Détail inscription" />
            <div className="space-y-4">
                <Card><CardContent className="space-y-2 pt-6">
                    <h1 className="text-xl font-semibold">{inscription.eleve?.matricule} - {inscription.eleve?.nom} {inscription.eleve?.prenoms}</h1>
                    <p>Classe: {inscription.classe?.nom}</p>
                    <p>Année: {inscription.annee_scolaire?.libelle}</p>
                    <p>Date inscription: {inscription.date_inscription}</p>
                    <p>Statut: {inscription.statut}</p>
                    <p>Boursier: {inscription.eleve?.est_boursier ? 'Oui' : 'Non'}</p>
                </CardContent></Card>

                <Card><CardContent className="pt-6">
                    <h2 className="font-semibold">Documents</h2>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                        {inscription.documents?.length ? inscription.documents.map((d: any) => <li key={d.id}>{d.libelle}</li>) : <li>Aucun document</li>}
                    </ul>
                </CardContent></Card>

                <div className="flex gap-2">
                    <Link href={route('inscriptions.edit', inscription.id)}><Button>Modifier</Button></Link>
                    <Link href={route('inscriptions.index')}><Button variant="outline">Retour liste</Button></Link>
                </div>
            </div>
        </AppLayout>
    );
}
