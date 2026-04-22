import { InscriptionShowCard } from '@/Components/Inscriptions';
import { Button } from '@/Components/ui/button';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

type Props = { inscription: any };

export default function InscriptionsShow({ inscription }: Props) {
    return (
        <AppLayout title="Détail inscription">
            <Head title="Détail inscription" />

            <div className="space-y-6">
                <InscriptionShowCard inscription={inscription} />

                <div className="flex flex-wrap gap-2">
                    <Link href={route('inscriptions.edit', inscription.id)}>
                        <Button>Modifier</Button>
                    </Link>
                    <Link href={route('inscriptions.index')}>
                        <Button variant="outline">Retour liste</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
