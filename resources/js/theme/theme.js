export const THEME_STORAGE_KEY = 'skyline:theme-mode';

export function resolveAppliedTheme(mode) {
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(mode) {
    const root = document.documentElement;
    const applied = resolveAppliedTheme(mode);
    root.classList.toggle('dark', applied === 'dark');
    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme-applied', applied);
}

export function readStoredThemeMode() {
    try {
        const mode = localStorage.getItem(THEME_STORAGE_KEY);
        return mode === 'light' || mode === 'dark' || mode === 'system' ? mode : null;
    } catch {
        return null;
    }
}

export function persistThemeMode(mode) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // Ignore storage errors (private mode / disabled storage).
    }
}
