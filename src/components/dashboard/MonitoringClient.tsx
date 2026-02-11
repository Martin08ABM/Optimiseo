'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonitoredUrl {
  id: string;
  url: string;
  frequency: string;
  last_checked: string | null;
  last_score: number | null;
  is_active: boolean;
  created_at: string;
}

interface HistoryPoint {
  date: string;
  score: number;
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export default function MonitoringClient() {
  const [urls, setUrls] = useState<MonitoredUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newFreq, setNewFreq] = useState('weekly');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const res = await fetch('/api/monitoring');
      const data = await res.json();
      setUrls(data.urls || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, frequency: newFreq }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUrls(prev => [data.url, ...prev]);
      setNewUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al añadir');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/monitoring/${id}`, { method: 'DELETE' });
      setUrls(prev => prev.filter(u => u.id !== id));
    } catch {
      // silent
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/monitoring/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setUrls(prev => prev.map(u => u.id === id ? data.url : u));
      }
    } catch {
      // silent
    }
  };

  const handleFrequencyChange = async (id: string, frequency: string) => {
    try {
      const res = await fetch(`/api/monitoring/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency }),
      });
      const data = await res.json();
      if (res.ok) {
        setUrls(prev => prev.map(u => u.id === id ? data.url : u));
      }
    } catch {
      // silent
    }
  };

  const handleExpand = async (url: MonitoredUrl) => {
    if (expandedId === url.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(url.id);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/monitoring/history?url=${encodeURIComponent(url.url)}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-800 rounded-xl" />
        <div className="h-20 bg-gray-800 rounded-xl" />
        <div className="h-20 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Add URL form */}
      <form onSubmit={handleAdd} className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://tu-sitio.com"
            className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm"
            required
          />
          <select
            value={newFreq}
            onChange={e => setNewFreq(e.target.value)}
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
          <button
            type="submit"
            disabled={adding}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {adding ? 'Añadiendo...' : 'Añadir URL'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>

      {/* URL list */}
      {urls.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No tienes URLs monitorizadas. Añade una para empezar.
        </p>
      ) : (
        <div className="space-y-3">
          {urls.map(url => (
            <div key={url.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  {/* URL + info */}
                  <button
                    onClick={() => handleExpand(url)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm text-gray-300 truncate">{url.url}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {url.last_checked
                        ? `Último chequeo: ${new Date(url.last_checked).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                        : 'Sin chequear aún'}
                    </p>
                  </button>

                  {/* Score badge */}
                  <span className={`text-sm font-bold ${getScoreColor(url.last_score)} shrink-0`}>
                    {url.last_score !== null ? url.last_score : '-'}
                  </span>

                  {/* Frequency selector */}
                  <select
                    value={url.frequency}
                    onChange={e => handleFrequencyChange(url.id, e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs shrink-0"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>

                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(url.id, url.is_active)}
                    className={`text-xs px-2 py-1 rounded shrink-0 ${
                      url.is_active
                        ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                        : 'bg-gray-700 text-gray-500 border border-gray-600'
                    }`}
                  >
                    {url.is_active ? 'Activo' : 'Pausado'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(url.id)}
                    className="text-red-400 hover:text-red-300 text-sm shrink-0"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded: Score history chart */}
              {expandedId === url.id && (
                <div className="border-t border-gray-700 p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Evolución del score</h4>
                  {historyLoading ? (
                    <div className="h-32 bg-gray-900 rounded animate-pulse" />
                  ) : history.length > 1 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={history}>
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#9ca3af', fontSize: 10 }}
                          tickFormatter={d => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                        />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                          labelStyle={{ color: '#fff' }}
                          labelFormatter={d => new Date(d).toLocaleDateString('es-ES')}
                        />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      {history.length === 0
                        ? 'Sin datos de monitorización aún. El primer chequeo se ejecutará según la frecuencia configurada.'
                        : 'Se necesitan al menos 2 chequeos para mostrar la gráfica.'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Frecuencia: {FREQ_LABELS[url.frequency] || url.frequency}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
