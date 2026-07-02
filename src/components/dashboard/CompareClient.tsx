'use client';

import { useState, useMemo } from 'react';
import { diffLines } from 'diff';
import type { Analysis } from '@/src/types/subscription';

interface CompareClientProps {
  analyses: Analysis[];
}

export default function CompareClient({ analyses }: CompareClientProps) {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Group analyses by URL
  const urlGroups = useMemo(() => {
    const groups = new Map<string, Analysis[]>();
    for (const a of analyses) {
      const list = groups.get(a.url) || [];
      list.push(a);
      groups.set(a.url, list);
    }
    // Only show URLs with 2+ analyses
    return new Map([...groups.entries()].filter(([, v]) => v.length >= 2));
  }, [analyses]);

  const urlAnalyses = selectedUrl ? (urlGroups.get(selectedUrl) || []) : [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const [analysisA, analysisB] = useMemo(() => {
    if (selectedIds.length < 2) return [null, null];
    return [
      analyses.find(a => a.id === selectedIds[0]) || null,
      analyses.find(a => a.id === selectedIds[1]) || null,
    ];
  }, [selectedIds, analyses]);

  const diffResult = useMemo(() => {
    if (!analysisA || !analysisB) return null;
    const textA = (analysisA.result as Record<string, string> | null)?.response || '';
    const textB = (analysisB.result as Record<string, string> | null)?.response || '';
    return diffLines(textA, textB);
  }, [analysisA, analysisB]);

  if (urlGroups.size === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        Necesitas al menos 2 análisis guardados de la misma URL para compararlos.
      </p>
    );
  }

  return (
    <div>
      {/* URL selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 block mb-1">Selecciona una URL</label>
        <select
          value={selectedUrl}
          onChange={e => { setSelectedUrl(e.target.value); setSelectedIds([]); }}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm w-full max-w-lg"
        >
          <option value="">-- Seleccionar URL --</option>
          {[...urlGroups.entries()].map(([url, list]) => (
            <option key={url} value={url}>{url} ({list.length} análisis)</option>
          ))}
        </select>
      </div>

      {/* Analysis selector */}
      {urlAnalyses.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Selecciona 2 análisis para comparar:</p>
          <div className="flex flex-col gap-2">
            {urlAnalyses.map(a => {
              const isSelected = selectedIds.includes(a.id);
              const date = new Date(a.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              });
              return (
                <button
                  key={a.id}
                  onClick={() => toggleSelect(a.id)}
                  className={`text-left text-sm px-4 py-2 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {date} — {a.analysis_type}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Diff view */}
      {diffResult && (
        <div
          className="bg-gray-900 rounded-xl p-4 overflow-auto"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>Anterior: {new Date(analysisA!.created_at).toLocaleDateString('es-ES')}</span>
            <span>Nuevo: {new Date(analysisB!.created_at).toLocaleDateString('es-ES')}</span>
          </div>
          <p className="sr-only">
            Leyenda del diff: el fondo verde indica líneas añadidas en el nuevo análisis;
            el fondo rojo indica líneas eliminadas respecto al anterior.
          </p>
          <div className="text-xs text-gray-400 mb-3 flex gap-4">
            <span><span className="inline-block w-3 h-3 align-middle bg-green-900/50 border-l-2 border-green-500 mr-1" />Añadido</span>
            <span><span className="inline-block w-3 h-3 align-middle bg-red-900/50 border-l-2 border-red-500 mr-1" />Eliminado</span>
          </div>
          <pre className="text-sm leading-relaxed whitespace-pre-wrap">
            {diffResult.map((part, i) => {
              if (part.added) {
                return (
                  <span key={i} className="block bg-green-900/30 border-l-2 border-green-500 pl-2">
                    <span className="sr-only">Añadido: </span>
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span key={i} className="block bg-red-900/30 border-l-2 border-red-500 pl-2">
                    <span className="sr-only">Eliminado: </span>
                    {part.value}
                  </span>
                );
              }
              return <span key={i} className="block text-gray-300 pl-2">{part.value}</span>;
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
