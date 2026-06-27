'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-600 border-emerald-400',
  error: 'bg-red-600 border-red-400',
  info: 'bg-blue-600 border-blue-400',
  warning: 'bg-amber-600 border-amber-400',
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
  warning: '⚠',
};

const VARIANT_LABEL: Record<ToastVariant, string> = {
  success: 'Éxito',
  error: 'Error',
  info: 'Información',
  warning: 'Aviso',
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    toast,
    success: (m, d) => toast(m, 'success', d),
    error: (m, d) => toast(m, 'error', d ?? 6000),
    info: (m, d) => toast(m, 'info', d),
    warning: (m, d) => toast(m, 'warning', d ?? 5000),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        role="region"
        aria-label="Notificaciones"
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-[calc(100vw-2rem)]"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-white shadow-lg ${VARIANT_STYLES[toast.variant]}`}
    >
      <span aria-hidden="true" className="text-lg leading-none mt-0.5">
        {VARIANT_ICON[toast.variant]}
      </span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="text-white/80 hover:text-white leading-none -mt-0.5"
      >
        ×
      </button>
      <span className="sr-only">{VARIANT_LABEL[toast.variant]}</span>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return ctx;
}
