import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmationDialog({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    processing = false,
    onConfirm,
    onCancel,
}) {
    const handleCancel = (event) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if (processing) return;
        onCancel?.();
    };

    const handleConfirm = (event) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if (processing) return;
        onConfirm?.();
    };

    const confirmButton =
        variant === 'destructive' ? (
            <DangerButton type="button" onClick={handleConfirm} disabled={processing}>
                {confirmText}
            </DangerButton>
        ) : (
            <button
                type="button"
                onClick={handleConfirm}
                disabled={processing}
                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
            >
                {confirmText}
            </button>
        );

    return (
        <Modal show={open} onClose={processing ? () => {} : handleCancel} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={handleCancel} disabled={processing}>
                        {cancelText}
                    </SecondaryButton>
                    {confirmButton}
                </div>
            </div>
        </Modal>
    );
}
