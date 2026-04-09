import InputWithIcon from '@/Components/Auth/InputWithIcon';
import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
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
        })).post(route('login'), {
            onFinish: () => {
                form.reset('password');
                form.setData('login_mode', activeTab);
            },
        });
    };

    const RoleItem = ({ icon, label }: { icon: string; label: string }) => (
        <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm text-blue-50">
            <span className="text-base">{icon}</span>
            <span>{label}</span>
        </div>
    );

    return (
        <>
            <Head title="Connexion" />

            <div className="min-h-screen flex bg-gray-50">
                {/* Colonne gauche : branding et accès rapide */}
                <aside className="hidden md:flex w-[38%] bg-[#1a56a0] flex-col justify-between p-8 text-white">
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                                    <span className="text-2xl">📘</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold">ERP Scolaire CI</p>
                                    <p className="text-sm text-blue-100">Gestion école primaire</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold leading-tight">Bon retour parmi nous</h1>
                            <p className="max-w-sm text-blue-100">
                                Accédez à votre espace sécurisé pour piloter les inscriptions, les paiements et le
                                suivi pédagogique de votre établissement.
                            </p>
                        </div>

                        <div className="max-w-sm rounded-xl bg-white/10 p-4">
                            <p className="mb-3 text-sm font-medium text-blue-100">Accès rapide par rôle</p>
                            <div className="space-y-2">
                                <RoleItem icon="👔" label="Directeur" />
                                <RoleItem icon="🧑‍🏫" label="Enseignant & Caissier" />
                                <RoleItem icon="👨‍👩‍👧" label="Parent d'élève" />
                            </div>
                        </div>
                    </div>

                    <footer className="flex items-center gap-4 text-sm text-blue-100">
                        <a href="#" className="hover:text-white transition">Support</a>
                        <span className="opacity-50">|</span>
                        <a href="#" className="hover:text-white transition">Contact</a>
                    </footer>
                </aside>

                {/* Colonne droite : formulaire de connexion */}
                <main className="w-full md:w-[62%] bg-white flex flex-col justify-center px-6 md:px-10 py-8">
                    <div className="max-w-md mx-auto w-full space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Entrez vos identifiants pour accéder à votre tableau de bord
                            </p>
                        </div>

                        {status && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{status}</div>}

                        {form.errors.auth && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {form.errors.auth}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Onglets Email / Téléphone */}
                            <div className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 bg-gray-50 p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('email');
                                        form.setData('login_mode', 'email');
                                    }}
                                    className={`rounded-md px-4 py-2 text-sm transition ${
                                        activeTab === 'email'
                                            ? 'bg-blue-50 text-[#1a56a0] font-medium'
                                            : 'text-gray-500 hover:text-gray-700'
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
                                    className={`rounded-md px-4 py-2 text-sm transition ${
                                        activeTab === 'telephone'
                                            ? 'bg-blue-50 text-[#1a56a0] font-medium'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Téléphone
                                </button>
                            </div>

                            {activeTab === 'email' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <InputWithIcon
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        placeholder="votre@email.ci"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        icon={<span>✉️</span>}
                                        error={form.errors.email}
                                        disabled={form.processing}
                                    />
                                    <InputError message={form.errors.email} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Numéro de téléphone</Label>
                                    <div className="flex items-center overflow-hidden rounded-md border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                                        <span className="bg-gray-50 px-3 py-2 text-sm text-gray-600">+225</span>
                                        <InputWithIcon
                                            id="telephone"
                                            type="tel"
                                            placeholder="07 XX XX XX XX"
                                            value={form.data.telephone}
                                            onChange={(e) => form.setData('telephone', e.target.value)}
                                            icon={<span>📱</span>}
                                            error={form.errors.telephone}
                                            className="border-0 rounded-none focus:ring-0"
                                            disabled={form.processing}
                                        />
                                    </div>
                                    <InputError message={form.errors.telephone} />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <InputWithIcon
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        icon={<span>🔒</span>}
                                        error={form.errors.password}
                                        disabled={form.processing}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? 'Masquer' : 'Afficher'}
                                    </button>
                                </div>
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
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
                                        className="text-sm text-[#1a56a0] hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-[#1a56a0] hover:bg-[#154a8a] text-white w-full py-2.5 rounded-md font-medium transition h-auto"
                            >
                                {form.processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Connexion en cours...
                                    </span>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>

                            <div className="relative text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200" />
                                </div>
                                <span className="relative bg-white px-2 text-sm text-gray-400">ou</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border border-gray-200 rounded-md py-2 text-sm text-gray-500 hover:bg-gray-50 h-auto"
                                >
                                    OTP SMS
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border border-gray-200 rounded-md py-2 text-sm text-gray-500 hover:bg-gray-50 h-auto"
                                >
                                    WhatsApp
                                </Button>
                            </div>

                            <p className="text-center text-sm text-gray-500">
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
