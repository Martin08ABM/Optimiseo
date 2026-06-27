'use client';

import { useState, useEffect } from 'react';
import { DiscountCodeForm } from '@/src/components/admin/DiscountCodeForm';
import { DiscountCodeTable } from '@/src/components/admin/DiscountCodeTable';

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/discount-codes?includeInactive=true');
      if (!res.ok) throw new Error('No se pudieron cargar los códigos');
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los códigos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Códigos de Descuento</h1>
        <p className="mt-2 text-gray-300">
          Crea y gestiona códigos de descuento para tus usuarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DiscountCodeForm onSuccess={fetchCodes} />
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div
              className="bg-gray-800 border-2 border-gray-600 p-12 rounded-xl shadow-lg text-center"
              role="status"
              aria-live="polite"
            >
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <p className="mt-4 text-gray-300">Cargando códigos…</p>
              <span className="sr-only">Cargando códigos de descuento</span>
            </div>
          ) : error ? (
            <div className="bg-gray-800 border border-red-700/60 p-6 rounded-xl" role="alert">
              <p className="text-red-300 text-sm mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchCodes}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <DiscountCodeTable initialCodes={codes} />
          )}
        </div>
      </div>
    </div>
  );
}
