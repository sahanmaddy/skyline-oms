import ModuleStickyTitle from '@/Components/ModuleStickyTitle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsModuleLayout from '@/Layouts/SettingsModuleLayout';
import { useTheme } from '@/theme/ThemeProvider';
import { Head } from '@inertiajs/react';

const OPTIONS = [
    {
        value: 'light',
        title: 'Light',
        description: 'Always use light appearance.',
        icon: 'sun',
    },
    {
        value: 'dark',
        title: 'Dark',
        description: 'Always use dark appearance.',
        icon: 'moon',
    },
    {
        value: 'system',
        title: 'Automatic',
        description: 'Match your device setting.',
        icon: 'desktop',
    },
];

function Icon({ type }) {
    if (type === 'sun') {
        return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    if (type === 'moon') {
        return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                    d="M21 12.79A9 9 0 1 1 11.21 3c0 4.97 4.03 9 9 9 .27 0 .53-.01.79-.03Z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
                d="M4 5h16v10H4zM8 19h8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Edit() {
    const { mode, setMode } = useTheme();

    return (
        <AuthenticatedLayout header={<ModuleStickyTitle module="Settings" section="System Settings" />}>
            <Head title="System Settings · Settings" />

            <SettingsModuleLayout breadcrumbs={[{ label: 'System Settings' }]}>
                <div className="space-y-6">
                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-cursor-border dark:bg-cursor-surface sm:p-8">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-cursor-bright">
                                Appearance
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-cursor-muted">
                                Choose how Skyline OMS looks for your account.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {OPTIONS.map((option) => {
                                const selected = mode === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setMode(option.value)}
                                        className={
                                            'rounded-lg border p-4 text-left transition ' +
                                            (selected
                                                ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-300 dark:border-cursor-accent dark:bg-cursor-accent/10 dark:ring-cursor-accent/35'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-cursor-border dark:bg-cursor-surface dark:hover:border-cursor-border-muted dark:hover:bg-cursor-raised')
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={
                                                    selected
                                                        ? 'text-indigo-600 dark:text-cursor-accent-soft'
                                                        : 'text-gray-500 dark:text-cursor-muted'
                                                }
                                            >
                                                <Icon type={option.icon} />
                                            </span>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-cursor-bright">
                                                {option.title}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-cursor-muted">
                                            {option.description}
                                        </p>
                                        {selected ? (
                                            <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-cursor-accent/20 dark:text-cursor-accent-soft">
                                                Selected
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </SettingsModuleLayout>
        </AuthenticatedLayout>
    );
}
