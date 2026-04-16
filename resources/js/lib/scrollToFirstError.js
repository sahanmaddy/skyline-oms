export function scrollToFirstError() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    const scrollToTopMostError = () => {
        const errorNodes = Array.from(document.querySelectorAll('[data-field-error="true"]'));
        if (!errorNodes.length) {
            return false;
        }

        const topMost = errorNodes.reduce((best, current) => {
            const bestTop = best.getBoundingClientRect().top;
            const currentTop = current.getBoundingClientRect().top;
            return currentTop < bestTop ? current : best;
        });

        topMost.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        });

        return true;
    };

    // Retry a few times to allow Inertia error DOM to render.
    const attempts = [0, 60, 180];
    attempts.forEach((delay) => {
        window.setTimeout(() => {
            scrollToTopMostError();
        }, delay);
    });
}
