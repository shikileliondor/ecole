import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

interface LoginProps {
    canResetPassword: boolean;
    status?: string;
}

type LoginMode = 'email' | 'telephone';

export default function Login({ canResetPassword, status }: LoginProps) {
    const [activeTab, setActiveTab] = useState<LoginMode>('email');
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        login_mode: 'email' as LoginMode,
        email: '',
        telephone: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            login_mode: activeTab,
            email: activeTab === 'email' ? data.email : '',
            telephone: activeTab === 'telephone' ? data.telephone : '',
        }));

        form.post(route('login'), {
            onFinish: () => {
                form.reset('password');
                form.setData('login_mode', activeTab);
            },
        });
    };

    const RoleItem = ({ icon, label }: { icon: string; label: string }) => (
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-blue-50">
            <span className="text-base">{icon}</span>
            <span>{label}</span>
        </div>
    );

    return (
        <>
            <Head title="Connexion" />

            {/* Layout principal : écran scindé en 2 colonnes */}
            <div className="flex min-h-screen bg-slate-100">
                {/* Colonne gauche : branding et informations de contexte */}
                <aside className="hidden w-2/5 flex-col justify-between bg-[#1a56a0] p-10 text-white md:flex">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl">🏫</div>
                            <div>
                                <p className="text-2xl font-semibold leading-tight">ERP Scolaire CI</p>
                                <p className="text-sm text-blue-100">Gestion école primaire</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight">Bon retour parmi nous</h1>
                            <p className="max-w-md text-sm leading-relaxed text-blue-100">
                                Connectez-vous pour gérer vos classes, vos paiements, vos communications et le suivi
                                scolaire dans un espace unique et sécurisé.
                            </p>
                        </div>

                        <div className="max-w-md space-y-3 rounded-2xl bg-white/10 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Rôles disponibles</p>
                            <RoleItem icon="👔" label="Directeur" />
                            <RoleItem icon="🧑‍🏫" label="Enseignant & Caissier" />
                            <RoleItem icon="👨‍👩‍👧" label="Parent" />
                        </div>
                    </div>

                    <footer className="flex items-center gap-3 text-sm text-blue-100">
                        <a href="#" className="transition hover:text-white">
                            Support
                        </a>
                        <span className="opacity-70">|</span>
                        <a href="#" className="transition hover:text-white">
                            Contact
                        </a>
                    </footer>
                </aside>

                {/* Colonne droite : authentification */}
                <main className="flex w-full items-center justify-center bg-white px-6 py-10 md:w-3/5 md:px-10">
                    <div className="w-full max-w-md space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900">Connexion</h2>
                            <p className="text-sm text-slate-500">
                                Renseignez vos accès pour continuer vers votre espace de gestion.
                            </p>
                        </div>

                        {status && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div>}

                        {form.errors.auth && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {form.errors.auth}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Onglets Email / Téléphone */}
                            <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('email');
                                        form.setData('login_mode', 'email');
                                    }}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        activeTab === 'email'
                                            ? 'bg-white text-[#1a56a0] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('telephone');
                                        form.setData('login_mode', 'telephone');
                                    }}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        activeTab === 'telephone'
                                            ? 'bg-white text-[#1a56a0] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Téléphone
                                </button>
                            </div>

                            {/* Champ de connexion conditionnel */}
                            {activeTab === 'email' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            ✉️
                                        </span>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="username"
                                            placeholder="votre@email.ci"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            disabled={form.processing}
                                            className="h-11 pl-10"
                                        />
                                    </div>
                                    <InputError message={form.errors.email} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Numéro de téléphone</Label>
                                    <div className="flex h-11 overflow-hidden rounded-md border border-input bg-background">
                                        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                                            +225
                                        </span>
                                        <Input
                                            id="telephone"
                                            type="tel"
                                            placeholder="07 XX XX XX XX"
                                            value={form.data.telephone}
                                            onChange={(e) => form.setData('telephone', e.target.value)}
                                            disabled={form.processing}
                                            className="h-full flex-1 border-0 shadow-none focus-visible:ring-0"
                                        />
                                    </div>
                                    <InputError message={form.errors.telephone} />
                                </div>
                            )}

                            {/* Champ mot de passe avec affichage masqué/visible */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        disabled={form.processing}
                                        className="h-11 pl-10 pr-20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 transition hover:text-slate-700"
                                    >
                                        {showPassword ? 'Masquer' : 'Afficher'}
                                    </button>
                                </div>
                                <InputError message={form.errors.password} />
                            </div>

                            {/* Ligne options : reset password + remember me */}
                            <div className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <Checkbox
                                        checked={form.data.remember}
                                        onCheckedChange={(checked) => form.setData('remember', checked === true)}
                                        disabled={form.processing}
                                    />
                                    Se souvenir de moi
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-[#1a56a0] hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>

                            {/* Bouton principal de connexion */}
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-11 w-full bg-[#1a56a0] text-white hover:bg-[#154a8a]"
                            >
                                {form.processing ? 'Connexion en cours...' : 'Se connecter'}
                            </Button>

                            {/* Séparateur et boutons alternatifs OTP */}
                            <div className="relative text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <span className="relative bg-white px-3 text-sm text-slate-400">ou</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button type="button" variant="outline" className="h-11 text-sm text-slate-600">
                                    OTP SMS
                                </Button>
                                <Button type="button" variant="outline" className="h-11 text-sm text-slate-600">
                                    WhatsApp
                                </Button>
                            </div>

                            {/* Pied de formulaire */}
                            <p className="text-center text-sm text-slate-500">
                                Pas encore de compte ?{' '}
                                <a href="#" className="font-medium text-[#1a56a0] hover:underline">
                                    Inscrire mon école
                                </a>
                            </p>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
