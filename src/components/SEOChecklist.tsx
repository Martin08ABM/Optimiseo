'use client';

import { useState } from 'react';
import type { ScrapedContent } from '@/src/app/api/ai/shared/types';
import { generateSEOChecklist, CATEGORY_LABELS } from '@/src/lib/seo/checklist';
import type { ChecklistItem } from '@/src/lib/seo/checklist';

interface SEOChecklistProps {
  scrapedData: ScrapedContent;
}

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  pass: { icon: '\u2713', color: 'text-green-400' },
  warning: { icon: '\u26A0', color: 'text-yellow-400' },
  fail: { icon: '\u2717', color: 'text-red-400' },
};

export default function SEOChecklist({ scrapedData }: SEOChecklistProps) {
  const checklist = generateSEOChecklist(scrapedData);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = [...new Set(checklist.items.map(i => i.category))];

  const grouped = categories.reduce<Record<string, ChecklistItem[]>>((acc, cat) => {
    acc[cat] = checklist.items.filter(i => i.category === cat);
    return acc;
  }, {});

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-white mb-3">Checklist SEO</h4>

      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-green-400 font-medium">{checklist.summary.pass} aprobados</span>
        <span className="text-yellow-400 font-medium">{checklist.summary.warning} advertencias</span>
        <span className="text-red-400 font-medium">{checklist.summary.fail} fallidos</span>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat} className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex justify-between items-center px-3 py-2 bg-gray-800 hover:bg-gray-750 transition-colors text-sm"
            >
              <span className="text-gray-200 font-medium">{CATEGORY_LABELS[cat] || cat}</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xs">{grouped[cat].filter(i => i.status === 'pass').length}</span>
                <span className="text-yellow-400 text-xs">{grouped[cat].filter(i => i.status === 'warning').length}</span>
                <span className="text-red-400 text-xs">{grouped[cat].filter(i => i.status === 'fail').length}</span>
                <span className="text-gray-500 text-xs">{collapsed[cat] ? '\u25B6' : '\u25BC'}</span>
              </div>
            </button>

            {!collapsed[cat] && (
              <div className="divide-y divide-gray-700">
                {grouped[cat].map(item => {
                  const s = STATUS_ICONS[item.status];
                  return (
                    <div key={item.id} className="flex items-start gap-3 px-3 py-2 text-sm">
                      <span className={`${s.color} mt-0.5 shrink-0 font-bold`}>{s.icon}</span>
                      <div>
                        <span className="text-gray-200">{item.label}</span>
                        <p className="text-gray-500 text-xs mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
