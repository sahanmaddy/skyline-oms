import '../css/app.css';
import './bootstrap';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { createInertiaApp, router } from '@inertiajs/react';
import FeedbackProvider from '@/feedback/FeedbackProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { createRoot } from 'react-dom/client';

function appTitleBase() {
    const fromRuntime =
        typeof window !== 'undefined' ? window.__APP_DISPLAY_NAME__ : null;
    if (typeof fromRuntime === 'string' && fromRuntime.trim() !== '') {
        return fromRuntime.trim();
    }
    return import.meta.env.VITE_APP_NAME || 'Skyline OMS';
}

const pageComponents = import.meta.glob(['./Pages/**/*.jsx', './Modules/**/*.jsx']);

createInertiaApp({
    title: (pageTitle) => {
        const base = appTitleBase();
        if (!pageTitle) {
            return base;
        }
        return `${pageTitle} — ${base}`;
    },
    resolve: async (name) => {
        const candidates = [`./Pages/${name}.jsx`, `./${name}.jsx`];
        for (const path of candidates) {
            if (pageComponents[path]) {
                return pageComponents[path]();
            }
        }

        throw new Error(`Page not found: ${name}`);
    },
    setup({ el, App, props }) {
        if (typeof window !== 'undefined') {
            window.__APP_DISPLAY_NAME__ =
                props?.initialPage?.props?.app_display_name ||
                import.meta.env.VITE_APP_NAME ||
                'Skyline OMS';
        }

        router.on('navigate', (event) => {
            const nextName = event?.detail?.page?.props?.app_display_name;
            if (typeof nextName === 'string' && nextName.trim() !== '') {
                window.__APP_DISPLAY_NAME__ = nextName.trim();
            }
        });

        const root = createRoot(el);

        root.render(
            <ThemeProvider
                initialMode={props?.initialPage?.props?.auth?.user?.theme_preference ?? 'system'}
                persistToServer={Boolean(props?.initialPage?.props?.auth?.user)}
            >
                <FeedbackProvider initialFlash={props?.initialPage?.props?.flash ?? null}>
                    <App {...props} />
                </FeedbackProvider>
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#007acc',
    },
});
