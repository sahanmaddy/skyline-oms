import '../css/app.css';
import './bootstrap';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { createInertiaApp } from '@inertiajs/react';
import FeedbackProvider from '@/feedback/FeedbackProvider';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pageComponents = import.meta.glob(['./Pages/**/*.jsx', './Modules/**/*.jsx']);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
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
        const root = createRoot(el);

        root.render(
            <FeedbackProvider initialFlash={props?.initialPage?.props?.flash ?? null}>
                <App {...props} />
            </FeedbackProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
