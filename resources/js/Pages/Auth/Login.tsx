import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    Phone,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface LoginProps {
    canResetPassword: boolean;
    status?: string;
}

type LoginMode = 'email' | 'telephone';

const features = [
    { icon: GraduationCap, text: 'Suivi complet des élèves et inscriptions' },
    { icon: BookOpen,      text: 'Notes, bulletins et emplois du temps'     },
    { icon: Users,         text: 'Gestion du personnel et des finances'      },
];

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
            email:     activeTab === 'email'     ? data.email     : '',
            telephone: activeTab === 'telephone' ? data.telephone : '',
        }));
        form.post(route('login'), {
            onFinish: () => {
                form.reset('password');
                form.setData('login_mode', activeTab);
            },
        });
    };

    const switchTab = (tab: LoginMode) => {
        setActiveTab(tab);
        form.setData('login_mode', tab);
    };

    return (
        <>
            <Head title="Connexion" />

            <div className="flex min-h-screen">
                {/* ── Panneau gauche ── */}
                <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#0a1628] lg:flex">
                    {/* Dégradés décoratifs */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#1a56a0]/30 blur-[120px]" />
                        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[80px]" />
                    </div>

                    {/* Grille de points */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                            backgroundSize: '28px 28px',
                        }}
                    />

                    {/* Contenu */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a56a0]">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-white leading-none">ERP Scolaire</p>
                                <p className="text-xs text-slate-400 mt-0.5">Côte d'Ivoire</p>
                            </div>
                        </div>

                        {/* Hero text */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-sky-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                    Plateforme de gestion scolaire
                                </div>
                                <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] text-white">
                                    Gérez votre école<br />
                                    <span className="bg-gradient-to-r from-sky-400 to-[#4da3ff] bg-clip-text text-transparent">
                                        simplement.
                                    </span>
                                </h1>
                                <p className="max-w-sm text-[15px] leading-relaxed text-slate-400">
                                    Un espace unique pour piloter les élèves, les finances, le personnel et les communications de votre établissement.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                                {features.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 border border-white/10">
                                            <Icon className="h-4 w-4 text-sky-400" />
                                        </div>
                                        <span className="text-sm text-slate-300">{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                                {[
                                    { value: '100%', label: 'Sécurisé' },
                                    { value: '24/7', label: 'Disponible' },
                                    { value: 'CI', label: 'Locale' },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <p className="text-2xl font-bold text-white">{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-slate-600">© 2026 ERP Scolaire CI. Tous droits réservés.</p>
                    </div>
                </div>

                {/* ── Panneau droit ── */}
                <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10">
                    <div className="w-full max-w-[420px]">

                        {/* Mobile logo */}
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a56a0]">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <p className="font-bold text-slate-900">ERP Scolaire CI</p>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                                <ShieldCheck className="h-6 w-6 text-[#1a56a0]" />
                            </div>
                            <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Bon retour 👋</h2>
                            <p className="mt-1.5 text-sm text-slate-500">
                                Connectez-vous à votre espace de gestion.
                            </p>
                        </div>

                        {/* Status / Erreur */}
                        {status && (
                            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                                <ShieldCheck className="h-4 w-4 shrink-0" />
                                {status}
                            </div>
                        )}
                        {form.errors.auth && (
                            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                                {form.errors.auth}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Tabs email / téléphone */}
                            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                                {(['email', 'telephone'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => switchTab(tab)}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                                            activeTab === tab
                                                ? 'bg-white text-[#1a56a0] shadow-sm border border-slate-100'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab === 'email'
                                            ? <><Mail className="h-3.5 w-3.5" />Email</>
                                            : <><Phone className="h-3.5 w-3.5" />Téléphone</>
                                        }
                                    </button>
                                ))}
                            </div>

                            {/* Identifiant */}
                            <div className="space-y-1.5">
                                <label htmlFor={activeTab} className="block text-sm font-medium text-slate-700">
                                    {activeTab === 'email' ? 'Adresse email' : 'Numéro de téléphone'}
                                </label>
                                {activeTab === 'email' ? (
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="username"
                                            placeholder="votre@email.ci"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            disabled={form.processing}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#1a56a0] focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/15 disabled:opacity-60"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#1a56a0] focus-within:ring-2 focus-within:ring-[#1a56a0]/15">
                                        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">+225</span>
                                        <input
                                            id="telephone"
                                            type="tel"
                                            placeholder="07 XX XX XX XX"
                                            value={form.data.telephone}
                                            onChange={(e) => form.setData('telephone', e.target.value)}
                                            disabled={form.processing}
                                            className="h-full flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-60"
                                        />
                                    </div>
                                )}
                                <InputError message={activeTab === 'email' ? form.errors.email : form.errors.telephone} />
                            </div>

                            {/* Mot de passe */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Mot de passe
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-medium text-[#1a56a0] hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        disabled={form.processing}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#1a56a0] focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/15 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={form.errors.password} />
                            </div>

                            {/* Se souvenir */}
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                    disabled={form.processing}
                                    className="h-4 w-4 rounded border-slate-300 text-[#1a56a0] accent-[#1a56a0]"
                                />
                                <span className="text-sm text-slate-600">Se souvenir de moi</span>
                            </label>

                            {/* Bouton submit */}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1a56a0] text-sm font-semibold text-white shadow-md shadow-[#1a56a0]/25 transition hover:bg-[#154a8a] disabled:opacity-60"
                            >
                                {form.processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Connexion en cours…
                                    </>
                                ) : (
                                    <>
                                        Se connecter
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-8 text-center text-xs text-slate-400">
                            Besoin d'aide ?{' '}
                            <a
                                href="https://wa.me/2250143099959"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1a56a0] hover:underline font-medium"
                            >
                                Contactez le support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
