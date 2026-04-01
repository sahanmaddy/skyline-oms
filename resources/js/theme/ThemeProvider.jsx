import { router } from '@inertiajs/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, persistThemeMode, readStoredThemeMode } from '@/theme/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialMode = 'system', persistToServer = false }) {
    const [mode, setModeState] = useState(initialMode);

    const setMode = useCallback(
        (nextMode) => {
            if (!['light', 'dark', 'system'].includes(nextMode)) return;

            setModeState(nextMode);
            persistThemeMode(nextMode);
            applyTheme(nextMode);

            if (persistToServer) {
                router.patch(
                    route('settings.system.theme'),
                    { theme_mode: nextMode },
                    { preserveScroll: true, preserveState: true, replace: true },
                );
            }
        },
        [persistToServer],
    );

    useEffect(() => {
        const stored = readStoredThemeMode();
        const effectiveMode = stored ?? initialMode ?? 'system';
        setModeState(effectiveMode);
        applyTheme(effectiveMode);
    }, [initialMode]);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (mode === 'system') {
                applyTheme('system');
            }
        };

        if (mq.addEventListener) {
            mq.addEventListener('change', handleSystemChange);
            return () => mq.removeEventListener('change', handleSystemChange);
        }

        mq.addListener(handleSystemChange);
        return () => mq.removeListener(handleSystemChange);
    }, [mode]);

    const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
}
