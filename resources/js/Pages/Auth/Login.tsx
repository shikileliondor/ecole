import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import FeedbackAlert from '@/Components/ui/feedback-alert';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Eye, EyeOff, GraduationCap, Lock, Mail, MessageSquareText, Phone, ShieldCheck, Users2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface LoginProps {
    canResetPassword: boolean;
    status?: string;
}

type LoginMode = 'email' | 'telephone';

const roleCards = [
    {
        icon: Building2,
        title: 'Directeur',
        subtitle: "Gérez l'ensemble de votre établissement",
    },
    {
        icon: GraduationCap,
        title: 'Enseignant & Caissier',
        subtitle: 'Suivez les classes et les transactions',
    },
    {
        icon: Users2,
        title: 'Parent',
        subtitle: 'Suivez la scolarité de vos enfants',
    },
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

    return (
        <>
            <Head title="Connexion" />

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 p-4 md:p-8">
                <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-100/40 md:grid-cols-[1.05fr_0.95fr]">
                    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f4da8] via-[#1b67d6] to-[#5da9ff] p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-3xl font-semibold leading-tight">ERP Scolaire CI</p>
                                    <p className="text-sm text-blue-100">Gestion école primaire</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h1 className="max-w-lg text-5xl font-bold leading-tight">Bienvenue sur votre espace scolaire</h1>
                                <div className="h-1 w-16 rounded-full bg-yellow-300" />
                                <p className="max-w-xl text-base leading-relaxed text-blue-100/95">
                                    Gérez vos classes, paiements, communications et le suivi scolaire de vos élèves dans un espace
                                    unique, sécurisé et simple à utiliser.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Rôles disponibles</p>
                                <div className="space-y-3">
                                    {roleCards.map((role) => (
                                        <div key={role.title} className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm">
                                            <div className="rounded-xl bg-white/20 p-2.5">
                                                <role.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold">{role.title}</p>
                                                <p className="text-sm text-blue-100">{role.subtitle}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <footer className="relative z-10 flex items-center gap-3 text-sm text-blue-100">
                            <a href="#" className="transition hover:text-white">Support</a>
                            <span className="opacity-70">•</span>
                            <a href="#" className="transition hover:text-white">Contact</a>
                        </footer>
                    </aside>

                    <main className="flex items-center justify-center p-6 md:p-10">
                        <div className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lg shadow-blue-50 md:p-8">
                            <div className="space-y-3">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#1a56a0]">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h2 className="text-4xl font-bold text-slate-900">Connexion</h2>
                                <p className="text-sm text-slate-500">Renseignez vos accès pour continuer vers votre espace de gestion.</p>
                            </div>

                            {status ? <FeedbackAlert type="success" message={status} /> : null}
                            {form.errors.auth ? <FeedbackAlert type="error" message={form.errors.auth} /> : null}

                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('email');
                                            form.setData('login_mode', 'email');
                                        }}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                            activeTab === 'email' ? 'bg-white text-[#1a56a0] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />Email</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('telephone');
                                            form.setData('login_mode', 'telephone');
                                        }}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                            activeTab === 'telephone' ? 'bg-white text-[#1a56a0] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />Téléphone</span>
                                    </button>
                                </div>

                                {activeTab === 'email' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Adresse email</Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input id="email" type="email" autoComplete="username" placeholder="votre@email.ci" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} disabled={form.processing} className="h-11 pl-10" />
                                        </div>
                                        <InputError message={form.errors.email} />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone">Numéro de téléphone</Label>
                                        <div className="flex h-11 overflow-hidden rounded-md border border-input bg-background">
                                            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">+225</span>
                                            <Input id="telephone" type="tel" placeholder="07 XX XX XX XX" value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)} disabled={form.processing} className="h-full flex-1 border-0 shadow-none focus-visible:ring-0" />
                                        </div>
                                        <InputError message={form.errors.telephone} />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} disabled={form.processing} className="h-11 pl-10 pr-12" />
                                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={form.errors.password} />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <Checkbox checked={form.data.remember} onCheckedChange={(checked) => form.setData('remember', checked === true)} disabled={form.processing} />
                                        Se souvenir de moi
                                    </label>
                                    {canResetPassword && <Link href={route('password.request')} className="text-sm font-medium text-[#1a56a0] hover:underline">Mot de passe oublié ?</Link>}
                                </div>

                                <Button type="submit" disabled={form.processing} className="h-12 w-full bg-[#1a56a0] text-base font-semibold text-white hover:bg-[#154a8a]">
                                    {form.processing ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>

                                <div className="relative text-center">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                                    <span className="relative bg-white px-3 text-sm text-slate-400">ou</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button type="button" variant="outline" className="h-11 text-sm text-slate-600"><MessageSquareText className="mr-2 h-4 w-4" />OTP SMS</Button>
                                    <Button type="button" variant="outline" className="h-11 text-sm text-slate-600"><Phone className="mr-2 h-4 w-4" />WhatsApp</Button>
                                </div>

                                <p className="text-center text-sm text-slate-500">
                                    Pas encore de compte ? <a href="#" className="font-medium text-[#1a56a0] hover:underline">Inscrire mon école</a>
                                </p>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
