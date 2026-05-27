import { useEffect, useState } from 'react';

const STORAGE_KEY = 'erp-dark-mode';

function getInitialDark(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode(): [boolean, () => void] {
    const [isDark, setIsDark] = useState<boolean>(getInitialDark);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, String(isDark));
    }, [isDark]);

    const toggle = () => setIsDark((prev) => !prev);

    return [isDark, toggle];
}