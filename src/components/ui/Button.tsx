'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white border border-transparent disabled:opacity-60',
  secondary:
    'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 disabled:opacity-60',
  danger:
    'bg-red-600 hover:bg-red-700 text-white border border-transparent disabled:opacity-60',
  ghost:
    'bg-transparent hover:bg-gray-800 text-gray-200 border border-transparent disabled:opacity-60',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth = false, children, className, disabled, ...rest },
  ref
) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} disabled={disabled || loading} className={classes} {...rest}>
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </button>
  );
});
