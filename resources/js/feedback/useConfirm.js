import { FeedbackContext } from '@/feedback/FeedbackProvider';
import { useContext } from 'react';

export default function useConfirm() {
    const ctx = useContext(FeedbackContext);
    if (!ctx) {
        throw new Error('useConfirm must be used inside FeedbackProvider');
    }
    return {
        confirm: ctx.confirm,
        setConfirmProcessing: ctx.setConfirmProcessing,
    };
}
