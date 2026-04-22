import type { ComponentType } from 'react';
import EleveAvatar from '@/Components/Eleves/EleveAvatar';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { CalendarDays, CircleDollarSign, FileText, GraduationCap, IdCard, Phone, UserRound } from 'lucide-react';

type InscriptionDocument = {
    id: number;
    libelle: string;
};

type InscriptionShowCardProps = {
    inscription: {
        id: number;
        date_inscription?: string;
        statut?: string;
        type?: string;
        eleve?: {
            nom?: string;
            prenoms?: string;
            matricule?: string;
            telephone?: string;
            photo?: string | null;
            est_boursier?: boolean;
        };
        classe?: {
            nom?: string;
            niveau?: {
                libelle?: string;
            };
        };
        annee_scolaire?: {
            libelle?: string;
        };
        documents?: InscriptionDocument[];
    };
};

const statutColorMap: Record<string, string> = {
    inscrit: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    transfere: 'bg-orange-100 text-orange-700 border-orange-200',
    abandonne: 'bg-rose-100 text-rose-700 border-rose-200',
};

function formatDate(value?: string): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function cleanStatusLabel(value?: string): string {
    if (!value) return 'Non défini';
    return value.replace(/_/g, ' ');
}

export default function InscriptionShowCard({ inscription }: InscriptionShowCardProps) {
    const nomComplet = `${inscription.eleve?.nom ?? ''} ${inscription.eleve?.prenoms ?? ''}`.trim();

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500">Inscriptions / Détail</p>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {inscription.eleve?.matricule ?? '—'} - {nomComplet || 'Élève non renseigné'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                            <span>{inscription.classe?.nom ?? 'Classe non définie'}</span>
                            <span>•</span>
                            <span>{inscription.annee_scolaire?.libelle ?? 'Année non définie'}</span>
                        </div>
                    </div>

                    <Badge className={`w-fit border px-3 py-1 text-sm capitalize ${statutColorMap[inscription.statut ?? ''] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {cleanStatusLabel(inscription.statut)}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-slate-900"><UserRound className="h-5 w-5 text-slate-500" /> Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <InfoItem icon={IdCard} label="Matricule" value={inscription.eleve?.matricule} mono />
                            <InfoItem icon={GraduationCap} label="Classe" value={inscription.classe?.nom} />
                            <InfoItem icon={CircleDollarSign} label="Boursier" value={inscription.eleve?.est_boursier ? 'Oui' : 'Non'} />
                            <InfoItem icon={CalendarDays} label="Date inscription" value={formatDate(inscription.date_inscription)} />
                            <InfoItem icon={FileText} label="Type" value={cleanStatusLabel(inscription.type)} />
                            <InfoItem icon={Phone} label="Téléphone" value={inscription.eleve?.telephone ?? '—'} />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-900">Documents</h2>
                            {inscription.documents?.length ? (
                                <div className="space-y-3">
                                    {inscription.documents.map((document) => (
                                        <div key={document.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="rounded-lg bg-white p-2 text-slate-500 shadow-sm"><FileText className="h-4 w-4" /></span>
                                                <span className="font-medium text-slate-800">{document.libelle}</span>
                                            </div>
                                            <Badge className="border-slate-200 bg-white text-slate-600">Enregistré</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                                    Aucun document
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 shadow-sm">
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex items-center gap-3">
                                <EleveAvatar
                                    photo={inscription.eleve?.photo}
                                    nom={inscription.eleve?.nom ?? 'Élève'}
                                    prenoms={inscription.eleve?.prenoms ?? 'Sans nom'}
                                    size="lg"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{nomComplet || 'Élève non renseigné'}</p>
                                    <p className="font-mono text-sm text-slate-500">{inscription.eleve?.matricule ?? '—'}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                Statut: <span className="font-semibold capitalize text-slate-800">{cleanStatusLabel(inscription.statut)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Total documents</span>
                                <span className="text-lg font-semibold text-slate-800">{inscription.documents?.length ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Type</span>
                                <span className="font-semibold capitalize text-slate-800">{cleanStatusLabel(inscription.type)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Année scolaire</span>
                                <span className="font-semibold text-slate-800">{inscription.annee_scolaire?.libelle ?? '—'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

type InfoItemProps = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value?: string;
    mono?: boolean;
};

function InfoItem({ icon: Icon, label, value, mono = false }: InfoItemProps) {
    return (
        <div className="space-y-2 rounded-xl border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-sm text-slate-500">
                <Icon className="h-4 w-4" />
                {label}
            </p>
            <p className={`text-base font-semibold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
        </div>
    );
}
