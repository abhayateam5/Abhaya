'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const addToast = React.useCallback((type: ToastType, message: string, duration = 5000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            {mounted && createPortal(<ToastContainer />, document.body)}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

const toastIcons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary" />,
};

const toastStyles: Record<ToastType, string> = {
    success: 'border-l-4 border-l-success',
    error: 'border-l-4 border-l-danger',
    warning: 'border-l-4 border-l-warning',
    info: 'border-l-4 border-l-primary',
};

interface ToastItemProps {
    toast: Toast;
    onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 bg-background-soft border border-border rounded-lg shadow-lg animate-slide-up',
                toastStyles[toast.type]
            )}
        >
            {toastIcons[toast.type]}
            <p className="flex-1 text-sm text-foreground">{toast.message}</p>
            <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Convenience functions for direct use
export const toast = {
    success: (message: string, duration?: number) => {
        const event = new CustomEvent('toast', { detail: { type: 'success', message, duration } });
        window.dispatchEvent(event);
    },
    error: (message: string, duration?: number) => {
        const event = new CustomEvent('toast', { detail: { type: 'error', message, duration } });
        window.dispatchEvent(event);
    },
    warning: (message: string, duration?: number) => {
        const event = new CustomEvent('toast', { detail: { type: 'warning', message, duration } });
        window.dispatchEvent(event);
    },
    info: (message: string, duration?: number) => {
        const event = new CustomEvent('toast', { detail: { type: 'info', message, duration } });
        window.dispatchEvent(event);
    },
};
