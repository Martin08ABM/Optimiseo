'use client';

import { useState } from 'react';
import AnalysisCard from './AnalysisCard';
import ExportButtons from './ExportButtons';
import type { Analysis } from '@/src/types/subscription';

interface HistoryClientProps {
  analyses: Analysis[];
}

export default function HistoryClient({ analyses }: HistoryClientProps) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? analyses
    : analyses.filter(a => a.analysis_type === filter);

  return (
    <div>
      <div className="mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Todos los tipos</option>
          <option value="readability-analyzer">Legibilidad</option>
          <option value="words-repetition">Repetición de palabras</option>
          <option value="coherency-evaluator">Coherencia</option>
          <option value="keyword-suggestions">Sugerencias de Keywords</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          {analyses.length === 0
            ? 'No tienes análisis guardados todavía. Guarda un resultado desde la página principal.'
            : 'No hay análisis de este tipo.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(analysis => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              isExpanded={expandedId === analysis.id}
              onToggle={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
              renderActions={(a) => (
                <ExportButtons
                  analysisResult={(a.result as Record<string, string> | null)?.response || ''}
                  analysisData={{
                    url: a.url,
                    type: a.analysis_type,
                    date: a.created_at,
                    result: (a.result as Record<string, string> | null)?.response || '',
                  }}
                />
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
