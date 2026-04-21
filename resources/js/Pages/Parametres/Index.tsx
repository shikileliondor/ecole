import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Textarea } from '@/Components/ui/textarea';

type Item = { id: number; [key: string]: unknown };

type Props = {
    annees: Array<Item & { libelle: string; date_debut: string; date_fin: string; est_active: boolean }>;
    periodes: Array<Item & { libelle: string; date_debut: string; date_fin: string; ordre: number; annee_scolaire_id: number }>;
    niveaux: Array<Item & { libelle: string; cycle: string }>;
    classes: Array<Item & { nom: string; niveau?: { libelle: string } }>;
    matieres: Array<Item & { libelle: string; coefficient: number }>;
    typesFrais: Array<Item & { libelle: string; montant: number; niveau?: { libelle: string } }>;
    modesPaiement: Array<Item & { libelle: string; code?: string; ordre: number; est_actif: boolean }>;
    statutsInscription: Array<Item & { libelle: string; code?: string; ordre: number; est_actif: boolean }>;
    roles: Array<Item & { name: string; permissions: Array<{ name: string }> }>;
    permissions: Array<Item & { name: string }>;
    modelesImpression: Array<Item & { type_document: string; nom: string; est_defaut: boolean }>;
    typesDocument: string[];
};

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">{title}</h2>
            {children}
        </section>
    );
}

export default function ParametresIndex(props: Props) {
    const anneeForm = useForm({ libelle: '', date_debut: '', date_fin: '' });
    const periodeForm = useForm({ annee_scolaire_id: '', libelle: '', date_debut: '', date_fin: '', ordre: 1 });
    const modeForm = useForm({ libelle: '', code: '', ordre: 1 });
    const statutForm = useForm({ libelle: '', code: '', ordre: 1 });
    const permissionForm = useForm({ name: '' });
    const roleForm = useForm({ name: '', permissions: [] as string[] });
    const modeleForm = useForm({ type_document: props.typesDocument[0] ?? 'bulletin', nom: '', description: '', template_html: '', est_defaut: false });

    return (
        <AppLayout title="Paramètres">
            <Head title="Paramètres" />
            <div className="space-y-4">
                <Card title="Années scolaires (une seule active)">
                    <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); anneeForm.post(route('parametres.annees.store')); }}>
                        <Input placeholder="2026-2027" value={anneeForm.data.libelle} onChange={(e) => anneeForm.setData('libelle', e.target.value)} />
                        <Input type="date" value={anneeForm.data.date_debut} onChange={(e) => anneeForm.setData('date_debut', e.target.value)} />
                        <Input type="date" value={anneeForm.data.date_fin} onChange={(e) => anneeForm.setData('date_fin', e.target.value)} />
                        <Button type="submit">Ajouter</Button>
                    </form>
                    <div className="mt-3 space-y-2 text-sm">
                        {props.annees.map((annee) => (
                            <div key={annee.id} className="flex items-center justify-between rounded border p-2">
                                <span>{annee.libelle} · {annee.date_debut} → {annee.date_fin}</span>
                                {annee.est_active ? <span className="text-xs text-green-600">Active</span> : <Button size="sm" variant="outline" onClick={() => router.patch(route('parametres.annees.activate', annee.id))}>Activer</Button>}
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card title="Périodes académiques personnalisables">
                        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); periodeForm.post(route('parametres.periodes.store')); }}>
                            <select className="rounded border p-2" value={periodeForm.data.annee_scolaire_id} onChange={(e) => periodeForm.setData('annee_scolaire_id', e.target.value)}>
                                <option value="">Année scolaire</option>
                                {props.annees.map((annee) => <option key={annee.id} value={String(annee.id)}>{annee.libelle}</option>)}
                            </select>
                            <Input placeholder="Trimestre 1" value={periodeForm.data.libelle} onChange={(e) => periodeForm.setData('libelle', e.target.value)} />
                            <div className="grid grid-cols-3 gap-2">
                                <Input type="date" value={periodeForm.data.date_debut} onChange={(e) => periodeForm.setData('date_debut', e.target.value)} />
                                <Input type="date" value={periodeForm.data.date_fin} onChange={(e) => periodeForm.setData('date_fin', e.target.value)} />
                                <Input type="number" min={1} value={periodeForm.data.ordre} onChange={(e) => periodeForm.setData('ordre', Number(e.target.value))} />
                            </div>
                            <Button type="submit">Ajouter</Button>
                        </form>
                        <ul className="mt-3 space-y-1 text-sm">
                            {props.periodes.map((item) => <li key={item.id}>• {item.libelle} ({item.date_debut} → {item.date_fin})</li>)}
                        </ul>
                    </Card>

                    <Card title="Modes de paiement">
                        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); modeForm.post(route('parametres.modes-paiement.store')); }}>
                            <Input placeholder="Orange Money" value={modeForm.data.libelle} onChange={(e) => modeForm.setData('libelle', e.target.value)} />
                            <Input placeholder="orange_money" value={modeForm.data.code} onChange={(e) => modeForm.setData('code', e.target.value)} />
                            <Input type="number" min={1} value={modeForm.data.ordre} onChange={(e) => modeForm.setData('ordre', Number(e.target.value))} />
                            <Button type="submit">Ajouter</Button>
                        </form>
                        <ul className="mt-3 space-y-1 text-sm">
                            {props.modesPaiement.map((item) => <li key={item.id}>• {item.libelle} ({item.code || 'sans code'})</li>)}
                        </ul>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card title="Statuts d'inscription (sans suppression)">
                        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); statutForm.post(route('parametres.statuts-inscription.store')); }}>
                            <Input placeholder="Préinscrit" value={statutForm.data.libelle} onChange={(e) => statutForm.setData('libelle', e.target.value)} />
                            <Input placeholder="preinscrit" value={statutForm.data.code} onChange={(e) => statutForm.setData('code', e.target.value)} />
                            <Input type="number" min={1} value={statutForm.data.ordre} onChange={(e) => statutForm.setData('ordre', Number(e.target.value))} />
                            <Button type="submit">Ajouter</Button>
                        </form>
                        <ul className="mt-3 space-y-1 text-sm">
                            {props.statutsInscription.map((item) => <li key={item.id}>• {item.libelle}</li>)}
                        </ul>
                    </Card>

                    <Card title="Rôles et permissions (v1 simplifié)">
                        <form className="mb-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); permissionForm.post(route('parametres.permissions.store')); }}>
                            <Input placeholder="eleves.create" value={permissionForm.data.name} onChange={(e) => permissionForm.setData('name', e.target.value)} />
                            <Button type="submit" variant="outline">Ajouter permission</Button>
                        </form>
                        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); roleForm.post(route('parametres.roles.store')); }}>
                            <Input placeholder="Administration" value={roleForm.data.name} onChange={(e) => roleForm.setData('name', e.target.value)} />
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {props.permissions.map((permission) => (
                                    <label key={permission.id} className="flex items-center gap-2 rounded border p-2">
                                        <Checkbox checked={roleForm.data.permissions.includes(permission.name)} onCheckedChange={(checked) => {
                                            roleForm.setData('permissions', checked
                                                ? [...roleForm.data.permissions, permission.name]
                                                : roleForm.data.permissions.filter((p) => p !== permission.name));
                                        }} />
                                        {permission.name}
                                    </label>
                                ))}
                            </div>
                            <Button type="submit">Enregistrer rôle</Button>
                        </form>
                        <ul className="mt-3 space-y-1 text-sm">
                            {props.roles.map((role) => <li key={role.id}>• {role.name} ({role.permissions.length} permissions)</li>)}
                        </ul>
                    </Card>
                </div>

                <Card title="Modèles PDF (plusieurs modèles, choix libre)">
                    <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); modeleForm.post(route('parametres.modeles-impression.store')); }}>
                        <select className="rounded border p-2" value={modeleForm.data.type_document} onChange={(e) => modeleForm.setData('type_document', e.target.value)}>
                            {props.typesDocument.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <Input placeholder="Bulletin premium" value={modeleForm.data.nom} onChange={(e) => modeleForm.setData('nom', e.target.value)} />
                        <Input placeholder="Description" value={modeleForm.data.description} onChange={(e) => modeleForm.setData('description', e.target.value)} />
                        <Textarea rows={5} placeholder="Template HTML/PDF avec variables..." value={modeleForm.data.template_html} onChange={(e) => modeleForm.setData('template_html', e.target.value)} />
                        <label className="flex items-center gap-2 text-sm"><Checkbox checked={modeleForm.data.est_defaut} onCheckedChange={(checked) => modeleForm.setData('est_defaut', Boolean(checked))} /> Définir par défaut</label>
                        <Button type="submit">Ajouter modèle</Button>
                    </form>
                    <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                        {props.modelesImpression.map((item) => <li key={item.id} className="rounded border p-2">• {item.type_document} / {item.nom} {item.est_defaut ? '(défaut)' : ''}</li>)}
                    </ul>
                </Card>

                <Card title="Référentiel existant (lecture)">
                    <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                        <p>Niveaux: {props.niveaux.length}</p>
                        <p>Classes: {props.classes.length}</p>
                        <p>Matières: {props.matieres.length}</p>
                        <p>Frais scolaires: {props.typesFrais.length}</p>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
