'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Analysis } from '@/src/types/subscription';
import SEOScoreDisplay from '@/src/components/SEOScoreDisplay';
import type { SEOScores } from '@/src/lib/seo/scoreParser';

const TYPE_LABELS: Record<string, string> = {
  'readability-analyzer': 'Legibilidad',
  'words-repetition': 'Repetición de palabras',
  'coherency-evaluator': 'Coherencia',
  'keyword-suggestions': 'Keywords',
};

interface AnalysisCardProps {
  analysis: Analysis;
  isExpanded: boolean;
  onToggle: () => void;
  renderActions?: (analysis: Analysis) => React.ReactNode;
}

export default function AnalysisCard({ analysis, isExpanded, onToggle, renderActions }: AnalysisCardProps) {
  const date = new Date(analysis.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const resultObj = analysis.result as Record<string, unknown> | null;
  const resultText = (resultObj?.response as string) || '';
  const scores = (resultObj?.scores as SEOScores) || null;
  const preview = resultText.slice(0, 150) + (resultText.length > 150 ? '...' : '');

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-gray-750 transition-colors"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 truncate">{analysis.url}</p>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {scores && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                scores.overall >= 70 ? 'bg-green-600/80' : scores.overall >= 40 ? 'bg-yellow-600/80' : 'bg-red-600/80'
              } text-white`}>
                {scores.overall}
              </span>
            )}
            <span className="text-xs bg-blue-600/80 text-white px-2 py-1 rounded-full">
              {TYPE_LABELS[analysis.analysis_type] || analysis.analysis_type}
            </span>
          </div>
        </div>
        {!isExpanded && preview && (
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{preview}</p>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700 p-4">
          {scores && <SEOScoreDisplay scores={scores} />}
          <div className="bg-gray-900 rounded-lg p-4 prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:mt-4 prose-headings:mb-2
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:marker:text-blue-400
            prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-table:text-gray-300 prose-th:text-white prose-th:border-gray-600 prose-td:border-gray-700
            prose-hr:border-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resultText}
            </ReactMarkdown>
          </div>
          {renderActions && (
            <div className="mt-3">
              {renderActions(analysis)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
