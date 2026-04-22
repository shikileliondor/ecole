import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo, useState } from 'react';
import {
    BarChart3,
    Bell,
    Banknote,
    BookOpen,
    CalendarX,
    ChevronDown,
    ClipboardList,
    CreditCard,
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
        children?: Array<{
            label: string;
            href: string;
            icon: typeof LayoutDashboard;
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
};

const navGroups: NavGroup[] = [
    {
        label: 'PRINCIPAL',
        items: [
            { label: 'Tableau de bord', href: route('dashboard'), icon: LayoutDashboard },
            { label: 'Notifications', href: '#', icon: Bell, notifications: 4 },
        ],
    },
    {
        label: 'SCOLARITÉ',
        items: [
            { label: 'Élèves', href: route('eleves.index'), icon: Users },
            // { label: 'Inscriptions', href: route('inscriptions.index'), icon: ClipboardList },
            { label: 'Nouvelle inscription', href: route('inscriptions.create'), icon: ClipboardList },
            { label: 'Classes', href: '#', icon: School },
            { label: 'Notes & Bulletins', href: '#', icon: BookOpen },
            { label: 'Absences', href: '#', icon: CalendarX },
        ],
    },
    {
        label: 'FINANCES',
        items: [
            { label: 'Paiements', href: '#', icon: CreditCard },
            { label: 'Frais scolaires', href: '#', icon: Receipt },
            { label: 'Salaires', href: '#', icon: Banknote },
        ],
    },
    {
        label: 'RESSOURCES HUMAINES',
        items: [{ label: 'Personnel', href: '#', icon: UserCog }],
    },
    {
        label: 'RAPPORTS',
        items: [
            { label: 'Rapports', href: '#', icon: BarChart3 },
            {
                label: 'Paramètres',
                href: route('parametres.index'),
                icon: Settings,
                children: [
                    { label: 'Paramètres généraux', href: route('parametres.index'), icon: Settings },
                    { label: 'Nouvelle inscription', href: route('inscriptions.create'), icon: ClipboardList },
                    { label: 'Slides Hero', href: route('parametres.index'), icon: MonitorPlay },
                    { label: 'Templates notifications', href: route('parametres.index'), icon: Mail },
                    { label: 'Historique notifications', href: route('parametres.index'), icon: MailCheck },
                ],
            },
        ],
    },
];

export default function AppLayout({
    children,
    title = 'Tableau de bord',
}: PropsWithChildren<{ title?: string }>) {
    const { auth } = usePage<AuthProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [openedMenus, setOpenedMenus] = useState<Record<string, boolean>>({
        Paramètres: window.location.pathname.startsWith('/parametres'),
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
        [initials, pathname, roleName, schoolName, userName],
    );

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="flex min-h-screen bg-gray-50">
                <div className="hidden lg:block">{renderedSidebar}</div>

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

                <div className="flex min-w-0 flex-1 flex-col">
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
                                    onClick={() => setIsDarkMode((prev) => !prev)}
                                >
                                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </Button>

                                <Button type="button" variant="ghost" size="icon" className="relative">
                                    <Bell size={18} />
                                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
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
        </div>
    );
}
