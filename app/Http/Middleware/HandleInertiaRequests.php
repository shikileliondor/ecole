<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $user?->loadMissing('etablissement:id,nom');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'               => $user->id,
                    'name'             => $user->name,
                    'email'            => $user->email,
                    'etablissement_id' => $user->etablissement_id,
                    'etablissement_nom' => $user->etablissement?->nom,
                ] : null,
                'roles'       => $user?->getRoleNames(),
                'permissions' => $user?->getAllPermissions()->pluck('name'),
            ],
            'notifications' => $user ? [
                'unread_count' => $user->unreadNotifications()->count(),
                'items'        => $user->notifications()
                    ->latest()
                    ->take(25)
                    ->get()
                    ->map(fn ($n) => [
                        'id'         => $n->id,
                        'type'       => $n->data['type']    ?? 'info',
                        'title'      => $n->data['title']   ?? '',
                        'message'    => $n->data['message'] ?? '',
                        'link'       => $n->data['link']    ?? null,
                        'read_at'    => $n->read_at?->toIso8601String(),
                        'created_at' => $n->created_at->toIso8601String(),
                    ]),
            ] : ['unread_count' => 0, 'items' => []],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ];
    }
}
