import { FeedbackContext } from '@/feedback/FeedbackProvider';
import { useContext } from 'react';

export default function useToast() {
    const ctx = useContext(FeedbackContext);
    if (!ctx) {
        throw new Error('useToast must be used inside FeedbackProvider');
    }
    return ctx.toast;
}
