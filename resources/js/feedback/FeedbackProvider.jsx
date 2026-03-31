import ConfirmationDialog from '@/Components/ConfirmationDialog';
import { router } from '@inertiajs/react';
import { Toast } from 'primereact/toast';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const FeedbackContext = createContext(null);

const TOAST_CONFIG = {
    success: { summary: 'Success', life: 3200 },
    info: { summary: 'Info', life: 3800 },
    warning: { summary: 'Attention', life: 4800 },
    error: { summary: 'Action failed', sticky: true },
};

function normalizeFlash(flash) {
    if (!flash || typeof flash !== 'object') return [];

    return ['success', 'error', 'warning', 'info']
        .filter((type) => flash[type])
        .map((type) => ({ type, message: flash[type] }));
}

export default function FeedbackProvider({ children, initialFlash = null }) {
    const [currentFlash, setCurrentFlash] = useState(initialFlash);
    const [confirmState, setConfirmState] = useState({
        open: false,
        processing: false,
        options: {},
        resolver: null,
    });
    const seenFlashKeyRef = useRef('');
    const toastRef = useRef(null);
    const confirmOpenRef = useRef(false);
    const confirmSuppressUntilRef = useRef(0);

    const pushToast = useCallback((type, message) => {
        if (!message) return;
        const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;
        toastRef.current?.show({
            severity: type,
            summary: config.summary,
            detail: message,
            life: config.life,
            sticky: Boolean(config.sticky),
            className: `erp-toast erp-toast--${type}`,
        });
    }, []);

    useEffect(() => {
        setCurrentFlash(initialFlash);
    }, [initialFlash]);

    useEffect(() => {
        const off = router.on('success', (event) => {
            setCurrentFlash(event?.detail?.page?.props?.flash ?? null);
        });
        return () => off();
    }, []);

    useEffect(() => {
        const key = JSON.stringify(currentFlash ?? {});
        if (key === seenFlashKeyRef.current) return;
        seenFlashKeyRef.current = key;

        const flashToasts = normalizeFlash(currentFlash);
        if (!flashToasts.length) return;
        flashToasts.forEach(({ type, message }) => pushToast(type, message));
    }, [currentFlash, pushToast]);

    const confirm = useCallback((options) => {
        if (Date.now() < confirmSuppressUntilRef.current) {
            return Promise.resolve(false);
        }

        if (confirmOpenRef.current) {
            return Promise.resolve(false);
        }

        // Guard accidental event-handler calls such as onClick={confirm},
        // confirm() with no args, or string-based usage.
        if (!options || typeof options !== 'object') {
            return Promise.resolve(false);
        }

        const normalizedOptions = options;

        if (!normalizedOptions.title && !normalizedOptions.message) {
            return Promise.resolve(false);
        }

        return new Promise((resolve) => {
            confirmOpenRef.current = true;
            setConfirmState({
                open: true,
                processing: false,
                options: {
                    title: normalizedOptions.title || 'Confirm action',
                    message:
                        normalizedOptions.message || 'Are you sure you want to continue?',
                    confirmText: normalizedOptions.confirmText || 'Confirm',
                    cancelText: normalizedOptions.cancelText || 'Cancel',
                    variant: normalizedOptions.variant || 'default',
                },
                resolver: resolve,
            });
        });
    }, []);

    const closeConfirm = useCallback((result) => {
        setConfirmState((prev) => {
            if (!prev.open || !prev.resolver) {
                confirmOpenRef.current = false;
                return prev;
            }

            confirmOpenRef.current = false;
            confirmSuppressUntilRef.current = Date.now() + 250;

            if (prev.resolver) {
                prev.resolver(result);
            }
            return {
                open: false,
                processing: false,
                options: prev.options,
                resolver: null,
            };
        });
    }, []);

    const setConfirmProcessing = useCallback((processing) => {
        setConfirmState((prev) => ({ ...prev, processing }));
    }, []);

    const value = useMemo(
        () => ({
            toast: {
                success: (message) => pushToast('success', message),
                error: (message) => pushToast('error', message),
                warning: (message) => pushToast('warning', message),
                info: (message) => pushToast('info', message),
            },
            confirm,
            setConfirmProcessing,
        }),
        [confirm, pushToast, setConfirmProcessing],
    );

    return (
        <FeedbackContext.Provider value={value}>
            {children}
            <Toast ref={toastRef} position="top-right" baseZIndex={6000} />

            <ConfirmationDialog
                open={confirmState.open}
                title={confirmState.options.title}
                message={confirmState.options.message}
                confirmText={confirmState.options.confirmText}
                cancelText={confirmState.options.cancelText}
                variant={confirmState.options.variant}
                processing={confirmState.processing}
                onCancel={() => closeConfirm(false)}
                onConfirm={() => closeConfirm(true)}
            />
        </FeedbackContext.Provider>
    );
}
