import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo, useState } from 'react';
import NotificationPanel, { type NotificationItem } from '@/Components/NotificationPanel';
import {
    AlertCircle,
    BarChart3,
    Bell,
    Banknote,
    BookOpen,
    CalendarDays,
    CalendarX,
    ChevronDown,
    ClipboardList,
    CreditCard,
    FileBarChart,
    LayoutDashboard,
    Mail,
    MailCheck,
    LogOut,
    Menu,
    Moon,
    MonitorPlay,
    Receipt,
    RefreshCw,
    School,
    Search,
    Settings,
    Sun,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

type NavGroup = {
    label: string;
    items: Array<{
        label: string;
        href: string;
        icon: typeof LayoutDashboard;
        notifications?: number;
        permission?: string;
        children?: Array<{
            label: string;
            href: string;
            icon: typeof LayoutDashboard;
            permission?: string;
        }>;
    }>;
};

type AppUser = {
    id: number;
    name: string;
    email: string;
    etablissement_id?: number;
    etablissement_nom?: string;
};

type AuthProps = {
    auth: {
        user: AppUser | null;
        roles?: string[];
        permissions?: string[];
    };
    notifications: {
        unread_count: number;
        items: NotificationItem[];
    };
    flash?: { success?: string; error?: string };
};

function getNavGroups(unreadCount: number, permissions: string[] = []): NavGroup[] {
    const can = (permission?: string) => !permission || permission.split('|').some((item) => permissions.includes(item));
    const filterItems = (groups: NavGroup[]): NavGroup[] => groups
        .map((group) => ({
            ...group,
            items: group.items
                .filter((item) => item.href === '#' || can(item.permission))
                .map((item) => ({
                    ...item,
                    children: item.children?.filter((child) => can(child.permission)),
                }))
                .filter((item) => !item.children || item.children.length > 0),
        }))
        .filter((group) => group.items.length > 0);

    return filterItems([
    {
        label: 'PRINCIPAL',
        items: [
            { label: 'Tableau de bord', href: route('dashboard'), icon: LayoutDashboard, permission: 'dashboard.voir' },
            { label: 'Notifications', href: '#', icon: Bell, notifications: unreadCount > 0 ? unreadCount : undefined },
        ],
    },
    {
        label: 'SCOLARITÉ',
        items: [
            { label: 'Élèves', href: route('eleves.index'), icon: Users, permission: 'eleves.voir' },
            // { label: 'Inscriptions', href: route('inscriptions.index'), icon: ClipboardList },
            { label: 'Nouvelle inscription', href: route('inscriptions.create'), icon: ClipboardList, permission: 'inscriptions.creer' },
            { label: 'Classes', href: route('classes.index'), icon: School, permission: 'classes.voir' },
            { label: 'Emplois du temps', href: route('emplois-du-temps.index'), icon: CalendarDays, permission: 'emplois.voir' },
            { label: 'Notes & Bulletins', href: route('notes-bulletins.index'), icon: BookOpen, permission: 'notes.voir' },
            { label: 'Absences', href: route('absences.index'), icon: CalendarX, permission: 'absences.voir' },
        ],
    },
    {
        label: 'Finances',
        items: [
            { label: 'Tableau de bord finance', href: '/finances/dashboard', icon: BarChart3, permission: 'finances.voir' },
            { label: 'Paiements / Encaissements', href: '/finances/paiements', icon: CreditCard, permission: 'finances.paiements.gerer' },
            { label: 'Impayés', href: '/finances/impayes', icon: AlertCircle, permission: 'finances.paiements.gerer' },
            { label: 'Dépenses / Caisse', href: '/finances/depenses', icon: Banknote, permission: 'finances.depenses.gerer' },
            { label: 'Salaires', href: '/finances/salaires', icon: Users, permission: 'finances.salaires.voir' },
            { label: 'Rapports financiers', href: '/finances/rapports', icon: FileBarChart, permission: 'finances.rapports.voir' },
        ],
    },
    {
        label: 'COMMUNICATION',
        items: [
            { label: 'SMS parents', href: route('communication.sms.index'), icon: Mail, permission: 'communication.sms.gerer' },
            { label: 'Email parents', href: route('communication.email.index'), icon: MailCheck, permission: 'communication.email.gerer' },
        ],
    },
    {
        label: 'RESSOURCES HUMAINES',
        items: [{ label: 'Personnel', href: route('personnel.index'), icon: UserCog, permission: 'personnel.voir' }],
    },
    {
        label: 'RAPPORTS',
        items: [
            { label: 'Rapports', href: route('finances.rapports.index'), icon: BarChart3, permission: 'finances.rapports.voir' },
            {
                label: 'Paramètres',
                href: route('parametres.index'),
                icon: Settings,
                permission: 'parametres.voir',
                children: [
                    { label: 'Paramètres généraux', href: route('parametres.index'), icon: Settings, permission: 'parametres.voir' },
                    { label: 'Utilisateurs & accès', href: `${route('parametres.index')}?tab=utilisateurs`, icon: UserCog, permission: 'permissions.utilisateurs.voir|permissions.utilisateurs.gerer|permissions.utilisateurs.creer' },
                    { label: 'Rôles & permissions', href: `${route('parametres.index')}?tab=utilisateurs`, icon: Settings, permission: 'permissions.roles.gerer|permissions.utilisateurs.gerer' },
                    // { label: 'Nouvelle inscription', href: route('inscriptions.create'), icon: ClipboardList, permission: 'inscriptions.creer' },
                    // { label: 'Slides Hero', href: route('parametres.index'), icon: MonitorPlay },
                    // { label: 'Templates notifications', href: route('parametres.index'), icon: Mail },
                    // { label: 'Historique notifications', href: route('parametres.index'), icon: MailCheck },
                ],
            },
        ],
    },
    ]); // end getNavGroups
}

export default function AppLayout({
    children,
    title = 'Tableau de bord',
}: PropsWithChildren<{ title?: string }>) {
    const { auth, notifications: notifProps } = usePage<AuthProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(notifProps?.unread_count ?? 0);
    const [isDarkMode, toggleDarkMode] = useDarkMode();
    const [openedMenus, setOpenedMenus] = useState<Record<string, boolean>>({
        Paramètres: window.location.pathname.startsWith('/parametres'),
        FINANCES: window.location.pathname.startsWith('/finances'),
    });

    const userName = auth.user?.name ?? 'Utilisateur';
    const roleName = auth.roles?.[0]?.replace('_', ' ') ?? 'membre';
    const schoolName = auth.user?.etablissement_nom ?? 'Établissement non défini';
    const initials = userName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const pathname = window.location.pathname;
    const authPermissions = auth.permissions ?? [];
    const navGroups = useMemo(() => getNavGroups(unreadCount, authPermissions), [authPermissions, unreadCount]);

    const renderedSidebar = useMemo(
        () => (
            <aside className="flex h-full w-[260px] flex-col bg-[#1a56a0] text-white">
                {/* En-tête de la sidebar */}
                <div className="border-b border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-white/10 text-xl font-bold">
                            🏫
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold">ERP Scolaire CI</h1>
                            <p className="text-xs text-white/60">Gestion école primaire</p>
                        </div>
                    </div>
                </div>

                {/* Établissement actif */}
                <div className="mx-3 my-3 rounded-xl bg-white/10 p-3">
                    <div className="text-[11px] text-white/50">Établissement actuel</div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">{schoolName}</p>
                        <RefreshCw size={14} className="shrink-0 text-white/70" />
                    </div>
                </div>

                {/* Navigation principale */}
                <nav className="flex-1 overflow-y-auto px-2 pb-4">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="mb-1 mt-4 px-3 text-[10px] uppercase tracking-widest text-white/40">
                                {group.label}
                            </p>
                            {group.label.toUpperCase() === 'FINANCES' ? (
                                <div className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenedMenus((prev) => ({
                                                ...prev,
                                                FINANCES: !(prev.FINANCES ?? false),
                                            }))
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                                            openedMenus.FINANCES
                                                ? 'bg-white/20 font-medium text-white'
                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span>FINANCES</span>
                                        <ChevronDown
                                            size={15}
                                            className={`transition-transform duration-200 ${openedMenus.FINANCES ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <div
                                        className={`overflow-hidden pl-3 transition-all duration-200 ${
                                            openedMenus.FINANCES ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="ml-4 space-y-1 border-l border-white/20 pl-3">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const isActive =
                                                    item.href !== '#' &&
                                                    pathname.startsWith(new URL(item.href, window.location.origin).pathname);

                                                return (
                                                    <Link
                                                        key={item.label}
                                                        href={item.href}
                                                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                                                            isActive
                                                                ? 'bg-white/15 text-white'
                                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon size={14} />
                                                        <span className="truncate">{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        item.href !== '#' && pathname.startsWith(new URL(item.href, window.location.origin).pathname);
                                    const isOpen = openedMenus[item.label] ?? false;
                                    const hasChildren = (item.children?.length ?? 0) > 0;

                                    return (
                                        <div key={item.label}>
                                            {hasChildren ? (
                                                <div
                                                    className={`flex w-full items-center gap-2 rounded-lg pr-2 text-sm transition ${
                                                        isActive || isOpen
                                                            ? 'bg-white/20 font-medium text-white'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                                                        <Icon size={16} />
                                                        <span className="truncate">{item.label}</span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setOpenedMenus((prev) => ({
                                                                ...prev,
                                                                [item.label]: !isOpen,
                                                            }))
                                                        }
                                                        className="rounded p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                                                        aria-label={`Afficher les sous-menus de ${item.label}`}
                                                    >
                                                        <ChevronDown
                                                            size={15}
                                                            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                                        isActive
                                                            ? 'bg-white/20 font-medium text-white'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.notifications ? (
                                                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                                                            {item.notifications}
                                                        </span>
                                                    ) : null}
                                                </Link>
                                            )}

                                            {hasChildren && isOpen ? (
                                                <div className="ml-7 mt-1 space-y-1 border-l border-white/20 pl-3">
                                                    {item.children?.map((child) => {
                                                        const ChildIcon = child.icon;
                                                        const childActive =
                                                            child.href !== '#' &&
                                                            pathname.startsWith(new URL(child.href, window.location.origin).pathname);

                                                        return (
                                                            <Link
                                                                key={child.label}
                                                                href={child.href}
                                                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                                                                    childActive
                                                                        ? 'bg-white/15 text-white'
                                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                            >
                                                                <ChildIcon size={14} />
                                                                <span className="truncate">{child.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer utilisateur */}
                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-white/20 text-white">
                            <AvatarFallback className="bg-white/20 text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{userName}</p>
                            <p className="truncate text-xs capitalize text-white/70">{roleName}</p>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                            <LogOut size={16} />
                        </Link>
                    </div>
                </div>
            </aside>
        ),
        [initials, navGroups, openedMenus, pathname, roleName, schoolName, userName],
    );

    return (
        <>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
                <div className="hidden h-screen shrink-0 lg:block">{renderedSidebar}</div>

                {/* Sidebar mobile + overlay */}
                {sidebarOpen ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        />
                        <div className="fixed inset-y-0 left-0 z-50 lg:hidden">{renderedSidebar}</div>
                    </>
                ) : null}

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    {/* Barre de navigation supérieure */}
                    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white">
                        <div className="flex h-full items-center justify-between gap-3 px-4 lg:px-6">
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu size={20} />
                                </Button>
                                <div className="hidden text-sm text-gray-500 sm:block">
                                    <span>Accueil</span> <span className="mx-1">/</span>
                                    <span className="font-medium text-gray-800">{title}</span>
                                </div>
                            </div>

                            <div className="hidden max-w-md flex-1 md:block">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input
                                        placeholder="Rechercher un élève, une classe..."
                                        className="border-gray-200 pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleDarkMode}
                                >
                                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative"
                                    onClick={() => setNotifOpen((o) => !o)}
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 ? (
                                        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    ) : null}
                                </Button>

                                <div className="hidden lg:block">
                                    <Badge variant="outline" className="border-[#1a56a0]/20 text-[#1a56a0]">
                                        {schoolName}
                                    </Badge>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" variant="ghost" className="gap-2 px-2 sm:px-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{initials}</AvatarFallback>
                                            </Avatar>
                                            <div className="hidden text-left sm:block">
                                                <p className="text-sm font-medium leading-none text-gray-800">{userName}</p>
                                                <p className="mt-1 text-xs capitalize text-gray-500">{roleName}</p>
                                            </div>
                                            <ChevronDown size={14} className="text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem asChild>
                                            <Link href={route('profile.edit')}>Profil</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Paramètres</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={route('logout')} method="post" as="button">
                                                Déconnexion
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {sidebarOpen ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <X size={18} />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
                </div>
        </div>

        <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            items={notifProps?.items ?? []}
            unreadCount={unreadCount}
            onCountChange={setUnreadCount}
        />
        </>
    );
}
