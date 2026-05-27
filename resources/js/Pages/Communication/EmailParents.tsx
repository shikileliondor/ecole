import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { useMemo, useState } from 'react';

type EleveRow = { id: number; nom_complet: string; parents: Array<{ id: number; nom_complet: string; email: string | null }> };
type Props = { classes: Array<{ id: number; nom: string }>; eleves: EleveRow[]; variables: string[] };

export default function EmailParents({ classes, eleves, variables }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useForm({ scope: 'single', eleve_id: '', classe_id: '', subject: '', message: '' });

  const recipientsCount = useMemo(() => {
    if (form.data.scope === 'single') {
      const e = eleves.find((x) => String(x.id) === form.data.eleve_id);
      return e ? e.parents.length : 0;
    }
    if (form.data.scope === 'all') {
      return eleves.reduce((sum, e) => sum + e.parents.length, 0);
    }
    return 0;
  }, [form.data.scope, form.data.eleve_id, eleves]);

  const submit = () => form.post(route('communication.email.send'), { onSuccess: () => setConfirmOpen(false) });

  return (
    <AppLayout title="Communication Email">
      <Head title="Communication Email" />
      <div className="space-y-6 p-4 md:p-6">
        <Card><CardHeader><CardTitle>Envoyer un email aux parents</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><Label>Cible</Label><Select value={form.data.scope} onValueChange={(v) => form.setData('scope', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Parents d'un élève</SelectItem><SelectItem value="class">Parents d'une classe</SelectItem><SelectItem value="all">Tous les parents</SelectItem></SelectContent></Select></div>
          {form.data.scope === 'single' && <div><Label>Élève</Label><Select value={form.data.eleve_id || 'none'} onValueChange={(v) => form.setData('eleve_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sélectionner un élève" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{eleves.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.nom_complet}</SelectItem>)}</SelectContent></Select></div>}
          {form.data.scope === 'class' && <div><Label>Classe</Label><Select value={form.data.classe_id || 'none'} onValueChange={(v) => form.setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>}
          <div><Label>Objet</Label><Input value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} /></div>
          <div><Label>Message</Label><Textarea rows={7} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} /></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Variables disponibles: {variables.join(', ')}</div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Destinataires estimés: <strong>{recipientsCount}</strong></div>
          <Button onClick={() => setConfirmOpen(true)} disabled={form.processing || !form.data.subject.trim() || !form.data.message.trim()}>Envoyer</Button>
        </CardContent></Card>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Confirmer l'envoi Email</DialogTitle></DialogHeader><p className="text-sm text-slate-600">Confirmer l'envoi à {recipientsCount} parent(s) ?</p><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Annuler</Button><Button onClick={submit} disabled={form.processing}>{form.processing ? 'Envoi...' : 'Confirmer et envoyer'}</Button></DialogFooter></DialogContent></Dialog>
    </AppLayout>
  );
}
