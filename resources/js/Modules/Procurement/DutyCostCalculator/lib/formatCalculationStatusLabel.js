/** Display label for `calculation_status` (values stay lowercase in the API). */
export function formatCalculationStatusLabel(value) {
    const s = String(value ?? '').trim();
    if (!s) {
        return '—';
    }
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
