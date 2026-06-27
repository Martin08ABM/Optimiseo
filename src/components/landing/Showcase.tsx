'use client';

import { useId, useState, type ReactNode } from 'react';

interface ShowcaseProps {
  title: string;
  description: string;
  icon: ReactNode;
  accentClass?: string;
  children: ReactNode;
}

export default function Showcase({
  title,
  description,
  icon,
  accentClass = 'bg-blue-600 hover:bg-blue-700',
  children,
}: ShowcaseProps) {
  const [showExample, setShowExample] = useState(false);
  const contentId = useId();

  return (
    <div className="border-2 border-gray-600 rounded-2xl px-6 py-5 bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400" aria-hidden="true">
              {icon}
            </span>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowExample(!showExample)}
          aria-expanded={showExample}
          aria-controls={contentId}
          className={`ml-4 px-3 py-1 ${accentClass} rounded-lg text-xs font-medium transition-colors`}
        >
          {showExample ? 'Ocultar' : 'Ver ejemplo'}
        </button>
      </div>

      {showExample && (
        <div id={contentId} className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
