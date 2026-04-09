import { Head, Link, usePage } from '@inertiajs/react';

type AuthUser = {
    name: string;
    email: string;
};

type DashboardProps = {
    auth: {
        user: AuthUser | null;
        roles: string[];
    };
};

export default function Dashboard() {
    const { auth } = usePage<DashboardProps>().props;
    const userName = auth.user?.name ?? 'Utilisateur';
    const roleName = auth.roles?.[0] ?? 'Aucun rôle';

    return (
        <>
            <Head title="Tableau de bord" />

            <main className="min-h-screen bg-slate-100 px-6 py-10">
                <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
                    <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
                    <p className="mt-4 text-slate-700">
                        Bienvenue <span className="font-semibold">{userName}</span>
                    </p>
                    <p className="text-slate-700">
                        Rôle actif : <span className="font-semibold">{roleName}</span>
                    </p>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-8 inline-flex rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                    >
                        Se déconnecter
                    </Link>
                </div>
            </main>
        </>
    );
}
