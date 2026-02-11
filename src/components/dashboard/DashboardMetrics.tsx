'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StatsData {
  byDate: { date: string; count: number }[];
  byType: { type: string; count: number }[];
  topUrls: { url: string; count: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  'readability-analyzer': 'Legibilidad',
  'words-repetition': 'Repetición',
  'coherency-evaluator': 'Coherencia',
  'keyword-suggestions': 'Keywords',
  'rewrite': 'Reescritura',
  'monitoring-check': 'Monitorización',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

interface DashboardMetricsProps {
  isPro: boolean;
}

export default function DashboardMetrics({ isPro }: DashboardMetricsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4" />
        <div className="h-48 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!stats || (stats.byDate.length === 0 && stats.byType.length === 0)) {
    return null;
  }

  const pieData = stats.byType.map(t => ({
    name: TYPE_LABELS[t.type] || t.type,
    value: t.count,
  }));

  if (!isPro) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 mb-6 relative overflow-hidden">
        <h2 className="text-lg font-semibold text-white mb-4">Métricas de uso</h2>
        <div className="blur-sm pointer-events-none">
          <div className="h-48 bg-gray-700 rounded" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/60">
          <div className="text-center">
            <p className="text-white font-semibold mb-2">Métricas avanzadas</p>
            <a href="/pricing" className="text-blue-400 hover:text-blue-300 text-sm underline">
              Mejorar a Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-6">Métricas de uso (últimos 30 días)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart - analyses by date */}
        {stats.byDate.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Análisis por día</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byDate}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie chart - by type */}
        {pieData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Por tipo de análisis</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(props) => `${props.name ?? ''} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top URLs */}
      {stats.topUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">URLs más analizadas</h3>
          <div className="space-y-2">
            {stats.topUrls.slice(0, 5).map(u => (
              <div key={u.url} className="flex justify-between items-center text-sm">
                <span className="text-gray-300 truncate max-w-[80%]">{u.url}</span>
                <span className="text-gray-500 shrink-0 ml-2">{u.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
