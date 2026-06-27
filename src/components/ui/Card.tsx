import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export function Card({ children, className = '', highlighted = false }: CardProps) {
  const base = 'rounded-xl border p-6';
  const tone = highlighted
    ? 'bg-blue-600/10 border-blue-500'
    : 'bg-gray-800 border-gray-700';
  return <div className={`${base} ${tone} ${className}`}>{children}</div>;
}
