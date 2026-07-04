import { useCallback, useEffect, useState } from 'react';

export const DARK_MODE_STORAGE_KEY = 'erp-dark-mode';

function readStoredPreference(): boolean | null {
    try {
        const stored = window.localStorage.getItem(DARK_MODE_STORAGE_KEY);

        return stored === null ? null : stored === 'true';
    } catch {
        return null;
    }
}

function getInitialDark(): boolean {
    if (typeof window === 'undefined') return false;

    const stored = readStoredPreference();
    if (stored !== null) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyDarkMode(isDark: boolean): void {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
}

/** Apply the saved/system theme before React renders to avoid a light flash. */
export function initializeDarkMode(): void {
    if (typeof window !== 'undefined') applyDarkMode(getInitialDark());
}

export function useDarkMode(): [boolean, () => void] {
    const [isDark, setIsDark] = useState<boolean>(getInitialDark);

    useEffect(() => {
        applyDarkMode(isDark);

        try {
            window.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDark));
        } catch {
            // The theme still works when storage is unavailable (private mode, policy, etc.).
        }
    }, [isDark]);

    useEffect(() => {
        const syncTheme = (event: StorageEvent) => {
            if (event.key === DARK_MODE_STORAGE_KEY && event.newValue !== null) {
                setIsDark(event.newValue === 'true');
            }
        };

        window.addEventListener('storage', syncTheme);
        return () => window.removeEventListener('storage', syncTheme);
    }, []);

    const toggle = useCallback(() => setIsDark((previous) => !previous), []);

    return [isDark, toggle];
}
