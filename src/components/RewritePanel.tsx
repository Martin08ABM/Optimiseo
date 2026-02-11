'use client';

import { useState } from 'react';
import type { ScrapedContent } from '@/src/app/api/ai/shared/types';
import RewriteButton from './RewriteButton';

interface RewritePanelProps {
  scrapedData: ScrapedContent;
}

export default function RewritePanel({ scrapedData }: RewritePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const context = { url: scrapedData.url, title: scrapedData.title };
  const hasItems = scrapedData.title || scrapedData.description || scrapedData.h1.length > 0 || scrapedData.paragraphs.length > 0;

  if (!hasItems) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center"
      >
        <h4 className="font-semibold text-white">Reescritura asistida por IA</h4>
        <span className="text-gray-500 text-xs">{expanded ? '\u25BC' : '\u25B6'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Title */}
          {scrapedData.title && (
            <div className="border-b border-gray-700 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Title</span>
                  <p className="text-gray-300 text-sm mt-1 truncate">{scrapedData.title}</p>
                </div>
                <RewriteButton originalText={scrapedData.title} elementType="title" context={context} />
              </div>
            </div>
          )}

          {/* Meta description */}
          {scrapedData.description && (
            <div className="border-b border-gray-700 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">Meta Description</span>
                  <p className="text-gray-300 text-sm mt-1">{scrapedData.description}</p>
                </div>
                <RewriteButton originalText={scrapedData.description} elementType="meta-description" context={context} />
              </div>
            </div>
          )}

          {/* H1 */}
          {scrapedData.h1[0] && (
            <div className="border-b border-gray-700 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500 uppercase">H1</span>
                  <p className="text-gray-300 text-sm mt-1">{scrapedData.h1[0]}</p>
                </div>
                <RewriteButton originalText={scrapedData.h1[0]} elementType="h1" context={context} />
              </div>
            </div>
          )}

          {/* First 2 paragraphs */}
          {scrapedData.paragraphs.slice(0, 2).map((p, i) => (
            p.length > 50 && (
              <div key={i} className={i < scrapedData.paragraphs.slice(0, 2).length - 1 ? "border-b border-gray-700 pb-3" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500 uppercase">Párrafo {i + 1}</span>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-3">{p}</p>
                  </div>
                  <RewriteButton originalText={p} elementType="paragraph" context={context} />
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
