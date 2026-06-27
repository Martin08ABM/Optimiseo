'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RetryButtonProps {
  label?: string;
  className?: string;
}

export function RetryButton({ label = 'Reintentar', className }: RetryButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRetry = () => {
    setLoading(true);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={loading}
      className={
        className ??
        'px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm transition-colors'
      }
    >
      {loading ? 'Reintentando…' : label}
    </button>
  );
}
