'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL = 2000;

type Status = 'polling' | 'success' | 'timeout';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isCheckout = searchParams.get('checkout') === 'success';

  const [status, setStatus] = useState<Status>('polling');
  const [attempt, setAttempt] = useState(0);

  const pollSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) return false;
      const data = await res.json();
      return data?.subscription?.plan_id === 'pro';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isCheckout || status !== 'polling') return;

    const timer = setTimeout(async () => {
      const isPro = await pollSubscription();
      if (isPro) {
        setStatus('success');
        setTimeout(() => router.refresh(), 1500);
      } else if (attempt + 1 >= MAX_ATTEMPTS) {
        setStatus('timeout');
      } else {
        setAttempt((a) => a + 1);
      }
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [isCheckout, status, attempt, pollSubscription, router]);

  if (!isCheckout) return null;

  if (status === 'success') {
    return (
      <div className="mb-4 rounded-lg bg-green-900/60 border border-green-500/40 px-4 py-3 text-green-200 text-sm flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Pago confirmado. Tu plan Pro ya está activo.</span>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="mb-4 rounded-lg bg-yellow-900/60 border border-yellow-500/40 px-4 py-3 text-yellow-200 text-sm flex items-center gap-2">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
        </svg>
        <span>
          Tu pago se ha recibido, pero puede tardar unos minutos en activarse.{' '}
          <button
            onClick={() => window.location.reload()}
            className="underline font-medium hover:text-yellow-100"
          >
            Recargar página
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg bg-blue-900/60 border border-blue-500/40 px-4 py-3 text-blue-200 text-sm flex items-center gap-2">
      <svg className="h-5 w-5 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>Procesando tu pago...</span>
    </div>
  );
}
