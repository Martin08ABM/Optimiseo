'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
  describedBy?: string;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  labelledBy,
  describedBy,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (dialog) {
      const first = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = labelledBy ?? (title ? 'modal-title' : undefined);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        className={`relative w-full ${SIZE_CLASSES[size]} rounded-xl border border-gray-700 bg-gray-900 shadow-2xl flex flex-col max-h-[90vh]`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4">
            <h2 id={titleId} className="text-lg font-bold text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar diálogo"
              className="text-gray-400 hover:text-white text-2xl leading-none -mt-1"
            >
              ×
            </button>
          </div>
        )}
        <div className="px-5 py-4 overflow-y-auto text-gray-200">{children}</div>
        {footer && <div className="border-t border-gray-700 px-5 py-4 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
