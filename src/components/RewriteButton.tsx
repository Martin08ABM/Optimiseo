'use client';

import { useState } from 'react';

interface RewriteButtonProps {
  originalText: string;
  elementType: 'meta-description' | 'title' | 'h1' | 'paragraph';
  context: { url: string; title?: string };
  onApplyText?: (elementType: string, text: string) => void;
}

export default function RewriteButton({ originalText, elementType, context, onApplyText }: RewriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [improved, setImproved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalText, elementType, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reescribir');
      setImproved(data.improved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!improved) return;
    await navigator.clipboard.writeText(improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (improved) {
    return (
      <div className="mt-2 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-400 font-medium text-xs">Texto mejorado</span>
          <div className="flex gap-1.5">
            {onApplyText && (
              <button
                onClick={() => onApplyText(elementType, improved)}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors font-medium"
              >
                Aplicar
              </button>
            )}
            <button
              onClick={handleCopy}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
            >
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{improved}</p>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={handleRewrite}
        disabled={loading}
        className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 flex items-center gap-1 transition-colors bg-gray-800/50 hover:bg-gray-700/50 px-2.5 py-1.5 border border-gray-700 rounded-md"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        {loading ? 'Mejorando…' : 'Mejorar'}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-400 ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
