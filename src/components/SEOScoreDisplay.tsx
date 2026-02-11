'use client';

import type { SEOScores } from '@/src/lib/seo/scoreParser';

interface SEOScoreDisplayProps {
  scores: SEOScores;
}

function getScoreColor(score: number): string {
  if (score < 40) return '#ef4444'; // red
  if (score < 70) return '#eab308'; // yellow
  return '#22c55e'; // green
}

function getScoreLabel(score: number): string {
  if (score < 40) return 'Necesita mejorar';
  if (score < 70) return 'Aceptable';
  return 'Bueno';
}

const CATEGORY_LABELS: Record<string, string> = {
  contenido: 'Contenido',
  legibilidad: 'Legibilidad',
  keywords: 'Keywords',
  estructura: 'Estructura',
  metaTags: 'Meta Tags',
};

export default function SEOScoreDisplay({ scores }: SEOScoreDisplayProps) {
  const color = getScoreColor(scores.overall);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scores.overall / 100) * circumference;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-white mb-4">Puntuación SEO</h4>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background circle */}
            <circle
              cx="65" cy="65" r={radius}
              fill="none" stroke="#374151" strokeWidth="10"
            />
            {/* Score arc */}
            <circle
              cx="65" cy="65" r={radius}
              fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{scores.overall}</span>
            <span className="text-xs text-gray-400">{getScoreLabel(scores.overall)}</span>
          </div>
        </div>

        {/* Category bars */}
        <div className="flex-1 w-full space-y-3">
          {(Object.entries(scores.categories) as [string, number][]).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{CATEGORY_LABELS[key] || key}</span>
                <span className="text-gray-400">{value}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${value}%`, backgroundColor: getScoreColor(value) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
