import { router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    BellOff,
    CalendarX,
    Check,
    CheckCheck,
    CreditCard,
    Info,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/Components/ui/button';

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    items: NotificationItem[];
    unreadCount: number;
    onCountChange: (count: number) => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    absence:     { icon: CalendarX,    color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40' },
    paiement:    { icon: CreditCard,   color: 'text-green-500',  bg: 'bg-green-100  dark:bg-green-900/40'  },
    inscription: { icon: UserPlus,     color: 'text-blue-500',   bg: 'bg-blue-100   dark:bg-blue-900/40'   },
    alerte:      { icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-100    dark:bg-red-900/40'    },
    depense:     { icon: Banknote,     color: 'text-amber-500',  bg: 'bg-amber-100  dark:bg-amber-900/40'  },
    info:        { icon: Info,         color: 'text-slate-500',  bg: 'bg-slate-100  dark:bg-slate-800'     },
};

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return "À l'instant";
    if (mins < 60) return `il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `il y a ${days}j`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function callJson(url: string, method: 'POST' | 'DELETE'): Promise<{ unread_count?: number }> {
    return fetch(url, {
        method,
        headers: {
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
    }).then((r) => r.json());
}

export default function NotificationPanel({ open, onClose, items, unreadCount, onCountChange }: Props) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Fermer sur clic extérieur
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose]);

    // Fermer sur Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const markOne = async (id: string, link: string | null) => {
        const res = await callJson(route('notifications.read', id), 'POST');
        onCountChange(res.unread_count ?? 0);
        router.reload({ only: ['notifications'] });
        if (link) {
            onClose();
            router.visit(link);
        }
    };

    const markAll = async () => {
        await callJson(route('notifications.read-all'), 'POST');
        onCountChange(0);
        router.reload({ only: ['notifications'] });
    };

    const deleteOne = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const res = await callJson(route('notifications.destroy', id), 'DELETE');
        onCountChange(res.unread_count ?? 0);
        router.reload({ only: ['notifications'] });
    };

    const clearRead = async () => {
        await callJson(route('notifications.clear-read'), 'DELETE');
        router.reload({ only: ['notifications'] });
    };

    return (
        <>
            {/* Overlay mobile */}
            {open ? (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={onClose}
                />
            ) : null}

            {/* Panel */}
            <div
                ref={panelRef}
                className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-4 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h2>
                        {unreadCount > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                {unreadCount}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 ? (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#1a56a0] hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Tout marquer comme lu"
                            >
                                <CheckCheck size={14} /> Tout lire
                            </button>
                        ) : null}
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
                            <BellOff size={40} strokeWidth={1.5} />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <ul className="divide-y dark:divide-gray-700/60">
                            {items.map((notif) => {
                                const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;
                                const Icon = cfg.icon;
                                const isUnread = !notif.read_at;

                                return (
                                    <li
                                        key={notif.id}
                                        onClick={() => markOne(notif.id, notif.link)}
                                        className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${isUnread ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''}`}
                                    >
                                        {/* Indicateur non lu */}
                                        {isUnread ? (
                                            <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-[#1a56a0]" />
                                        ) : null}

                                        {/* Icône */}
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                                            <Icon size={16} className={cfg.color} />
                                        </div>

                                        {/* Contenu */}
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate text-sm ${isUnread ? 'font-semibold text-gray-800 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                                {notif.message}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                {relativeTime(notif.created_at)}
                                            </p>
                                        </div>

                                        {/* Actions au hover */}
                                        <div className="flex shrink-0 flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            {isUnread ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markOne(notif.id, null); }}
                                                    className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check size={13} />
                                                </button>
                                            ) : null}
                                            <button
                                                onClick={(e) => deleteOne(notif.id, e)}
                                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.some((n) => n.read_at) ? (
                    <div className="border-t px-4 py-3 dark:border-gray-700">
                        <button
                            onClick={clearRead}
                            className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                            Effacer les notifications lues
                        </button>
                    </div>
                ) : null}
            </div>
        </>
    );
}
