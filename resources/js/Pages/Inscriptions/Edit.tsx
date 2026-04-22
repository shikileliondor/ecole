import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

type Props = { inscription: any; classes: Array<any> };

export default function InscriptionsEdit({ inscription, classes }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        classe_id: String(inscription.classe_id),
        date_inscription: inscription.date_inscription,
        statut: inscription.statut,
        boursier: Boolean(inscription.eleve?.est_boursier),
    });

    return (
        <AppLayout title="Modifier inscription">
            <Head title="Modifier inscription" />
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <h1 className="text-lg font-semibold">Modifier l'inscription</h1>
                    <div><Label>Classe</Label><Select value={data.classe_id || 'none'} onValueChange={(v) => setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Date inscription</Label><Input type="date" value={data.date_inscription} onChange={(e) => setData('date_inscription', e.target.value)} /></div>
                    <div><Label>Statut</Label><Select value={data.statut} onValueChange={(v) => setData('statut', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="inscrit">Inscrit</SelectItem><SelectItem value="transfere">Transféré</SelectItem><SelectItem value="abandonne">Abandonné</SelectItem></SelectContent></Select></div>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={data.boursier} onChange={(e) => setData('boursier', e.target.checked)} /> Boursier</label>
                    {Object.values(errors).length ? <FeedbackAlert type="error" message="Des erreurs sont présentes." /> : null}
                    <div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => history.back()}>Annuler</Button><Button type="button" disabled={processing} onClick={() => put(route('inscriptions.update', inscription.id))}>Enregistrer</Button></div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
