<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'login_mode' => ['required', Rule::in(['email', 'telephone'])],
            'email' => [
                Rule::requiredIf(fn () => $request->string('login_mode')->toString() === 'email'),
                'nullable',
                'email',
            ],
            'telephone' => [
                Rule::requiredIf(fn () => $request->string('login_mode')->toString() === 'telephone'),
                'nullable',
                'string',
                'max:20',
            ],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $remember = (bool) ($validated['remember'] ?? false);

        $credentials = ['password' => $validated['password']];

        if ($validated['login_mode'] === 'email') {
            $credentials['email'] = mb_strtolower(trim((string) ($validated['email'] ?? '')));

            $authenticated = Auth::attempt($credentials, $remember);
        } else {
            $telephoneRaw = preg_replace('/\s+/', '', (string) ($validated['telephone'] ?? '')) ?? '';
            $telephoneWithoutPrefix = preg_replace('/^\+225/', '', $telephoneRaw) ?? $telephoneRaw;

            $authenticated = Auth::attempt([
                'telephone' => $telephoneRaw,
                'password' => $validated['password'],
            ], $remember)
                || Auth::attempt([
                    'telephone' => $telephoneWithoutPrefix,
                    'password' => $validated['password'],
                ], $remember)
                || Auth::attempt([
                    'telephone' => "+225{$telephoneWithoutPrefix}",
                    'password' => $validated['password'],
                ], $remember);
        }

        if (! $authenticated) {
            return back()->withErrors([
                'auth' => 'Ces identifiants ne correspondent à aucun compte.',
            ])->onlyInput($validated['login_mode'] === 'email' ? 'email' : 'telephone');
        }

        $request->session()->regenerate();

        $user = $request->user();

        if ($user) {
            $user->forceFill([
                'dernier_connexion' => now(),
            ])->save();

            if ($user->hasRole('parent') && Route::has('portail.parent')) {
                return redirect()->intended(route('portail.parent', absolute: false));
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
