import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Cursor / VS Code Dark+–aligned neutrals + accent (workbench defaults)
                cursor: {
                    bg: '#1e1e1e',
                    surface: '#252526',
                    raised: '#2d2d30',
                    border: '#3c3c3c',
                    'border-muted': '#454545',
                    muted: '#858585',
                    fg: '#cccccc',
                    bright: '#e6e6e6',
                    accent: '#007acc',
                    'accent-soft': '#75beff',
                },
            },
        },
    },

    plugins: [forms],
};
