<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <script>
            (function () {
                var storageKey = 'skyline:theme-mode';
                var userTheme = @json(auth()->user()?->theme_preference);
                var mode = userTheme || null;

                if (!mode) {
                    try {
                        var stored = localStorage.getItem(storageKey);
                        if (stored === 'light' || stored === 'dark' || stored === 'system') {
                            mode = stored;
                        }
                    } catch (e) {}
                }

                if (!mode) mode = 'light';

                var applied = mode;
                if (mode === 'system') {
                    applied = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                var root = document.documentElement;
                root.classList.toggle('dark', applied === 'dark');
                root.setAttribute('data-theme-mode', mode);
                root.setAttribute('data-theme-applied', applied);
            })();
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Single entry: all pages load via import.meta.glob in app.jsx (avoids wrong Paths/Modules paths and stale dev-server URLs). --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
