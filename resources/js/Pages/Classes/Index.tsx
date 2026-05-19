import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Shared/Pagination';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import type { PaginationLink, PaginationMeta } from '@/types/eleve';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Pencil, Percent, Plus, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

type ClasseCard = { id:number; nom:string; statut:string; capacite_max?:number|null; effectif:number; niveau?:{id:number;libelle:string}|null; annee_scolaire?:{id:number;libelle:string}|null; anneeScolaire?:{id:number;libelle:string}|null };
type EmploiCreneau = { heure:string; matiere?:string|null; enseignant?:string|null; salle?:string|null };
type EmploiJour = { jour:string; creneaux:EmploiCreneau[] };
type DetailData = { classe:{ id:number; nom:string; statut:string; niveau?:string|null; annee?:string|null; salle?:string|null; capacite?:number|null; titulaire?:string|null }; stats:{ effectif:number; fillRate:number; moyenneClasse?:number|null; garcons:number; filles:number }; classement:Array<{rang:number; eleve:string; moyenne?:number|null}>; eleves:Array<{id?:number|null; nomComplet:string; sexe?:string|null; moyenne?:number|null; matricule?:string|null}>; emploiDuTemps:EmploiJour[] };
type Props = { classes:{data:ClasseCard[];links:PaginationLink[];meta?:PaginationMeta;from?:number|null;to?:number|null;total?:number}; selectedClasseId?:number|null; detail?:DetailData|null; filters:{search?:string|null;statut?:string|null}; errors?:Record<string,string> };

export default function ClassesIndex({ classes, selectedClasseId, detail, filters }: Props) {
  const [localFilters, setLocalFilters] = useState({ search: filters.search ?? '', statut: filters.statut ?? 'all' });
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [isScheduleCollapsed, setIsScheduleCollapsed] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nom: '', niveau_id: '', annee_scolaire_id: '', capacite_max: '', salle: '', statut: 'active' });

  useEffect(() => setIsScheduleCollapsed(false), [selectedClasseId]);
  useEffect(() => {
    if (!detail || !selectedClasseId) return;
    const selectedClasse = classes.data.find((c) => c.id === selectedClasseId);
    setEditForm({
      nom: detail.classe.nom ?? '',
      niveau_id: selectedClasse?.niveau?.id ? String(selectedClasse.niveau.id) : '',
      annee_scolaire_id: selectedClasse?.anneeScolaire?.id ? String(selectedClasse.anneeScolaire.id) : (selectedClasse?.annee_scolaire?.id ? String(selectedClasse.annee_scolaire.id) : ''),
      capacite_max: detail.classe.capacite != null ? String(detail.classe.capacite) : '',
      salle: detail.classe.salle ?? '',
      statut: detail.classe.statut ?? 'active',
    });
  }, [detail, selectedClasseId, classes.data]);

  const submitFilters = (next:{search:string;statut:string}) => router.get(route('classes.index'), { search: next.search || undefined, statut: next.statut === 'all' ? undefined : next.statut }, { preserveState: true, replace: true });
  const onSearchChange = (value:string) => { const next = { ...localFilters, search:value }; setLocalFilters(next); if (searchTimeout) window.clearTimeout(searchTimeout); const timeout = window.setTimeout(() => submitFilters(next), 300); setSearchTimeout(timeout); };

  const hasActiveFilters = localFilters.search.trim() !== '' || localFilters.statut !== 'all';
  const hasClasses = classes.data.length > 0;
  const hasNotes = Boolean(detail?.classement.some((r) => r.moyenne !== null && r.moyenne !== undefined));
  const hasSchedule = Boolean(detail?.emploiDuTemps.some((j) => j.creneaux.some((c) => c.matiere || c.enseignant || c.salle)));
  const femalePct = detail && detail.stats.effectif > 0 ? Math.round((detail.stats.filles / detail.stats.effectif) * 100) : 0;
  const malePct = detail && detail.stats.effectif > 0 ? Math.round((detail.stats.garcons / detail.stats.effectif) * 100) : 0;
  const rankingRows = useMemo(() => (detail?.classement ?? []).slice(0, 8), [detail?.classement]);
  const niveaux = useMemo(() => Array.from(new Map(classes.data.filter((c) => c.niveau?.id).map((c) => [c.niveau!.id, c.niveau!.libelle])).entries()), [classes.data]);
  const annees = useMemo(() => Array.from(new Map(classes.data.map((c) => c.anneeScolaire ?? c.annee_scolaire).filter(Boolean).map((a) => [a!.id, a!.libelle])).entries()), [classes.data]);
  const hasRankingData = Boolean((detail?.classement.length ?? 0) > 0);
  const hasStudentsData = Boolean((detail?.eleves.length ?? 0) > 0);
  const submitEdit = () => {
    if (!selectedClasseId) return;
    router.patch(route('classes.update', selectedClasseId), {
      nom: editForm.nom,
      niveau_id: Number(editForm.niveau_id),
      annee_scolaire_id: Number(editForm.annee_scolaire_id),
      capacite_max: editForm.capacite_max ? Number(editForm.capacite_max) : null,
      salle: editForm.salle || null,
      statut: editForm.statut,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditOpen(false);
        router.reload({ only: ['classes', 'detail', 'selectedClasseId'] });
      },
    });
  };

  return <AppLayout title="Classes"><Head title="Classes" />
    <div className="space-y-5 bg-slate-50 p-1">
      <div><h1 className="text-3xl font-bold text-slate-900">Classes</h1><p className="mt-1 text-sm text-slate-500">Consultez les informations globales de chaque classe : élèves, classement, taux et emploi du temps.</p></div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users className="h-4 w-4 text-[#0B63CE]"/>} iconWrap="bg-blue-50" label="Effectif" value={detail ? `${detail.stats.effectif}` : '--'} subtitle="Nombre d'élèves" />
        <StatCard icon={<Percent className="h-4 w-4 text-emerald-600"/>} iconWrap="bg-emerald-100" label="Taux de remplissage" value={detail ? `${Math.round(detail.stats.fillRate)}%` : '--'} subtitle={`Capacité : ${detail?.classe.capacite ?? '--'} élèves`} />
        <StatCard icon={<Trophy className="h-4 w-4 text-violet-600"/>} iconWrap="bg-violet-100" label="Moyenne classe" value={detail?.stats.moyenneClasse != null ? `${detail.stats.moyenneClasse}/20` : '--'} subtitle="Moyenne générale" />
        <StatCard icon={<Users className="h-4 w-4 text-orange-600"/>} iconWrap="bg-orange-100" label="Filles / Garçons" value={detail ? `${detail.stats.filles} / ${detail.stats.garcons}` : '--'} subtitle={detail ? `${femalePct}% / ${malePct}%` : '--'} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <section className="flex max-h-[calc(100vh-260px)] flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-900">Liste des classes</h2><button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"><Plus className="h-4 w-4"/></button></div>
          <div className="space-y-2"><Input value={localFilters.search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Rechercher un élève, une classe..." className="h-9"/><Select value={localFilters.statut} onValueChange={(value) => { const next = { ...localFilters, statut:value }; setLocalFilters(next); submitFilters(next); }}><SelectTrigger className="h-9"><SelectValue placeholder="Statut"/></SelectTrigger><SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="active">Actif</SelectItem><SelectItem value="inactive">Inactif</SelectItem></SelectContent></Select>{hasActiveFilters && <Button type="button" variant="outline" className="h-9 w-full" onClick={() => { const reset = { search: '', statut: 'all' }; setLocalFilters(reset); submitFilters(reset); }}>Réinitialiser</Button>}</div>
          <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">{hasClasses ? classes.data.map((classe) => { const isActive = classe.id === selectedClasseId; const cap = classe.capacite_max ?? 0; const fillRate = cap > 0 ? Math.round((classe.effectif / cap) * 100) : 0; return <button key={classe.id} type="button" onClick={() => router.get(route('classes.index'), { classe: classe.id, page: classes.meta?.current_page, search: localFilters.search || undefined, statut: localFilters.statut === 'all' ? undefined : localFilters.statut }, { preserveScroll: true, preserveState: true })} className={`w-full cursor-pointer rounded-xl border p-3 text-left ${isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{classe.nom}</p><span className={`rounded-full px-2 py-1 text-xs ${classe.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{classe.statut}</span></div><p className="mt-1 text-xs text-slate-500">{classe.niveau?.libelle ?? 'Niveau non défini'} • {classe.anneeScolaire?.libelle ?? classe.annee_scolaire?.libelle ?? 'Année non définie'}</p><div className="mt-2 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-slate-50 p-1.5 text-slate-600">Effectif <span className="font-semibold text-slate-900">{classe.effectif}</span></div><div className="rounded-lg bg-slate-50 p-1.5 text-slate-600">Taux <span className="font-semibold text-slate-900">{fillRate}%</span></div></div></button>; }) : <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Aucune classe trouvée.</div>}</div>
          <div className="mt-3 border-t border-slate-100 pt-3"><Pagination links={classes.links} meta={classes.meta ?? { from: classes.from ?? 0, to: classes.to ?? 0, total: classes.total ?? 0, current_page: 1, last_page: 1, per_page: 6 }} /></div>
        </section>

        <section className="space-y-4">{!detail ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Aucune classe sélectionnée.</div> : <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><h2 className="text-xl font-semibold text-slate-900">{detail.classe.nom}</h2><span className={`rounded-full px-2 py-1 text-xs ${detail.classe.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{detail.classe.statut}</span></div><p className="mt-1 text-sm text-slate-500">{detail.classe.niveau ?? 'Niveau non renseigné'} • Année scolaire {detail.classe.annee ?? 'Non renseignée'}</p><p className="text-sm text-slate-500">Enseignant principal : {detail.classe.titulaire ?? 'Non renseigné'}</p></div><Button variant="outline" className="h-9 border-slate-200 text-blue-700 hover:bg-blue-50" onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4"/>Modifier la classe</Button></div></div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-slate-900">Classement des élèves</h3>{rankingRows.length === 0 ? <p className="text-sm text-slate-500">Aucun élève dans cette classe.</p> : <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">#</th><th className="p-2">Élève</th><th className="p-2">Moyenne</th></tr></thead><tbody className="divide-y divide-slate-100">{rankingRows.map((row) => <tr key={`${row.rang}-${row.eleve}`}><td className="p-2 text-slate-700">{row.rang}</td><td className="p-2 text-slate-800">{row.eleve}</td><td className="p-2 text-slate-700">{row.moyenne != null ? `${row.moyenne}/20` : '--'}</td></tr>)}</tbody></table>}<Button variant="link" className="mt-2 h-auto p-0 text-sm text-blue-700" onClick={() => setIsRankingOpen(true)}>Voir tout le classement</Button>{!hasNotes && <p className="mt-1 text-xs text-slate-500">Aucune note disponible pour établir le classement.</p>}</div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-slate-900">Élèves de la classe</h3>{detail.eleves.length === 0 ? <p className="text-sm text-slate-500">Aucun élève dans cette classe.</p> : <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">Élève</th><th className="p-2">Matricule</th><th className="p-2">Sexe</th><th className="p-2">Moyenne</th></tr></thead><tbody className="divide-y divide-slate-100">{detail.eleves.slice(0, 8).map((e) => <tr key={`${e.id ?? e.nomComplet}`}><td className="p-2 text-slate-800">{e.nomComplet}</td><td className="p-2 text-slate-600">{e.matricule ?? '--'}</td><td className="p-2 text-slate-600">{e.sexe ?? '--'}</td><td className="p-2 text-slate-700">{e.moyenne != null ? `${e.moyenne}/20` : '--'}</td></tr>)}</tbody></table>}<Button variant="link" className="mt-2 h-auto p-0 text-sm text-blue-700" onClick={() => setIsStudentsOpen(true)}>Voir tous les élèves</Button></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-blue-600"/><h3 className="text-sm font-semibold text-slate-900">Emploi du temps</h3></div><Button variant="outline" size="sm" className="h-9 border-slate-200" onClick={() => setIsScheduleCollapsed((v) => !v)}>{isScheduleCollapsed ? 'Déplier' : 'Replier'}</Button><Button variant="outline" size="sm" className="h-9 border-slate-200 text-blue-700" onClick={() => router.get(route('emplois-du-temps.index'), { classe_id: detail?.classe.id })}>Configurer l'emploi du temps</Button></div>{!isScheduleCollapsed && (hasSchedule ? <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-[840px] w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">Heure</th>{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d)=><th key={d} className="p-2">{d}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{Array.from(new Set((detail.emploiDuTemps ?? []).flatMap((j) => j.creneaux.map((c) => c.heure)))).map((heure) => <tr key={heure}><td className="p-2 font-medium text-slate-700">{heure}</td>{['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((jour) => { const slot = detail.emploiDuTemps.find((j) => j.jour === jour)?.creneaux.find((c) => c.heure === heure); return <td key={`${jour}-${heure}`} className="p-2 align-top">{slot?.matiere ? <div><p className="font-medium text-slate-800">{slot.matiere}</p><p className="text-xs text-slate-500">{slot.enseignant ?? '--'}</p></div> : <span className="text-slate-400">--</span>}</td>; })}</tr>)}</tbody></table></div> : <div className="space-y-3"><p className="text-sm text-slate-500">Aucun emploi du temps renseigné pour cette classe.</p><Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('emplois-du-temps.index'), { classe_id: detail?.classe.id })}>Créer un emploi du temps</Button></div>)}</div>
        </>}</section>
      </div>
      <Dialog open={isRankingOpen} onOpenChange={setIsRankingOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Classement complet — {detail?.classe.nom}</DialogTitle></DialogHeader>{!hasRankingData ? <p className="text-sm text-slate-500">Aucune note disponible pour établir le classement.</p> : <div className="max-h-[70vh] overflow-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">Rang</th><th className="p-2">Élève</th><th className="p-2">Moyenne</th></tr></thead><tbody className="divide-y divide-slate-100">{detail?.classement.map((row) => <tr key={`${row.rang}-${row.eleve}`}><td className="p-2">{row.rang}</td><td className="p-2">{row.eleve}</td><td className="p-2">{row.moyenne != null ? `${row.moyenne}/20` : '--'}</td></tr>)}</tbody></table></div>}</DialogContent></Dialog>
      <Dialog open={isStudentsOpen} onOpenChange={setIsStudentsOpen}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Effectif complet — {detail?.classe.nom}</DialogTitle></DialogHeader>{!hasStudentsData ? <p className="text-sm text-slate-500">Aucun élève inscrit dans cette classe.</p> : <div className="max-h-[70vh] overflow-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2">Nom complet</th><th className="p-2">Matricule</th><th className="p-2">Sexe</th><th className="p-2">Date de naissance</th><th className="p-2">Contact parent</th><th className="p-2">Statut</th><th className="p-2">Moyenne</th></tr></thead><tbody className="divide-y divide-slate-100">{detail?.eleves.map((e) => <tr key={`${e.id ?? e.nomComplet}`}><td className="p-2">{e.nomComplet}</td><td className="p-2">{e.matricule ?? '--'}</td><td className="p-2">{e.sexe ?? '--'}</td><td className="p-2">--</td><td className="p-2">--</td><td className="p-2">--</td><td className="p-2">{e.moyenne != null ? `${e.moyenne}/20` : '--'}</td></tr>)}</tbody></table></div>}</DialogContent></Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Modifier la classe — {detail?.classe.nom}</DialogTitle></DialogHeader><div className="grid gap-3"><Input value={editForm.nom} onChange={(e) => setEditForm((v) => ({ ...v, nom: e.target.value }))} placeholder="Nom de la classe"/><Select value={editForm.niveau_id} onValueChange={(value) => setEditForm((v) => ({ ...v, niveau_id: value }))}><SelectTrigger><SelectValue placeholder="Niveau"/></SelectTrigger><SelectContent>{niveaux.map(([id, libelle]) => <SelectItem key={id} value={String(id)}>{libelle}</SelectItem>)}</SelectContent></Select><Select value={editForm.annee_scolaire_id} onValueChange={(value) => setEditForm((v) => ({ ...v, annee_scolaire_id: value }))}><SelectTrigger><SelectValue placeholder="Année scolaire"/></SelectTrigger><SelectContent>{annees.map(([id, libelle]) => <SelectItem key={id} value={String(id)}>{libelle}</SelectItem>)}</SelectContent></Select><Input value={editForm.capacite_max} onChange={(e) => setEditForm((v) => ({ ...v, capacite_max: e.target.value }))} placeholder="Capacité maximale" type="number"/><Input value={editForm.salle} onChange={(e) => setEditForm((v) => ({ ...v, salle: e.target.value }))} placeholder="Salle"/><Select value={editForm.statut} onValueChange={(value) => setEditForm((v) => ({ ...v, statut: value }))}><SelectTrigger><SelectValue placeholder="Statut"/></SelectTrigger><SelectContent><SelectItem value="active">active</SelectItem><SelectItem value="inactive">inactive</SelectItem></SelectContent></Select><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Fermer</Button><Button type="button" onClick={submitEdit}>Enregistrer</Button></div></div></DialogContent></Dialog>
    </div>
  </AppLayout>;
}

function StatCard({ icon, iconWrap, label, value, subtitle }: { icon: ReactNode; iconWrap: string; label: string; value: string; subtitle: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-2 flex items-center gap-2"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconWrap}`}>{icon}</span><p className="text-xs font-medium text-slate-500">{label}</p></div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>;
}
