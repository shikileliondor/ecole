import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { useMemo, useState } from 'react';

type ParentRow = { id: number; nom_complet: string; telephone: string | null; eleves: Array<{ id: number; nom_complet: string }>; eleve_principal: { id: number; nom_complet: string } | null };
type Props = {
  classes: Array<{ id: number; nom: string }>;
  parents: ParentRow[];
  templates?: {
    modele_relance_finance?: string;
    modele_confirmation_paiement?: string;
    modele_rappel_inscription?: string;
  };
};

export default function SmsParents({ classes, parents, templates }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useForm({ scope: 'single', parent_id: '', classe_id: '', message: '', senderName: '' });

  const filteredParents = useMemo(() => {
    if (form.data.scope !== 'class') return parents;
    return parents;
  }, [parents, form.data.scope]);

  const recipientsCount = form.data.scope === 'single' ? (form.data.parent_id ? 1 : 0) : filteredParents.length;
  const submit = () => form.post(route('communication.sms.send'), { onSuccess: () => setConfirmOpen(false) });
  const presetTemplates = [
    { key: 'modele_relance_finance', label: 'Relance finance', content: templates?.modele_relance_finance ?? '' },
    { key: 'modele_confirmation_paiement', label: 'Confirmation paiement', content: templates?.modele_confirmation_paiement ?? '' },
    { key: 'modele_rappel_inscription', label: 'Rappel inscription', content: templates?.modele_rappel_inscription ?? '' },
  ];

  return (
    <AppLayout title="Communication SMS">
      <Head title="Communication SMS" />
      <div className="space-y-6 p-4 md:p-6">
        <Card><CardHeader><CardTitle>Envoyer un SMS aux tuteurs</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Cible</Label><Select value={form.data.scope} onValueChange={(v) => form.setData('scope', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Un seul parent</SelectItem><SelectItem value="class">Parents d'une classe</SelectItem><SelectItem value="all">Tous les parents</SelectItem></SelectContent></Select></div>
            <div><Label>Sender name (optionnel)</Label><Input value={form.data.senderName} onChange={(e) => form.setData('senderName', e.target.value)} maxLength={11} /></div>
          </div>
          {form.data.scope === 'single' && <div><Label>Parent</Label><Select value={form.data.parent_id || 'none'} onValueChange={(v) => form.setData('parent_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sélectionner un parent" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{parents.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nom_complet} ({p.telephone ?? 'N/A'})</SelectItem>)}</SelectContent></Select></div>}
          {form.data.scope === 'class' && <div><Label>Classe</Label><Select value={form.data.classe_id || 'none'} onValueChange={(v) => form.setData('classe_id', v === 'none' ? '' : v)}><SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger><SelectContent><SelectItem value="none">Sélectionner</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}</SelectContent></Select></div>}
          <div><Label>Message</Label><Textarea value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} rows={5} /><p className="mt-1 text-xs text-slate-500">{form.data.message.length}/600 caractères</p></div>
          <div className="flex flex-wrap gap-2">
            {presetTemplates.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="outline"
                size="sm"
                disabled={!preset.content}
                onClick={() => form.setData('message', preset.content)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">Destinataires estimés: <strong>{recipientsCount}</strong></div>
          <Button onClick={() => setConfirmOpen(true)} disabled={form.processing || recipientsCount === 0 || !form.data.message.trim()}>Envoyer</Button>
        </CardContent></Card>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Confirmer l'envoi SMS</DialogTitle></DialogHeader><p className="text-sm text-slate-600">Vous allez envoyer ce message à {recipientsCount} tuteur(s). Confirmer ?</p><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Annuler</Button><Button onClick={submit} disabled={form.processing}>{form.processing ? 'Envoi...' : 'Confirmer et envoyer'}</Button></DialogFooter></DialogContent></Dialog>
    </AppLayout>
  );
}
