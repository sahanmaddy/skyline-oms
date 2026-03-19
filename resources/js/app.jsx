import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
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

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
