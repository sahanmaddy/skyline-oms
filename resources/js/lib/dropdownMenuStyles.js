/**
 * Shared visuals for action menus (@/Components/Dropdown) and form dropdowns
 * (Headless Listbox/Combobox panels + native <select> closed state).
 */

/** Floating menu panel: ring + shadow like Dropdown.Content inner wrapper. */
export const dropdownMenuPanelRingClass =
    'rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-cursor-surface';

/** Option row (Headless UI ListboxOption / ComboboxOption). */
export const dropdownMenuItemClass =
    'cursor-pointer px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 data-[focus]:bg-gray-100 data-[selected]:bg-gray-100 focus:outline-none dark:text-cursor-fg dark:data-[focus]:bg-[#3c3c3c] dark:data-[selected]:bg-[#3c3c3c]';

/** Inertia Link row inside Dropdown (keyboard focus uses :focus, not data-focus). */
export const dropdownMenuLinkClass =
    'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-cursor-fg';

/** Native select in forms — closed control matches menu trigger (border-gray-200, hover gray-50). */
export const formNativeSelectClass =
    'block min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-5 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised dark:focus:ring-cursor-accent-soft dark:focus:ring-offset-cursor-bg';

/** Border / padding / shadow / focus ring without text color (for triggers that color the label per state). */
export const formComboboxInputSurfaceClass =
    'block min-h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-5 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:hover:bg-cursor-raised dark:focus:ring-cursor-accent-soft dark:focus:ring-offset-cursor-bg';

/** Combobox text field — same surface as formNativeSelectClass. */
export const formComboboxInputClass = `${formComboboxInputSurfaceClass} text-gray-900 dark:text-cursor-fg`;

/** List/toolbar search fields — same focus ring as `TextInput` / combobox (indigo ring-2 + offset, dark mode). */
export const moduleListSearchInputClass = formComboboxInputClass;

/**
 * Filter field inside floating listbox panels (e.g. country search).
 * Slightly tighter padding than `formComboboxInputClass`; same ring as form fields.
 */
export const listboxPanelFilterInputClass =
    'block w-full cursor-text rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 shadow-sm transition duration-150 ease-in-out placeholder:text-gray-400 selection:bg-gray-100 selection:text-gray-900 hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:selection:bg-cursor-raised dark:hover:bg-cursor-raised dark:focus:ring-cursor-accent-soft dark:focus:ring-offset-cursor-bg';

/** Compact navbar native select (branch switcher). */
export const navNativeSelectClass =
    'block w-full rounded-md border border-gray-200 bg-white py-1.5 ps-2 pe-7 text-xs font-medium text-gray-800 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-cursor-accent focus:outline-none focus:ring-1 focus:ring-cursor-accent dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright';

export const navNativeSelectMobileClass =
    'block w-full rounded-md border border-gray-200 bg-white py-2 ps-2 pe-2 text-sm text-gray-800 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-cursor-accent focus:outline-none focus:ring-1 focus:ring-cursor-accent dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright';

/** Listbox trigger for navbar branch switcher (inline chevron; no native pe-7). */
export const navFormSelectTriggerClass =
    'block w-full min-w-0 truncate rounded-md border border-gray-200 bg-white py-1.5 ps-2 pe-2 text-xs font-medium text-gray-800 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-cursor-accent focus:outline-none focus:ring-1 focus:ring-cursor-accent dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright';

export const navFormSelectTriggerMobileClass =
    'block w-full rounded-md border border-gray-200 bg-white py-2 ps-2 pe-2 text-sm text-gray-800 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-cursor-accent focus:outline-none focus:ring-1 focus:ring-cursor-accent dark:border-cursor-border dark:bg-cursor-bg dark:text-cursor-bright';

/** Multi-line fields — same surface treatment as form inputs (not for Listbox triggers). */
export const formTextareaClass =
    'block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:border-cursor-border dark:bg-cursor-surface dark:text-cursor-fg dark:hover:bg-cursor-raised dark:focus:ring-cursor-accent-soft dark:focus:ring-offset-cursor-bg';
